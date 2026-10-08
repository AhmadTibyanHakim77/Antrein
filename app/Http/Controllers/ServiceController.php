<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $business = $request->user()->businessContext();
        if (! $business) {
            return redirect('/setup');
        }

        $membership = $request->user()->businessMembership()->first();
        abort_unless($business->user_id === $request->user()->id || $membership?->role === 'operator', 403);
        $accessibleBranches = $business->branches()->with('services')->when($membership?->branch_id, fn ($query) => $query->whereKey($membership->branch_id))->get();
        $branchId = $request->integer('branch_id');
        $branch = $accessibleBranches->firstWhere('id', $branchId) ?? $accessibleBranches->first();

        return Inertia::render('services/index', [
            'business' => ['name' => $business->name],
            'branches' => $accessibleBranches->map(fn (Branch $item) => ['id' => $item->id, 'name' => $item->name]),
            'branch' => ['id' => $branch->id, 'name' => $branch->name],
            'services' => $branch->services->map(fn (Service $service) => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'duration_minutes' => $service->duration_minutes,
                'buffer_minutes' => $service->buffer_minutes,
                'slot_capacity' => $service->slot_capacity,
                'allow_walk_ins' => $service->allow_walk_ins,
                'is_active' => $service->is_active,
            ]),
            'flash' => $request->session()->get('success'),
            'flash_error' => $request->session()->get('error'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $business = $request->user()->businessContext();
        abort_unless($business, 404);
        $membership = $request->user()->businessMembership()->first();
        abort_unless($business->user_id === $request->user()->id || $membership?->role === 'operator', 403);

        $data = $request->validate([
            'branch_id' => ['required', Rule::exists('branches', 'id')->where('business_id', $business->id)],
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'duration_minutes' => ['required', 'integer', 'between:5,240'],
            'buffer_minutes' => ['required', 'integer', 'between:0,120'],
            'slot_capacity' => ['required', 'integer', 'between:1,20'],
            'allow_walk_ins' => ['boolean'],
        ]);

        $branch = $business->branches()->findOrFail($data['branch_id']);
        abort_unless($request->user()->canAccessBranch($branch), 403);
        $branch->services()->create($data + ['is_active' => true]);

        return back()->with('success', 'Layanan berhasil ditambahkan.');
    }

    public function update(Request $request, Service $service): RedirectResponse
    {
        $this->authorizeService($request, $service);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'duration_minutes' => ['required', 'integer', 'between:5,240'],
            'buffer_minutes' => ['required', 'integer', 'between:0,120'],
            'slot_capacity' => ['required', 'integer', 'between:1,20'],
            'allow_walk_ins' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        $service->update($data);

        return back()->with('success', 'Perubahan layanan disimpan.');
    }

    public function destroy(Request $request, Service $service): RedirectResponse
    {
        $this->authorizeService($request, $service);
        $service->update(['is_active' => false]);

        return back()->with('success', 'Layanan dinonaktifkan. Riwayat reservasi tetap tersimpan.');
    }

    private function authorizeService(Request $request, Service $service): void
    {
        $branch = $service->branch;
        abort_unless($branch && $request->user()->canAccessBranch($branch), 404);
        $membership = $request->user()->businessMembership()->first();
        abort_unless($request->user()->business()->whereKey($branch->business_id)->exists() || $membership?->role === 'operator', 403);
    }
}
