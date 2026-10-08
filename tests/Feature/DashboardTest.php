<?php

namespace Tests\Feature;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_dashboard_shows_today_queue_tickets(): void
    {
        $this->travelTo(Carbon::parse('2026-10-08 10:00:00', 'Asia/Jakarta'));
        $user = User::factory()->create();
        $this->actingAs($user)
            ->post(route('business.setup.store'), [
                'business_name' => 'Usaha Antrean Uji',
                'category' => 'other',
                'branch_name' => 'Cabang Utama',
                'branch_address' => 'Jalan Uji 1',
                'opening_time' => '09:00',
                'closing_time' => '17:00',
                'working_days' => [1, 2, 3, 4, 5],
            ])
            ->assertRedirect('/dashboard');

        $branch = $user->businessContext()->branches()->firstOrFail();
        $service = $branch->services()->firstOrFail();
        $this->from('/dashboard')->post(route('queue.walk-in', $branch), [
            'service_id' => $service->id,
            'customer_name' => 'Pelanggan Hari Ini',
            'customer_phone' => '081234567890',
        ])->assertRedirect('/dashboard');

        $this->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('stats.waiting', 1)
                ->has('tickets', 1)
                ->where('tickets.0.customer_name', 'Pelanggan Hari Ini')
            );
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user)
            ->post(route('business.setup.store'), [
                'business_name' => 'Usaha Uji',
                'category' => 'other',
                'branch_name' => 'Cabang Utama',
                'branch_address' => 'Jalan Uji 1',
                'opening_time' => '09:00',
                'closing_time' => '17:00',
                'working_days' => [1, 2, 3, 4, 5],
            ])
            ->assertRedirect('/dashboard');

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }
}
