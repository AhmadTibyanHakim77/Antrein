<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Business;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicWalkInAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_public_page_explains_when_walk_ins_are_closed(): void
    {
        $this->travelTo(Carbon::parse('2026-10-08 19:11:00', 'Asia/Jakarta'));
        [$business] = $this->createBusinessAndService();

        $this->get(route('public.business', $business->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/booking')
                ->where('walk_in_unavailable_reason', 'Pendaftaran walk-in hari ini sudah ditutup. Jam layanan berakhir pukul 17:00.')
            );
    }

    public function test_public_walk_in_is_rejected_after_closing_time(): void
    {
        $this->travelTo(Carbon::parse('2026-10-08 19:11:00', 'Asia/Jakarta'));
        [$business, $branch, $service] = $this->createBusinessAndService();

        $this->from(route('public.business', $business->slug))
            ->post(route('public.booking.store', $business->slug), [
                'branch_id' => $branch->id,
                'service_id' => $service->id,
                'type' => 'walk_in',
                'customer_name' => 'Pelanggan Uji',
                'customer_phone' => '081234567890',
            ])
            ->assertRedirect(route('public.business', $business->slug))
            ->assertSessionHasErrors('type');

        $this->assertDatabaseCount('bookings', 0);
    }

    public function test_public_walk_in_can_be_created_during_business_hours(): void
    {
        $this->travelTo(Carbon::parse('2026-10-08 10:00:00', 'Asia/Jakarta'));
        [$business, $branch, $service] = $this->createBusinessAndService();

        $response = $this->post(route('public.booking.store', $business->slug), [
            'branch_id' => $branch->id,
            'service_id' => $service->id,
            'type' => 'walk_in',
            'customer_name' => 'Pelanggan Uji',
            'customer_phone' => '081234567890',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('bookings', [
            'branch_id' => $branch->id,
            'service_id' => $service->id,
            'type' => 'walk_in',
            'status' => 'waiting',
            'queue_number' => 1,
        ]);
    }

    public function test_public_walk_ins_receive_sequential_queue_numbers_on_the_same_day(): void
    {
        $this->travelTo(Carbon::parse('2026-10-08 10:00:00', 'Asia/Jakarta'));
        [$business, $branch, $service] = $this->createBusinessAndService();
        $payload = [
            'branch_id' => $branch->id,
            'service_id' => $service->id,
            'type' => 'walk_in',
            'customer_name' => 'Pelanggan Uji',
            'customer_phone' => '081234567890',
        ];

        $this->post(route('public.booking.store', $business->slug), $payload)->assertRedirect();
        $this->post(route('public.booking.store', $business->slug), $payload)->assertRedirect();

        $this->assertDatabaseCount('bookings', 2);
        $this->assertDatabaseHas('bookings', [
            'branch_id' => $branch->id,
            'service_id' => $service->id,
            'queue_number' => 1,
            'status' => 'waiting',
        ]);
        $this->assertDatabaseHas('bookings', [
            'branch_id' => $branch->id,
            'service_id' => $service->id,
            'queue_number' => 2,
            'status' => 'waiting',
        ]);
    }

    public function test_staff_cannot_add_a_walk_in_after_closing_time(): void
    {
        $this->travelTo(Carbon::parse('2026-10-08 19:11:00', 'Asia/Jakarta'));
        [$business, $branch, $service] = $this->createBusinessAndService();

        $this->actingAs(User::findOrFail($business->user_id))
            ->from('/dashboard')
            ->post(route('queue.walk-in', $branch), [
                'service_id' => $service->id,
                'customer_name' => 'Pelanggan Uji',
                'customer_phone' => '081234567890',
            ])
            ->assertRedirect('/dashboard')
            ->assertSessionHasErrors('customer_name');

        $this->assertDatabaseCount('bookings', 0);
    }

    /** @return array{Business, Branch, Service} */
    private function createBusinessAndService(): array
    {
        $user = User::factory()->create();
        $business = Business::create([
            'user_id' => $user->id,
            'name' => 'Usaha Uji',
            'slug' => 'usaha-uji',
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
            'working_days' => [1, 2, 3, 4, 5],
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

        return [$business, $branch, $service];
    }
}
