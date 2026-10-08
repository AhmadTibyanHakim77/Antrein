<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Branch;
use App\Models\Business;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class QueueWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_reservation_moves_through_check_in_call_start_and_completion(): void
    {
        $this->travelTo(Carbon::parse('2026-10-08 10:00:00', 'Asia/Jakarta'));
        [$owner, $branch, $service] = $this->createBusinessAndService();
        $booking = Booking::query()->create([
            'branch_id' => $branch->id,
            'service_id' => $service->id,
            'customer_name' => 'Pelanggan Uji',
            'customer_phone' => '081234567890',
            'booking_code' => 'AT-WORKFLOW',
            'access_token' => (string) Str::uuid(),
            'type' => 'appointment',
            'scheduled_for' => now($branch->timezone)->addHour()->setTimezone('UTC'),
            'queue_date' => now($branch->timezone)->toDateString(),
            'status' => 'scheduled',
        ]);

        $this->actingAs($owner)
            ->post("/bookings/{$booking->id}/actions/check-in")
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'waiting',
            'queue_number' => 1,
        ]);

        $this->post(route('queue.next', $branch))
            ->assertRedirect()
            ->assertSessionHas('success');
        $this->assertDatabaseHas('bookings', ['id' => $booking->id, 'status' => 'called']);

        $this->post("/bookings/{$booking->id}/actions/start")
            ->assertRedirect()
            ->assertSessionHas('success');
        $this->assertDatabaseHas('bookings', ['id' => $booking->id, 'status' => 'in_service']);

        $this->post("/bookings/{$booking->id}/actions/complete")
            ->assertRedirect()
            ->assertSessionHas('success');
        $this->assertDatabaseHas('bookings', ['id' => $booking->id, 'status' => 'completed']);

        $this->assertDatabaseCount('queue_events', 4);
    }

    public function test_staff_cannot_change_a_booking_from_another_business(): void
    {
        $this->travelTo(Carbon::parse('2026-10-08 10:00:00', 'Asia/Jakarta'));
        [$owner] = $this->createBusinessAndService('Usaha Pemilik', 'usaha-pemilik');
        [, $branch, $service] = $this->createBusinessAndService('Usaha Lain', 'usaha-lain');
        $booking = Booking::query()->create([
            'branch_id' => $branch->id,
            'service_id' => $service->id,
            'customer_name' => 'Pelanggan Uji',
            'customer_phone' => '081234567890',
            'booking_code' => 'AT-ISOLATION',
            'access_token' => (string) Str::uuid(),
            'type' => 'walk_in',
            'scheduled_for' => now($branch->timezone),
            'queue_date' => now($branch->timezone)->toDateString(),
            'queue_number' => 1,
            'status' => 'waiting',
            'checked_in_at' => now(),
        ]);

        $this->actingAs($owner)
            ->post("/bookings/{$booking->id}/actions/start")
            ->assertNotFound();

        $this->assertDatabaseHas('bookings', ['id' => $booking->id, 'status' => 'waiting']);
    }

    /** @return array{User, Branch, Service} */
    private function createBusinessAndService(string $name = 'Usaha Uji', string $slug = 'usaha-uji'): array
    {
        $owner = User::factory()->create();
        $business = Business::create([
            'user_id' => $owner->id,
            'name' => $name,
            'slug' => $slug,
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

        return [$owner, $branch, $service];
    }
}
