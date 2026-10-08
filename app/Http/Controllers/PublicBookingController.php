<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Branch;
use App\Models\Business;
use App\Models\BusinessMember;
use App\Models\QueueEvent;
use App\Models\Service;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PublicBookingController extends Controller
{
    public function show(Request $request, Business $business): Response
    {
        abort_unless($business->is_active, 404);

        $branches = $business->branches()->with(['services' => fn ($query) => $query->where('is_active', true)])->orderBy('id')->get();
        $branchId = $request->integer('branch');
        $branch = $branches->firstWhere('id', $branchId) ?? $branches->first();
        abort_unless($branch, 404);

        $services = $branch->services;
        $serviceId = $request->integer('service');
        $service = $services->firstWhere('id', $serviceId) ?? $services->first();
        $dateString = $request->query('date');
        try {
            $date = $dateString ? Carbon::parse($dateString, $branch->timezone)->startOfDay() : now($branch->timezone)->startOfDay();
        } catch (\Throwable) {
            $date = now($branch->timezone)->startOfDay();
        }

        return Inertia::render('public/booking', [
            'business' => ['name' => $business->name, 'slug' => $business->slug, 'category' => $business->category, 'phone' => $business->phone],
            'branches' => $branches->map(fn (Branch $item) => [
                'id' => $item->id,
                'name' => $item->name,
                'address' => $item->address,
                'timezone' => $item->timezone,
                'queue_enabled' => $item->queue_enabled,
                'accepts_appointments' => $item->accepts_appointments,
                'opening_time' => substr($item->opening_time, 0, 5),
                'closing_time' => substr($item->closing_time, 0, 5),
                'working_days' => $item->working_days,
                'closed_dates' => $item->closed_dates ?? [],
                'booking_advance_days' => $item->booking_advance_days,
                'cancellation_cutoff_minutes' => $item->cancellation_cutoff_minutes,
                'services' => $item->services->map(fn (Service $itemService) => [
                    'id' => $itemService->id,
                    'name' => $itemService->name,
                    'description' => $itemService->description,
                    'duration_minutes' => $itemService->duration_minutes,
                    'buffer_minutes' => $itemService->buffer_minutes,
                    'slot_capacity' => $itemService->slot_capacity,
                    'allow_walk_ins' => $itemService->allow_walk_ins,
                ]),
            ]),
            'selected_branch_id' => $branch->id,
            'selected_service_id' => $service?->id,
            'selected_date' => $date->toDateString(),
            'walk_in_unavailable_reason' => $service ? $branch->walkInUnavailableReason($service) : 'Pilih layanan terlebih dahulu untuk melihat ketersediaan antrean langsung.',
            'available_slots' => $service && $branch->accepts_appointments ? $this->availableSlots($branch, $service, $date) : [],
            'today' => now($branch->timezone)->toDateString(),
            'max_booking_date' => now($branch->timezone)->addDays($branch->booking_advance_days)->toDateString(),
        ]);
    }

    public function store(Request $request, Business $business): RedirectResponse
    {
        abort_unless($business->is_active, 404);

        $data = $request->validate([
            'branch_id' => ['required', Rule::exists('branches', 'id')->where('business_id', $business->id)],
            'service_id' => ['required', Rule::exists('services', 'id')->where('is_active', true)],
            'type' => ['required', Rule::in(['appointment', 'walk_in'])],
            'scheduled_for' => ['nullable', 'date'],
            'customer_name' => ['required', 'string', 'max:120'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'customer_email' => ['nullable', 'email', 'max:255'],
        ]);

        $branch = $business->branches()->findOrFail($data['branch_id']);
        $service = $branch->services()->where('is_active', true)->findOrFail($data['service_id']);
        $type = $data['type'];

        if ($type === 'walk_in') {
            $reason = $branch->walkInUnavailableReason($service);
            if ($reason) {
                throw ValidationException::withMessages(['type' => $reason]);
            }
        } else {
            abort_unless($branch->accepts_appointments, 422, 'Cabang ini belum menerima reservasi.');
            abort_unless(! empty($data['scheduled_for']), 422, 'Pilih jadwal reservasi.');
        }

        $scheduledLocal = $type === 'walk_in'
            ? now($branch->timezone)
            : Carbon::parse($data['scheduled_for'], $branch->timezone);

        if ($type === 'appointment') {
            $this->validateSlot($branch, $service, $scheduledLocal);
        }

        $booking = DB::transaction(function () use ($branch, $service, $data, $type, $scheduledLocal) {
            $lockedBranch = Branch::query()->whereKey($branch->id)->lockForUpdate()->firstOrFail();
            if ($type === 'appointment') {
                // Recheck capacity while holding the branch lock so simultaneous requests cannot overbook a slot.
                $this->validateSlot($branch, $service, $scheduledLocal);
            } else {
                $reason = $lockedBranch->walkInUnavailableReason($service);
                if ($reason) {
                    throw ValidationException::withMessages(['type' => $reason]);
                }
            }
            $currentScheduledLocal = $type === 'walk_in' ? now($lockedBranch->timezone) : $scheduledLocal;
            $queueDate = $currentScheduledLocal->toDateString();
            $queueNumber = null;

            if ($type === 'walk_in') {
                $nextQueueDate = $currentScheduledLocal->copy()->addDay()->toDateString();
                $last = Booking::query()
                    ->where('branch_id', $branch->id)
                    ->where('service_id', $service->id)
                    ->where('queue_date', '>=', $queueDate)
                    ->where('queue_date', '<', $nextQueueDate)
                    ->lockForUpdate()
                    ->max('queue_number') ?? 0;
                $queueNumber = $last + 1;
            }

            $booking = Booking::create([
                'branch_id' => $branch->id,
                'service_id' => $service->id,
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_email' => $data['customer_email'] ?? null,
                'booking_code' => $this->bookingCode(),
                'access_token' => (string) Str::uuid(),
                'type' => $type,
                'scheduled_for' => $currentScheduledLocal->copy()->setTimezone(config('app.timezone')),
                'queue_date' => $queueDate,
                'queue_number' => $queueNumber,
                'status' => $type === 'walk_in' ? 'waiting' : 'scheduled',
                'checked_in_at' => $type === 'walk_in' ? now() : null,
            ]);

            QueueEvent::create([
                'booking_id' => $booking->id,
                'user_id' => null,
                'from_status' => null,
                'to_status' => $booking->status,
                'action' => $type === 'walk_in' ? 'public_walk_in' : 'appointment_created',
            ]);

            return $booking;
        });

        return redirect('/status/'.$booking->access_token);
    }

    public function status(string $token): Response
    {
        $booking = Booking::with(['branch.business', 'service'])->where('access_token', $token)->firstOrFail();
        $position = null;
        $waitMin = null;

        if (in_array($booking->status, ['waiting', 'called', 'in_service'], true) && $booking->queue_number) {
            $queueDate = $booking->queue_date->toDateString();
            $nextQueueDate = Carbon::parse($queueDate)->addDay()->toDateString();
            $activeQueue = Booking::query()
                ->where('branch_id', $booking->branch_id)
                ->where('service_id', $booking->service_id)
                ->where('queue_date', '>=', $queueDate)
                ->where('queue_date', '<', $nextQueueDate)
                ->whereIn('status', ['waiting', 'called', 'in_service'])
                ->whereNotNull('queue_number')
                ->orderBy('queue_number')
                ->get(['queue_number', 'status', 'service_started_at']);

            $ahead = $activeQueue->filter(fn (Booking $item) => $item->queue_number < $booking->queue_number)->values();
            $hasBeenCalled = in_array($booking->status, ['called', 'in_service'], true);
            $position = $hasBeenCalled ? 0 : $ahead->count() + 1;

            // Appointment slot capacity is not the same as staffed service capacity.
            // Estimate workload across providers explicitly assigned to this service.
            $providerCount = BusinessMember::query()
                ->where('business_id', $booking->branch->business_id)
                ->where('role', 'provider')
                ->whereHas('services', fn ($query) => $query->where('services.id', $booking->service_id))
                ->count();
            $lanes = array_fill(0, max(1, $providerCount), 0);

            foreach ($ahead as $item) {
                $durationSeconds = (int) $booking->service->duration_minutes * 60;
                $bufferSeconds = (int) $booking->service->buffer_minutes * 60;
                $workSeconds = $durationSeconds + $bufferSeconds;

                if ($item->status === 'in_service' && $item->service_started_at) {
                    $elapsedSeconds = max(0, (int) $item->service_started_at->diffInSeconds(now()));
                    $workSeconds = max(0, $durationSeconds - $elapsedSeconds) + $bufferSeconds;
                }

                $laneIndex = array_search(min($lanes), $lanes, true);
                $lanes[$laneIndex === false ? 0 : $laneIndex] += $workSeconds;
            }

            $waitMin = $hasBeenCalled ? 0 : max(0, (int) ceil(min($lanes) / 60));
        }

        $branch = $booking->branch;

        return Inertia::render('public/status', [
            'booking' => [
                'id' => $booking->id,
                'code' => $booking->booking_code,
                'customer_name' => $booking->customer_name,
                'customer_phone' => $booking->customer_phone,
                'type' => $booking->type,
                'status' => $booking->status,
                'queue_number' => $booking->queue_number,
                'scheduled_for' => $booking->scheduled_for->setTimezone($branch->timezone)->format('Y-m-d H:i'),
                'scheduled_label' => $booking->scheduled_for->setTimezone($branch->timezone)->translatedFormat('l, d F · H:i'),
                'branch_name' => $branch->name,
                'address' => $branch->address,
                'business_name' => $branch->business->name,
                'service_name' => $booking->service->name,
                'can_cancel' => $booking->status === 'waiting' || ($booking->status === 'scheduled' && $this->withinChangeWindow($booking, $branch)),
                'can_reschedule' => $booking->status === 'scheduled' && $this->withinChangeWindow($booking, $branch),
                'cancellation_cutoff_minutes' => (int) $branch->cancellation_cutoff_minutes,
                'timezone' => $branch->timezone,
                'token' => $booking->access_token,
            ],
            'queue_position' => $position,
            'wait_min' => $waitMin,
            'wait_max' => $waitMin === null ? null : $waitMin + 10,
            'wait_note' => $waitMin === null ? null : 'Perkiraan berdasarkan antrean aktif, durasi layanan, dan petugas yang ditugaskan. Waktu dapat berubah.',
            'refreshed_at' => now($branch->timezone)->format('H:i:s'),
            'flash' => request()->session()->get('success'),
        ]);
    }

    public function cancel(Request $request, string $token): RedirectResponse
    {
        $booking = Booking::where('access_token', $token)->firstOrFail();
        DB::transaction(function () use ($booking) {
            $locked = Booking::query()->whereKey($booking->id)->lockForUpdate()->firstOrFail();
            $locked->load('branch');
            abort_unless(in_array($locked->status, ['scheduled', 'waiting'], true), 422, 'Reservasi tidak dapat dibatalkan pada status ini.');
            abort_unless($locked->status !== 'scheduled' || $this->withinChangeWindow($locked, $locked->branch), 422, 'Batas pembatalan sudah lewat. Hubungi cabang untuk bantuan.');
            $from = $locked->status;
            $locked->update(['status' => 'cancelled', 'cancelled_at' => now()]);
            QueueEvent::create(['booking_id' => $locked->id, 'from_status' => $from, 'to_status' => 'cancelled', 'action' => 'customer_cancelled']);
        });

        return back()->with('success', 'Reservasi berhasil dibatalkan.');
    }

    public function reschedule(Request $request, string $token): RedirectResponse
    {
        $booking = Booking::with('branch')->where('access_token', $token)->firstOrFail();
        $data = $request->validate(['scheduled_for' => ['required', 'date']]);

        DB::transaction(function () use ($booking, $data) {
            $lockedBranch = Branch::query()->whereKey($booking->branch_id)->lockForUpdate()->firstOrFail();
            $locked = Booking::query()->with(['branch', 'service'])->whereKey($booking->id)->lockForUpdate()->firstOrFail();
            abort_unless($locked->status === 'scheduled', 422, 'Hanya reservasi yang belum check-in yang dapat diubah jadwalnya.');
            abort_unless($lockedBranch->accepts_appointments, 422, 'Cabang ini sedang tidak menerima perubahan jadwal.');
            abort_unless($this->withinChangeWindow($locked, $lockedBranch), 422, 'Batas perubahan jadwal sudah lewat. Hubungi cabang untuk bantuan.');
            $local = Carbon::parse($data['scheduled_for'], $lockedBranch->timezone);
            $this->validateSlot($lockedBranch, $locked->service, $local, $locked->id);
            $from = $locked->status;
            $locked->update([
                'scheduled_for' => $local->copy()->setTimezone(config('app.timezone')),
                'queue_date' => $local->toDateString(),
            ]);
            QueueEvent::create(['booking_id' => $locked->id, 'from_status' => $from, 'to_status' => $from, 'action' => 'customer_rescheduled']);
        });

        return back()->with('success', 'Jadwal reservasi berhasil diperbarui.');
    }

    private function availableSlots(Branch $branch, Service $service, CarbonInterface $date): array
    {
        $weekday = (int) $date->dayOfWeekIso;
        if (! in_array($weekday, $branch->working_days ?? [], true)
            || in_array($date->toDateString(), $branch->closed_dates ?? [], true)
            || $date->gt(now($branch->timezone)->addDays($branch->booking_advance_days)->startOfDay())) {
            return [];
        }

        $cursor = $date->copy()->setTimeFromTimeString($branch->opening_time);
        $slotInterval = $service->duration_minutes + $service->buffer_minutes;
        $closing = $date->copy()->setTimeFromTimeString($branch->closing_time);
        $slots = [];

        while ($cursor->copy()->addMinutes($service->duration_minutes)->lte($closing)) {
            if ($cursor->isAfter(now($branch->timezone))) {
                $storedTime = $cursor->copy()->setTimezone(config('app.timezone'))->format('Y-m-d H:i:s');
                $reserved = Booking::query()
                    ->where('branch_id', $branch->id)
                    ->where('service_id', $service->id)
                    ->where('scheduled_for', $storedTime)
                    ->whereIn('status', ['scheduled', 'waiting', 'called', 'in_service'])
                    ->count();
                if ($reserved < $service->slot_capacity) {
                    $slots[] = ['value' => $cursor->format('Y-m-d\TH:i'), 'label' => $cursor->format('H:i')];
                }
            }
            $cursor = $cursor->addMinutes($slotInterval);
        }

        return $slots;
    }

    private function validateSlot(Branch $branch, Service $service, CarbonInterface $local, ?int $ignoreBookingId = null): void
    {
        $weekday = (int) $local->dayOfWeekIso;
        abort_unless(in_array($weekday, $branch->working_days ?? [], true), 422, 'Cabang tidak beroperasi pada tanggal yang dipilih.');
        abort_unless(! in_array($local->toDateString(), $branch->closed_dates ?? [], true), 422, 'Cabang tutup pada tanggal yang dipilih.');
        abort_unless($local->copy()->startOfDay()->lte(now($branch->timezone)->addDays($branch->booking_advance_days)->startOfDay()), 422, 'Jadwal hanya dapat dibuat hingga '.$branch->booking_advance_days.' hari ke depan.');

        $opening = $local->copy()->setTimeFromTimeString($branch->opening_time);
        $closing = $local->copy()->setTimeFromTimeString($branch->closing_time);
        abort_unless($local->greaterThan(now($branch->timezone)), 422, 'Pilih jadwal yang akan datang.');
        abort_unless($local->greaterThanOrEqualTo($opening) && $local->copy()->addMinutes($service->duration_minutes)->lessThanOrEqualTo($closing), 422, 'Jadwal harus berada di dalam jam operasional.');

        $offset = (int) $opening->diffInMinutes($local);
        abort_unless($offset % ($service->duration_minutes + $service->buffer_minutes) === 0, 422, 'Pilih salah satu slot jadwal yang tersedia.');

        $storedTime = $local->copy()->setTimezone(config('app.timezone'))->format('Y-m-d H:i:s');
        $query = Booking::query()
            ->where('branch_id', $branch->id)
            ->where('service_id', $service->id)
            ->where('scheduled_for', $storedTime)
            ->whereIn('status', ['scheduled', 'waiting', 'called', 'in_service']);
        if ($ignoreBookingId) {
            $query->where('id', '<>', $ignoreBookingId);
        }
        abort_if($query->count() >= $service->slot_capacity, 422, 'Slot tersebut sudah penuh. Silakan pilih jadwal lain.');
    }

    private function withinChangeWindow(Booking $booking, Branch $branch): bool
    {
        if ($booking->type !== 'appointment') {
            return true;
        }

        $cutoff = max(0, (int) $branch->cancellation_cutoff_minutes);

        return now()->lessThan($booking->scheduled_for->copy()->subMinutes($cutoff));
    }

    private function bookingCode(): string
    {
        do {
            $code = 'AT-'.strtoupper(Str::random(6));
        } while (Booking::where('booking_code', $code)->exists());

        return $code;
    }
}
