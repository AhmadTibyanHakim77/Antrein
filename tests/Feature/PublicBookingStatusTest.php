<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Branch;
use App\Models\Business;
use App\Models\BusinessMember;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicBookingStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_wait_estimate_uses_remaining_service_work_and_assigned_providers_not_slot_capacity(): void
    {
        $this->travelTo(Carbon::parse('2026-10-08 10:10:00', 'Asia/Jakarta'));
        [$branch, $service] = $this->createBusinessAndService();
        $service->update([
            'duration_minutes' => 30,
            'buffer_minutes' => 5,
            'slot_capacity' => 4,
        ]);

        $startedAt = Carbon::parse('2026-10-08 10:00:00', 'Asia/Jakarta')->setTimezone('UTC');
        $this->createBooking($branch, $service, 1, 'in_service', $startedAt, $startedAt);
        $waiting = $this->createBooking($branch, $service, 2, 'waiting', now(), null);

        $this->get(route('public.booking.status', $waiting->access_token))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/status')
                ->where('queue_position', 2)
                ->where('wait_min', 25)
                ->where('wait_max', 35)
                ->where('wait_note', 'Perkiraan berdasarkan antrean aktif, durasi layanan, dan petugas yang ditugaskan. Waktu dapat berubah.')
            );
    }

    public function test_wait_estimate_accounts_for_parallel_providers_assigned_to_the_service(): void
    {
        $this->travelTo(Carbon::parse('2026-10-08 10:10:00', 'Asia/Jakarta'));
        [$branch, $service] = $this->createBusinessAndService();

        for ($index = 1; $index <= 2; $index++) {
            $provider = User::factory()->create();
            $membership = BusinessMember::query()->create([
                'business_id' => $branch->business_id,
                'user_id' => $provider->id,
                'branch_id' => $branch->id,
                'role' => 'provider',
                'joined_at' => now(),
            ]);
            $membership->services()->attach($service->id);
        }

        $startedAt = Carbon::parse('2026-10-08 10:00:00', 'Asia/Jakarta')->setTimezone('UTC');
        $this->createBooking($branch, $service, 1, 'in_service', $startedAt, $startedAt);
        $waiting = $this->createBooking($branch, $service, 2, 'waiting', now(), null);

        $this->get(route('public.booking.status', $waiting->access_token))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/status')
                ->where('queue_position', 2)
                ->where('wait_min', 0)
                ->where('wait_max', 10)
            );
    }

    /** @return array{Branch, Service} */
    private function createBusinessAndService(): array
    {
        $owner = User::factory()->create();
        $business = Business::create([
            'user_id' => $owner->id,
            'name' => 'Usaha Status Uji',
            'slug' => 'usaha-status-uji',
            'category' => 'other',
            'is_active' => true,
        ]);
        $branch = $business->branches()->create([
            'name' => 'Cabang Utama',
            'slug' => 'cabang-utama',
            'address' => 'Jalan Uji 1',
            'timezone' => 'Asia/Jakarta',
            'opening_time' => '09:00',
            'closing_time' => '17:00',
            'working_days' => [1, 2, 3, 4, 5, 6, 7],
            'queue_enabled' => true,
            'accepts_appointments' => true,
        ]);
        $service = $branch->services()->create([
            'name' => 'Layanan Uji',
            'duration_minutes' => 30,
            'buffer_minutes' => 0,
            'slot_capacity' => 1,
            'allow_walk_ins' => true,
            'is_active' => true,
        ]);

        return [$branch, $service];
    }

    private function createBooking(Branch $branch, Service $service, int $number, string $status, CarbonInterface $scheduledFor, ?CarbonInterface $serviceStartedAt): Booking
    {
        return Booking::query()->create([
            'branch_id' => $branch->id,
            'service_id' => $service->id,
            'customer_name' => 'Pelanggan Uji',
            'customer_phone' => '081234567890',
            'booking_code' => 'AT-STATUS-'.str_pad((string) $number, 2, '0', STR_PAD_LEFT),
            'access_token' => (string) Str::uuid(),
            'type' => 'walk_in',
            'scheduled_for' => $scheduledFor,
            'queue_date' => '2026-10-08',
            'queue_number' => $number,
            'status' => $status,
            'checked_in_at' => $scheduledFor,
            'service_started_at' => $serviceStartedAt,
        ]);
    }
}
