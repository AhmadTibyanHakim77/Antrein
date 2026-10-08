<?php

namespace App\Http\Controllers;

use App\Models\Business;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BusinessSetupController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        if ($request->user()->businessContext() !== null) {
            return redirect('/dashboard');
        }

        return Inertia::render('business/setup');
    }

    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->businessContext() !== null) {
            return redirect('/dashboard');
        }

        $data = $request->validate([
            'business_name' => ['required', 'string', 'max:120'],
            'category' => ['required', 'in:clinic,barbershop,workshop,other'],
            'business_phone' => ['nullable', 'string', 'max:30'],
            'branch_name' => ['required', 'string', 'max:120'],
            'branch_address' => ['required', 'string', 'max:500'],
            'branch_phone' => ['nullable', 'string', 'max:30'],
            'opening_time' => ['required', 'date_format:H:i'],
            'closing_time' => ['required', 'date_format:H:i', 'after:opening_time'],
            'working_days' => ['required', 'array', 'min:1'],
            'working_days.*' => ['required', 'integer', 'between:1,7'],
        ]);

        $business = DB::transaction(function () use ($request, $data) {
            $slugBase = Str::slug($data['business_name']) ?: 'usaha';
            $slug = $slugBase;
            $suffix = 2;
            while (Business::where('slug', $slug)->exists()) {
                $slug = $slugBase.'-'.$suffix++;
            }

            $business = Business::create([
                'user_id' => $request->user()->id,
                'name' => $data['business_name'],
                'slug' => $slug,
                'category' => $data['category'],
                'phone' => $data['business_phone'] ?? null,
            ]);

            $branchSlug = Str::slug($data['branch_name']) ?: 'cabang-utama';
            $branch = $business->branches()->create([
                'name' => $data['branch_name'],
                'slug' => $branchSlug,
                'address' => $data['branch_address'],
                'phone' => $data['branch_phone'] ?? null,
                'timezone' => 'Asia/Jakarta',
                'opening_time' => $data['opening_time'],
                'closing_time' => $data['closing_time'],
                'working_days' => array_values(array_unique(array_map('intval', $data['working_days']))),
            ]);

            $branch->services()->create([
                'name' => 'Layanan utama',
                'description' => 'Silakan ubah nama dan durasi layanan ini sesuai kebutuhan usaha.',
                'duration_minutes' => 30,
                'slot_capacity' => 1,
                'allow_walk_ins' => true,
                'is_active' => true,
            ]);

            return $business;
        });

        return redirect('/dashboard')->with('success', 'Profil usaha berhasil dibuat. Tambahkan layanan sebelum membagikan tautan pemesanan.');
    }
}
