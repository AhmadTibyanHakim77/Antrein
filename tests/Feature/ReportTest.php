<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Branch;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_report_summarizes_only_bookings_in_the_selected_dates_and_includes_paused_status(): void
    {
        [$user, $branch, $service] = $this->createBusiness();
        $date = '2026-10-08';

        $this->createBooking($branch, $service, $date, 'completed', 1, 'ANT-REPORT-01', true);
        $this->createBooking($branch, $service, $date, 'scheduled', 2, 'ANT-REPORT-02');
        $this->createBooking($branch, $service, $date, 'called', 3, 'ANT-REPORT-03');
        $this->createBooking($branch, $service, $date, 'paused', 4, 'ANT-REPORT-04');
        $this->createBooking($branch, $service, $date, 'cancelled', 5, 'ANT-REPORT-05');
        $this->createBooking($branch, $service, $date, 'no_show', 6, 'ANT-REPORT-06');
        $this->createBooking($branch, $service, '2026-10-06', 'completed', 7, 'ANT-REPORT-OLD');
        $this->assertSame(7, Booking::query()->count());
        $this->assertSame(6, Booking::query()->where('queue_date', '>=', '2026-10-07')->where('queue_date', '<', '2026-10-09')->count());

        $this->actingAs($user)
            ->get('/reports?from=2026-10-07&to=2026-10-08')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('reports/index')
                ->where('has_bookings', true)
                ->where('stats.total', 6)
                ->where('stats.scheduled', 1)
                ->where('stats.waiting', 1)
                ->where('stats.paused', 1)
                ->where('stats.completed', 1)
                ->where('stats.cancelled', 1)
                ->where('stats.no_show', 1)
                ->where('stats.average_wait_minutes', 10)
                ->where('stats.average_service_minutes', 15)
                ->where('bookings.total', 6)
            );
    }

    public function test_report_marks_an_empty_business_without_claiming_that_filters_removed_data(): void
    {
        [$user] = $this->createBusiness();

        $this->actingAs($user)
            ->get('/reports?from=2026-10-07&to=2026-10-08')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('reports/index')
                ->where('has_bookings', false)
                ->where('stats.total', 0)
                ->where('bookings.total', 0)
            );
    }

    public function test_csv_export_uses_the_selected_date_range(): void
    {
        [$user, $branch, $service] = $this->createBusiness();
        $this->createBooking($branch, $service, '2026-10-08', 'waiting', 1, 'ANT-EXPORT-IN');
        $this->createBooking($branch, $service, '2026-10-06', 'waiting', 2, 'ANT-EXPORT-OUT');

        $response = $this->actingAs($user)
            ->get('/reports/export?from=2026-10-07&to=2026-10-08');

        $response->assertDownload('antrein-laporan-2026-10-07-2026-10-08.csv');
        $csv = $response->streamedContent();

        $this->assertStringContainsString('ANT-EXPORT-IN', $csv);
        $this->assertStringNotContainsString('ANT-EXPORT-OUT', $csv);
    }

    /** @return array{User, Branch, Service} */
    private function createBusiness(): array
    {
        $user = User::factory()->create();
        $this->actingAs($user)->post(route('business.setup.store'), [
            'business_name' => 'Usaha Laporan Uji',
            'category' => 'other',
            'branch_name' => 'Cabang Laporan',
            'branch_address' => 'Jalan Uji 1',
            'opening_time' => '09:00',
            'closing_time' => '17:00',
            'working_days' => [1, 2, 3, 4, 5, 6],
        ])->assertRedirect('/dashboard');

        $branch = $user->businessContext()->branches()->firstOrFail();
        $service = $branch->services()->firstOrFail();

        return [$user, $branch, $service];
    }

    private function createBooking(Branch $branch, Service $service, string $date, string $status, int $number, string $code, bool $completed = false): Booking
    {
        $localDate = Carbon::parse($date.' 10:00:00', $branch->timezone);

        return Booking::query()->create([
            'branch_id' => $branch->id,
            'service_id' => $service->id,
            'customer_name' => 'Pelanggan Uji',
            'customer_phone' => '081234567890',
            'booking_code' => $code,
            'access_token' => (string) Str::uuid(),
            'type' => 'appointment',
            'scheduled_for' => $localDate->copy()->setTimezone('UTC'),
            'queue_date' => $date,
            'queue_number' => $number,
            'status' => $status,
            'checked_in_at' => $completed ? $localDate->copy()->setTimezone('UTC') : null,
            'service_started_at' => $completed ? $localDate->copy()->addMinutes(10)->setTimezone('UTC') : null,
            'service_completed_at' => $completed ? $localDate->copy()->addMinutes(25)->setTimezone('UTC') : null,
        ]);
    }
}
