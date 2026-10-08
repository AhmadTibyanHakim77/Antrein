<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BusinessSettingsController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $business = $request->user()->business()->with('branches')->first();
        if (! $business) {
            return redirect('/setup');
        }

        abort_unless($business->user_id === $request->user()->id, 403);
        $branchId = $request->integer('branch_id');
        $branch = $business->branches->firstWhere('id', $branchId) ?? $business->branches->first();

        return Inertia::render('business/settings', [
            'business' => ['id' => $business->id, 'name' => $business->name, 'category' => $business->category, 'phone' => $business->phone],
            'branches' => $business->branches->map(fn (Branch $item) => ['id' => $item->id, 'name' => $item->name]),
            'branch' => [
                'id' => $branch->id,
                'name' => $branch->name,
                'address' => $branch->address,
                'timezone' => $branch->timezone,
                'phone' => $branch->phone,
                'opening_time' => substr($branch->opening_time, 0, 5),
                'closing_time' => substr($branch->closing_time, 0, 5),
                'call_grace_minutes' => $branch->call_grace_minutes,
                'max_call_attempts' => $branch->max_call_attempts,
                'closed_dates' => $branch->closed_dates ?? [],
                'booking_advance_days' => $branch->booking_advance_days,
                'cancellation_cutoff_minutes' => $branch->cancellation_cutoff_minutes,
                'working_days' => $branch->working_days,
                'queue_enabled' => $branch->queue_enabled,
                'accepts_appointments' => $branch->accepts_appointments,
            ],
            'flash' => $request->session()->get('success'),
            'flash_error' => $request->session()->get('error'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $business = $request->user()->business;
        abort_unless($business, 404);
        abort_unless($business->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'branch_id' => ['required', Rule::exists('branches', 'id')->where('business_id', $business->id)],
            'business_name' => ['required', 'string', 'max:120'],
            'category' => ['required', 'in:clinic,barbershop,workshop,other'],
            'business_phone' => ['nullable', 'string', 'max:30'],
            'branch_name' => ['required', 'string', 'max:120'],
            'branch_address' => ['required', 'string', 'max:500'],
            'timezone' => ['required', Rule::in(['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura', 'UTC'])],
            'branch_phone' => ['nullable', 'string', 'max:30'],
            'opening_time' => ['required', 'date_format:H:i'],
            'closing_time' => ['required', 'date_format:H:i', 'after:opening_time'],
            'call_grace_minutes' => ['required', 'integer', 'between:0,60'],
            'max_call_attempts' => ['required', 'integer', 'between:1,10'],
            'closed_dates' => ['nullable', 'array', 'max:60'],
            'closed_dates.*' => ['required', 'date_format:Y-m-d'],
            'booking_advance_days' => ['required', 'integer', 'between:1,365'],
            'cancellation_cutoff_minutes' => ['required', 'integer', 'between:0,10080'],
            'working_days' => ['required', 'array', 'min:1'],
            'working_days.*' => ['required', 'integer', 'between:1,7'],
            'queue_enabled' => ['required', 'boolean'],
            'accepts_appointments' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($business, $data) {
            $business->update(['name' => $data['business_name'], 'category' => $data['category'], 'phone' => $data['business_phone'] ?? null]);
            $business->branches()->whereKey($data['branch_id'])->update([
                'name' => $data['branch_name'],
                'address' => $data['branch_address'],
                'timezone' => $data['timezone'],
                'phone' => $data['branch_phone'] ?? null,
                'opening_time' => $data['opening_time'],
                'closing_time' => $data['closing_time'],
                'call_grace_minutes' => $data['call_grace_minutes'],
                'max_call_attempts' => $data['max_call_attempts'],
                'closed_dates' => array_values(array_unique($data['closed_dates'] ?? [])),
                'booking_advance_days' => $data['booking_advance_days'],
                'cancellation_cutoff_minutes' => $data['cancellation_cutoff_minutes'],
                'working_days' => json_encode(array_values(array_unique(array_map('intval', $data['working_days'])))),
                'queue_enabled' => $data['queue_enabled'],
                'accepts_appointments' => $data['accepts_appointments'],
            ]);
        });

        return back()->with('success', 'Pengaturan usaha dan cabang disimpan.');
    }

    public function storeBranch(Request $request): RedirectResponse
    {
        $business = $request->user()->business;
        abort_unless($business, 404);
        abort_unless($business->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'address' => ['required', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:30'],
            'opening_time' => ['required', 'date_format:H:i'],
            'closing_time' => ['required', 'date_format:H:i', 'after:opening_time'],
            'working_days' => ['required', 'array', 'min:1'],
            'working_days.*' => ['required', 'integer', 'between:1,7'],
        ]);

        $base = Str::slug($data['name']) ?: 'cabang';
        $slug = $base;
        $suffix = 2;
        while ($business->branches()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        $branch = $business->branches()->create([
            'name' => $data['name'],
            'slug' => $slug,
            'address' => $data['address'],
            'phone' => $data['phone'] ?? null,
            'timezone' => 'Asia/Jakarta',
            'opening_time' => $data['opening_time'],
            'closing_time' => $data['closing_time'],
            'working_days' => array_values(array_unique(array_map('intval', $data['working_days']))),
        ]);
        $branch->services()->create([
            'name' => 'Layanan utama',
            'description' => 'Sesuaikan nama dan durasi layanan dengan operasional cabang.',
            'duration_minutes' => 30,
            'slot_capacity' => 1,
            'allow_walk_ins' => true,
            'is_active' => true,
        ]);

        return redirect('/business/settings?branch_id='.$branch->id)->with('success', 'Cabang baru berhasil dibuat. Periksa dan sesuaikan layanan cabang.');
    }
}
