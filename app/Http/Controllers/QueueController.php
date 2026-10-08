<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Branch;
use App\Models\QueueEvent;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class QueueController extends Controller
{
    public function walkIn(Request $request, Branch $branch): RedirectResponse
    {
        $this->authorizeBranch($request, $branch);
        abort_unless($branch->queue_enabled, 422, 'Antrean sedang dijeda.');

        $data = $request->validate([
            'service_id' => ['required', Rule::exists('services', 'id')->where('branch_id', $branch->id)->where('is_active', true)],
            'customer_name' => ['required', 'string', 'max:120'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'customer_email' => ['nullable', 'email', 'max:255'],
        ]);

        $service = Service::findOrFail($data['service_id']);
        abort_unless($service->allow_walk_ins, 422, 'Layanan ini tidak menerima antrean langsung.');
        $this->authorizeServiceForMember($request, $service);
        $booking = $this->createWalkIn($branch, $service, $data, $request->user()->id);

        return back()->with('success', 'Pelanggan mendapat nomor antrean '.$booking->queue_number.'.');
    }

    public function callNext(Request $request, Branch $branch): RedirectResponse
    {
        $this->authorizeBranch($request, $branch);
        if (! $branch->queue_enabled) {
            return back()->with('error', 'Buka kembali antrean sebelum memanggil pelanggan.');
        }

        $today = now($branch->timezone)->toDateString();
        $tomorrow = now($branch->timezone)->addDay()->toDateString();
        $membership = $request->user()->businessMembership()->first();
        $assignedServiceIds = $membership?->role === 'provider' ? $membership->services()->pluck('services.id')->all() : null;
        $booking = DB::transaction(function () use ($branch, $today, $tomorrow, $request, $assignedServiceIds) {
            $lockedBranch = Branch::query()->whereKey($branch->id)->lockForUpdate()->firstOrFail();
            $next = $lockedBranch->bookings()
                ->where('queue_date', '>=', $today)
                ->where('queue_date', '<', $tomorrow)
                ->where('status', 'waiting')
                ->when($assignedServiceIds !== null, fn ($query) => $query->whereIn('service_id', $assignedServiceIds))
                ->orderByRaw('COALESCE(checked_in_at, created_at)')
                ->orderBy('queue_number')
                ->lockForUpdate()
                ->first();

            if (! $next) {
                return null;
            }

            $from = $next->status;
            $next->update(['status' => 'called', 'called_at' => now(), 'call_count' => $next->call_count + 1]);
            $this->event($next, $request->user()->id, $from, 'called', 'call_next');

            return $next;
        });

        return back()->with($booking ? 'success' : 'error', $booking ? 'Memanggil '.$booking->customer_name.'.' : 'Belum ada pelanggan yang menunggu.');
    }

    public function act(Request $request, Booking $booking, string $action): RedirectResponse
    {
        $message = DB::transaction(function () use ($request, $booking, $action) {
            // Keep the same branch-before-booking lock order used by reservation changes
            // and queue creation to avoid deadlocks while a reservation is checked in.
            if ($action === 'check-in') {
                Branch::query()->whereKey($booking->branch_id)->lockForUpdate()->firstOrFail();
            }

            $locked = Booking::query()->with('branch')->whereKey($booking->id)->lockForUpdate()->firstOrFail();
            $this->authorizeBooking($request, $locked);
            $today = now($locked->branch->timezone)->toDateString();
            abort_unless($locked->queue_date->toDateString() === $today, 422, 'Tindakan ini hanya tersedia untuk antrean hari ini.');

            $from = $locked->status;
            $updates = match ($action) {
                'check-in' => $this->checkIn($locked),
                'recall' => $this->recall($locked),
                'start' => $this->startService($locked),
                'complete' => $this->completeService($locked),
                'no-show' => $this->markNoShow($locked),
                'cancel' => $this->cancelBooking($locked),
                default => abort(404),
            };

            $locked->update($updates);
            $this->event($locked, $request->user()->id, $from, $locked->fresh()->status, $action);

            return $this->actionMessage($action, $locked);
        });

        return back()->with('success', $message);
    }

    public function toggle(Request $request, Branch $branch): RedirectResponse
    {
        $this->authorizeBranch($request, $branch);
        $canManageQueue = $request->user()->business()->whereKey($branch->business_id)->exists()
            || $request->user()->businessMembership()->where('business_id', $branch->business_id)->where('role', 'operator')->exists();
        abort_unless($canManageQueue, 403);
        $enabled = DB::transaction(function () use ($branch) {
            $locked = Branch::query()->whereKey($branch->id)->lockForUpdate()->firstOrFail();
            $locked->update(['queue_enabled' => ! $locked->queue_enabled]);

            return $locked->queue_enabled;
        });

        return back()->with('success', $enabled ? 'Antrean dibuka kembali.' : 'Antrean dijeda. Tiket yang sudah ada tetap tersimpan.');
    }

    private function checkIn(Booking $booking): array
    {
        abort_unless($booking->status === 'scheduled', 422, 'Reservasi ini tidak dapat check-in.');
        abort_unless($booking->scheduled_for->setTimezone($booking->branch->timezone)->isToday(), 422, 'Check-in hanya tersedia pada tanggal reservasi.');

        $queueDate = now($booking->branch->timezone)->toDateString();
        $nextQueueDate = now($booking->branch->timezone)->addDay()->toDateString();
        $lastNumber = Booking::query()
            ->where('branch_id', $booking->branch_id)
            ->where('service_id', $booking->service_id)
            ->where('queue_date', '>=', $queueDate)
            ->where('queue_date', '<', $nextQueueDate)
            ->lockForUpdate()
            ->max('queue_number') ?? 0;

        return [
            'status' => 'waiting',
            'queue_date' => $queueDate,
            'queue_number' => $lastNumber + 1,
            'checked_in_at' => now(),
        ];
    }

    private function recall(Booking $booking): array
    {
        abort_unless($booking->status === 'called', 422, 'Hanya antrean yang sedang dipanggil yang dapat dipanggil ulang.');
        abort_unless($booking->call_count < $booking->branch->max_call_attempts, 422, 'Batas panggilan sudah tercapai. Tandai tidak hadir atau mulai layanan.');

        return ['called_at' => now(), 'call_count' => $booking->call_count + 1];
    }

    private function startService(Booking $booking): array
    {
        abort_unless($booking->status === 'called', 422, 'Pelanggan harus dipanggil sebelum layanan dimulai.');

        return ['status' => 'in_service', 'service_started_at' => now()];
    }

    private function completeService(Booking $booking): array
    {
        abort_unless($booking->status === 'in_service', 422, 'Layanan belum dimulai.');

        return ['status' => 'completed', 'service_completed_at' => now()];
    }

    private function markNoShow(Booking $booking): array
    {
        abort_unless($booking->status === 'called', 422, 'Pelanggan hanya dapat ditandai tidak hadir setelah dipanggil.');
        $eligibleAt = $booking->called_at?->copy()->addMinutes($booking->branch->call_grace_minutes);
        abort_unless($eligibleAt && now()->greaterThanOrEqualTo($eligibleAt), 422, 'Tunggu masa toleransi '.$booking->branch->call_grace_minutes.' menit setelah pemanggilan sebelum menandai tidak hadir.');

        return ['status' => 'no_show'];
    }

    private function cancelBooking(Booking $booking): array
    {
        abort_unless(in_array($booking->status, ['scheduled', 'waiting', 'called'], true), 422, 'Reservasi tidak dapat dibatalkan pada status ini.');

        return ['status' => 'cancelled', 'cancelled_at' => now()];
    }

    private function createWalkIn(Branch $branch, Service $service, array $data, int $userId): Booking
    {
        return DB::transaction(function () use ($branch, $service, $data, $userId) {
            $lockedBranch = Branch::query()->whereKey($branch->id)->lockForUpdate()->firstOrFail();
            $reason = $lockedBranch->walkInUnavailableReason($service);
            if ($reason) {
                throw ValidationException::withMessages(['customer_name' => $reason]);
            }
            $today = now($branch->timezone)->toDateString();
            $tomorrow = now($branch->timezone)->addDay()->toDateString();
            $lastNumber = $branch->bookings()
                ->where('service_id', $service->id)
                ->where('queue_date', '>=', $today)
                ->where('queue_date', '<', $tomorrow)
                ->lockForUpdate()
                ->max('queue_number') ?? 0;
            $booking = Booking::create([
                'branch_id' => $branch->id,
                'service_id' => $service->id,
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_email' => $data['customer_email'] ?? null,
                'booking_code' => $this->bookingCode(),
                'access_token' => (string) Str::uuid(),
                'type' => 'walk_in',
                'scheduled_for' => now(),
                'queue_date' => $today,
                'queue_number' => $lastNumber + 1,
                'status' => 'waiting',
                'checked_in_at' => now(),
            ]);
            $this->event($booking, $userId, null, 'waiting', 'walk_in_registered');

            return $booking;
        });
    }

    private function authorizeBranch(Request $request, Branch $branch): void
    {
        abort_unless($request->user()->canAccessBranch($branch), 404);
    }

    private function authorizeBooking(Request $request, Booking $booking): void
    {
        abort_unless($booking->branch && $request->user()->canAccessBranch($booking->branch), 404);
        $membership = $request->user()->businessMembership()->first();
        if ($membership?->role === 'provider') {
            abort_unless($membership->services()->whereKey($booking->service_id)->exists(), 404);
        }
    }

    private function authorizeServiceForMember(Request $request, Service $service): void
    {
        $membership = $request->user()->businessMembership()->first();
        if ($membership?->role === 'provider') {
            abort_unless($membership->services()->whereKey($service->id)->exists(), 403);
        }
    }

    private function event(Booking $booking, ?int $userId, ?string $from, ?string $to, string $action): void
    {
        QueueEvent::create([
            'booking_id' => $booking->id,
            'user_id' => $userId,
            'from_status' => $from,
            'to_status' => $to,
            'action' => $action,
        ]);
    }

    private function bookingCode(): string
    {
        do {
            $code = 'AT-'.strtoupper(Str::random(6));
        } while (Booking::where('booking_code', $code)->exists());

        return $code;
    }

    private function actionMessage(string $action, Booking $booking): string
    {
        return match ($action) {
            'check-in' => 'Reservasi '.$booking->booking_code.' masuk ke antrean.',
            'recall' => 'Pelanggan dipanggil ulang.',
            'start' => 'Layanan dimulai.',
            'complete' => 'Layanan selesai.',
            'no-show' => 'Pelanggan ditandai tidak hadir.',
            'cancel' => 'Reservasi dibatalkan.',
            default => 'Antrean diperbarui.',
        };
    }
}
