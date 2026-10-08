<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Branch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $business = $user->businessContext();

        if (! $business) {
            return redirect('/setup');
        }

        $membership = $user->businessMembership()->first();
        $accessibleBranches = $business->branches()->with('services')->when($membership?->branch_id, fn ($query) => $query->whereKey($membership->branch_id))->get();
        $branchId = $request->integer('branch_id');
        $branch = $accessibleBranches->firstWhere('id', $branchId) ?? $accessibleBranches->first();

        if (! $branch) {
            return redirect('/setup')->with('error', 'Tambahkan cabang untuk mulai mengelola antrean.');
        }

        $today = now($branch->timezone)->toDateString();
        $assignedServiceIds = $membership?->role === 'provider'
            ? $membership->services()->pluck('services.id')->map(fn ($id) => (int) $id)->all()
            : null;
        $tomorrow = now($branch->timezone)->addDay()->toDateString();
        $base = Booking::query()->where('branch_id', $branch->id)
            ->where('queue_date', '>=', $today)
            ->where('queue_date', '<', $tomorrow)
            ->when($assignedServiceIds !== null, fn ($query) => $query->whereIn('service_id', $assignedServiceIds));

        $activeTickets = (clone $base)
            ->whereIn('status', ['waiting', 'called', 'in_service'])
            ->with('service:id,name,duration_minutes')
            ->orderByRaw('CASE WHEN status = ? THEN 0 WHEN status = ? THEN 1 ELSE 2 END', ['in_service', 'called'])
            ->orderBy('queue_number')
            ->get();

        $appointments = (clone $base)
            ->where('status', 'scheduled')
            ->with('service:id,name,duration_minutes')
            ->orderBy('scheduled_for')
            ->get();

        $completed = (clone $base)->where('status', 'completed')->get(['checked_in_at', 'created_at', 'service_started_at', 'service_completed_at']);
        $durations = $completed->filter(fn (Booking $booking) => $booking->service_started_at && $booking->service_completed_at)
            ->map(fn (Booking $booking) => max(0, (int) round($booking->service_started_at->diffInSeconds($booking->service_completed_at) / 60)));
        $waits = $completed->filter(fn (Booking $booking) => $booking->service_started_at)
            ->map(fn (Booking $booking) => max(0, (int) round(($booking->checked_in_at ?? $booking->created_at)->diffInSeconds($booking->service_started_at) / 60)));

        $stats = [
            'waiting' => (clone $base)->where('status', 'waiting')->count(),
            'in_service' => (clone $base)->where('status', 'in_service')->count(),
            'completed' => (clone $base)->where('status', 'completed')->count(),
            'no_show' => (clone $base)->where('status', 'no_show')->count(),
            'cancelled' => (clone $base)->where('status', 'cancelled')->count(),
            'average_service_minutes' => $durations->isNotEmpty() ? (int) round($durations->average()) : null,
            'average_wait_minutes' => $waits->isNotEmpty() ? (int) round($waits->average()) : null,
        ];

        return Inertia::render('dashboard', [
            'user_name' => $request->user()->name,
            'permissions' => ['manage_business' => $business->user_id === $user->id, 'manage_services' => $business->user_id === $user->id || $membership?->role === 'operator'],
            'business' => ['id' => $business->id, 'name' => $business->name, 'slug' => $business->slug, 'category' => $business->category],
            'branches' => $accessibleBranches->map(fn (Branch $item) => ['id' => $item->id, 'name' => $item->name]),
            'branch' => [
                'id' => $branch->id,
                'name' => $branch->name,
                'address' => $branch->address,
                'queue_enabled' => $branch->queue_enabled,
                'timezone' => $branch->timezone,
                'call_grace_minutes' => $branch->call_grace_minutes,
                'max_call_attempts' => $branch->max_call_attempts,
                'public_url' => '/usaha/'.$business->slug.'?branch='.$branch->id,
                'qr_url' => '/branches/'.$branch->id.'/qr.svg',
            ],
            'services' => $branch->services->where('is_active', true)->when($assignedServiceIds !== null, fn ($services) => $services->whereIn('id', $assignedServiceIds))->values()->map(fn ($service) => [
                'id' => $service->id,
                'name' => $service->name,
                'duration_minutes' => $service->duration_minutes,
                'allow_walk_ins' => $service->allow_walk_ins,
                'walk_in_unavailable_reason' => $branch->walkInUnavailableReason($service),
            ]),
            'tickets' => $activeTickets->map(fn (Booking $booking) => $this->ticketData($booking, $branch)),
            'appointments' => $appointments->map(fn (Booking $booking) => $this->ticketData($booking, $branch)),
            'stats' => $stats,
            'today' => now($branch->timezone)->translatedFormat('l, d F Y'),
            'flash' => $request->session()->get('success'),
            'flash_error' => $request->session()->get('error'),
        ]);
    }

    private function ticketData(Booking $booking, Branch $branch): array
    {
        return [
            'id' => $booking->id,
            'code' => $booking->booking_code,
            'queue_number' => $booking->queue_number,
            'customer_name' => $booking->customer_name,
            'customer_phone' => $booking->customer_phone,
            'service' => $booking->service?->name ?? 'Layanan',
            'status' => $booking->status,
            'type' => $booking->type,
            'scheduled_for' => $booking->scheduled_for->setTimezone($branch->timezone)->format('H:i'),
            'created_at' => $booking->created_at->setTimezone($branch->timezone)->format('H:i'),
            'call_count' => $booking->call_count,
            'can_recall' => $booking->status === 'called' && $booking->call_count < $branch->max_call_attempts,
            'no_show_wait_minutes' => $booking->status === 'called' && $booking->called_at
                ? max(0, (int) ceil(now()->diffInSeconds($booking->called_at->copy()->addMinutes($branch->call_grace_minutes)) / 60))
                : 0,
            'can_mark_no_show' => $booking->status === 'called' && $booking->called_at
                && now()->greaterThanOrEqualTo($booking->called_at->copy()->addMinutes($branch->call_grace_minutes)),
        ];
    }
}
