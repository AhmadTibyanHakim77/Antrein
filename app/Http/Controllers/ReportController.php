<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Branch;
use App\Models\Business;
use App\Models\BusinessMember;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $context = $this->context($request);
        if (! $context['business']) {
            return redirect('/setup');
        }

        $filters = $this->filters($request, $context);
        $query = $this->bookingsQuery($context, $filters);
        $hasBookings = Booking::query()
            ->whereIn('branch_id', $context['branches']->pluck('id'))
            ->when($context['assigned_service_ids'] !== null, fn ($bookings) => $bookings->whereIn('service_id', $context['assigned_service_ids']))
            ->exists();

        $completed = (clone $query)
            ->where('status', 'completed')
            ->get(['checked_in_at', 'created_at', 'service_started_at', 'service_completed_at']);

        $waitMinutes = $completed
            ->filter(fn (Booking $booking) => $booking->service_started_at !== null)
            ->map(fn (Booking $booking) => max(
                0,
                (int) round(($booking->checked_in_at ?? $booking->created_at)->diffInSeconds($booking->service_started_at, false) / 60),
            ));

        $serviceMinutes = $completed
            ->filter(fn (Booking $booking) => $booking->service_started_at && $booking->service_completed_at)
            ->map(fn (Booking $booking) => max(
                0,
                (int) round($booking->service_started_at->diffInSeconds($booking->service_completed_at, false) / 60),
            ));

        $stats = [
            'total' => (clone $query)->count(),
            'scheduled' => (clone $query)->where('status', 'scheduled')->count(),
            'waiting' => (clone $query)->whereIn('status', ['waiting', 'called', 'in_service'])->count(),
            'paused' => (clone $query)->where('status', 'paused')->count(),
            'completed' => (clone $query)->where('status', 'completed')->count(),
            'cancelled' => (clone $query)->where('status', 'cancelled')->count(),
            'no_show' => (clone $query)->where('status', 'no_show')->count(),
            'average_wait_minutes' => $waitMinutes->isNotEmpty() ? (int) round($waitMinutes->average()) : null,
            'average_service_minutes' => $serviceMinutes->isNotEmpty() ? (int) round($serviceMinutes->average()) : null,
        ];

        $bookings = (clone $query)
            ->with(['branch:id,name,timezone', 'service:id,name'])
            ->orderByDesc('queue_date')
            ->orderByDesc('scheduled_for')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (Booking $booking) => $this->bookingData($booking));

        return Inertia::render('reports/index', [
            'business' => ['name' => $context['business']->name],
            'branches' => $context['branches']->map(fn (Branch $branch) => ['id' => $branch->id, 'name' => $branch->name]),
            'services' => $context['services']->map(fn (Service $service) => [
                'id' => $service->id,
                'branch_id' => $service->branch_id,
                'name' => $service->name,
            ])->values(),
            'staff' => $context['staff'],
            'filters' => $filters,
            'stats' => $stats,
            'has_bookings' => $hasBookings,
            'bookings' => $bookings,
        ]);
    }

    public function export(Request $request): StreamedResponse|RedirectResponse
    {
        $context = $this->context($request);
        if (! $context['business']) {
            return redirect('/setup');
        }

        $filters = $this->filters($request, $context);
        $query = $this->bookingsQuery($context, $filters)
            ->with(['branch:id,name,timezone', 'service:id,name'])
            ->orderBy('queue_date')
            ->orderBy('scheduled_for')
            ->orderBy('id');

        return response()->streamDownload(function () use ($query): void {
            $output = fopen('php://output', 'w');
            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, [
                'Kode reservasi',
                'Tanggal',
                'Waktu',
                'Nama pelanggan',
                'Nomor kontak',
                'Email',
                'Cabang',
                'Layanan',
                'Jenis',
                'Nomor antrean',
                'Status',
                'Check-in',
                'Mulai layanan',
                'Selesai layanan',
            ]);

            $query->chunk(250, function (Collection $rows) use ($output): void {
                foreach ($rows as $booking) {
                    $timezone = $booking->branch->timezone;
                    $values = [
                        $booking->booking_code,
                        $booking->queue_date->format('Y-m-d'),
                        $booking->scheduled_for->setTimezone($timezone)->format('H:i'),
                        $booking->customer_name,
                        $booking->customer_phone,
                        $booking->customer_email,
                        $booking->branch->name,
                        $booking->service->name,
                        $booking->type === 'walk_in' ? 'Antrean langsung' : 'Janji temu',
                        $booking->queue_number,
                        $this->statusLabel($booking->status),
                        $booking->checked_in_at?->setTimezone($timezone)->format('Y-m-d H:i'),
                        $booking->service_started_at?->setTimezone($timezone)->format('Y-m-d H:i'),
                        $booking->service_completed_at?->setTimezone($timezone)->format('Y-m-d H:i'),
                    ];

                    fputcsv($output, array_map(fn ($value) => $this->safeCsvValue($value), $values));
                }
            });

            fclose($output);
        }, 'antrein-laporan-'.$filters['from'].'-'.$filters['to'].'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @return array{
     *   business: Business|null,
     *   membership: BusinessMember|null,
     *   branches: Collection<int, Branch>,
     *   services: Collection<int, Service>,
     *   staff: Collection<int, array{id:int,name:string,role:string,branch_id:int|null}>,
     *   assigned_service_ids: array<int>|null
     * }
     */
    private function context(Request $request): array
    {
        $user = $request->user();
        $business = $user->businessContext();

        if (! $business) {
            return [
                'business' => null,
                'membership' => null,
                'branches' => collect(),
                'services' => collect(),
                'staff' => collect(),
                'assigned_service_ids' => null,
            ];
        }

        $membership = $user->businessMembership()->first();
        $branches = $business->branches()
            ->with('services')
            ->when($membership?->branch_id, fn ($query) => $query->whereKey($membership->branch_id))
            ->get();
        $assignedServiceIds = $membership?->role === 'provider'
            ? $membership->services()->pluck('services.id')->map(fn ($id) => (int) $id)->all()
            : null;
        $services = $branches
            ->flatMap(fn (Branch $branch) => $branch->services)
            ->when($assignedServiceIds !== null, fn (Collection $items) => $items->whereIn('id', $assignedServiceIds))
            ->values();

        $business->loadMissing(['owner', 'members.user']);
        $staff = collect([[
            'id' => (int) $business->user_id,
            'name' => $business->owner?->name ?? 'Pemilik usaha',
            'role' => 'Pemilik',
            'branch_id' => null,
        ]]);

        foreach ($business->members as $member) {
            if ($membership?->branch_id && $member->branch_id && $member->branch_id !== $membership->branch_id) {
                continue;
            }

            $staff->push([
                'id' => (int) $member->user_id,
                'name' => $member->user?->name ?? 'Anggota tim',
                'role' => $member->role === 'provider' ? 'Penyedia layanan' : 'Operator',
                'branch_id' => $member->branch_id,
            ]);
        }

        return [
            'business' => $business,
            'membership' => $membership,
            'branches' => $branches,
            'services' => $services,
            'staff' => $staff->values(),
            'assigned_service_ids' => $assignedServiceIds,
        ];
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array{from:string,to:string,branch_id:int|null,service_id:int|null,staff_id:int|null}
     */
    private function filters(Request $request, array $context): array
    {
        $business = $context['business'];
        $validated = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d'],
            'branch_id' => ['nullable', 'integer'],
            'service_id' => ['nullable', 'integer'],
            'staff_id' => ['nullable', 'integer'],
        ]);

        $branchId = filled($validated['branch_id'] ?? null) ? (int) $validated['branch_id'] : null;
        $branch = $branchId === null ? null : $context['branches']->firstWhere('id', $branchId);
        if ($branchId !== null && ! $branch) {
            abort(404);
        }

        $services = $context['services'];
        if ($branchId !== null) {
            $services = $services->where('branch_id', $branchId);
        }

        $serviceId = filled($validated['service_id'] ?? null) ? (int) $validated['service_id'] : null;
        if ($serviceId !== null && ! $services->contains('id', $serviceId)) {
            abort(404);
        }

        $staff = $context['staff'];
        if ($branchId !== null) {
            $staff = $staff->filter(fn (array $item) => $item['branch_id'] === null || $item['branch_id'] === $branchId);
        }
        $staffId = filled($validated['staff_id'] ?? null) ? (int) $validated['staff_id'] : null;
        if ($staffId !== null && ! $staff->contains('id', $staffId)) {
            abort(404);
        }

        $timezone = $branch?->timezone ?? $context['branches']->first()?->timezone ?? config('app.timezone');
        $today = now($timezone)->toDateString();
        $from = $validated['from'] ?? now($timezone)->subDays(6)->toDateString();
        $to = $validated['to'] ?? $today;

        if ($from > $to) {
            throw ValidationException::withMessages(['to' => 'Tanggal akhir harus sama atau setelah tanggal awal.']);
        }
        if (Carbon::parse($from)->diffInDays(Carbon::parse($to)) > 366) {
            throw ValidationException::withMessages(['to' => 'Rentang laporan maksimal 366 hari.']);
        }

        return [
            'from' => $from,
            'to' => $to,
            'branch_id' => $branchId,
            'service_id' => $serviceId,
            'staff_id' => $staffId,
        ];
    }

    /**
     * @param  array<string, mixed>  $context
     * @param  array{from:string,to:string,branch_id:int|null,service_id:int|null,staff_id:int|null}  $filters
     */
    private function bookingsQuery(array $context, array $filters)
    {
        return Booking::query()
            ->whereIn('branch_id', $context['branches']->pluck('id'))
            ->where('queue_date', '>=', $filters['from'])
            ->where('queue_date', '<', Carbon::parse($filters['to'])->addDay()->toDateString())
            ->when($filters['branch_id'] !== null, fn ($query) => $query->where('branch_id', $filters['branch_id']))
            ->when($filters['service_id'] !== null, fn ($query) => $query->where('service_id', $filters['service_id']))
            ->when($context['assigned_service_ids'] !== null, fn ($query) => $query->whereIn('service_id', $context['assigned_service_ids']))
            ->when($filters['staff_id'] !== null, fn ($query) => $query->whereHas('events', fn ($events) => $events->where('user_id', $filters['staff_id'])));
    }

    private function bookingData(Booking $booking): array
    {
        return [
            'id' => $booking->id,
            'code' => $booking->booking_code,
            'date' => $booking->queue_date->translatedFormat('d M Y'),
            'time' => $booking->scheduled_for->setTimezone($booking->branch->timezone)->format('H:i'),
            'customer_name' => $booking->customer_name,
            'customer_phone' => $booking->customer_phone,
            'service' => $booking->service->name,
            'branch' => $booking->branch->name,
            'type' => $booking->type,
            'queue_number' => $booking->queue_number,
            'status' => $booking->status,
        ];
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            'scheduled' => 'Terjadwal',
            'waiting' => 'Menunggu',
            'called' => 'Dipanggil',
            'in_service' => 'Sedang dilayani',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            'no_show' => 'Tidak hadir',
            'paused' => 'Ditunda',
            default => $status,
        };
    }

    private function safeCsvValue(mixed $value): string
    {
        $value = (string) ($value ?? '');

        return preg_match('/^\s*[=+\-@]/u', $value) ? "'".$value : $value;
    }
}
