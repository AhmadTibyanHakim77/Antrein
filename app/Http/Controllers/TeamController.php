<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\BusinessInvitation;
use App\Models\BusinessMember;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $business = $request->user()->business()->with(['branches.services', 'members.user', 'members.branch', 'members.services'])->first();
        if (! $business) {
            return redirect('/dashboard');
        }

        $members = $business->members->map(fn (BusinessMember $member) => [
            'id' => $member->id,
            'name' => $member->user->name,
            'email' => $member->user->email,
            'role' => $member->role,
            'branch' => $member->branch?->name ?? 'Semua cabang',
            'branch_id' => $member->branch_id,
            'service_ids' => $member->services->pluck('id')->map(fn ($id) => (int) $id)->values(),
            'joined_at' => $member->joined_at?->translatedFormat('d M Y') ?? $member->created_at->translatedFormat('d M Y'),
        ]);

        $invitations = $business->invitations()
            ->with('branch')
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->get()
            ->map(fn (BusinessInvitation $invitation) => [
                'id' => $invitation->id,
                'email' => $invitation->email,
                'role' => $invitation->role,
                'branch' => $invitation->branch?->name ?? 'Semua cabang',
                'expires_at' => $invitation->expires_at->translatedFormat('d M Y, H:i'),
            ]);

        return Inertia::render('team/index', [
            'business' => ['name' => $business->name],
            'branches' => $business->branches->map(fn (Branch $branch) => ['id' => $branch->id, 'name' => $branch->name]),
            'services' => $business->branches->flatMap(fn (Branch $branch) => $branch->services->where('is_active', true)->map(fn (Service $service) => ['id' => $service->id, 'branch_id' => $branch->id, 'name' => $service->name]))->values(),
            'members' => $members,
            'invitations' => $invitations,
            'flash' => $request->session()->get('success'),
            'invite_url' => $request->session()->get('invite_url'),
        ]);
    }

    public function invite(Request $request): RedirectResponse
    {
        $business = $request->user()->business;
        abort_unless($business && $business->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'role' => ['required', Rule::in(['operator', 'provider'])],
            'branch_id' => ['nullable', Rule::exists('branches', 'id')->where('business_id', $business->id)],
        ]);
        $data['email'] = mb_strtolower(trim($data['email']));

        if ($business->members()->whereHas('user', fn ($query) => $query->where('email', $data['email']))->exists()) {
            throw ValidationException::withMessages(['email' => 'Email tersebut sudah menjadi anggota usaha.']);
        }

        if ($request->user()->email === $data['email']) {
            throw ValidationException::withMessages(['email' => 'Pemilik usaha sudah memiliki akses.']);
        }

        if ($business->invitations()->where('email', $data['email'])->whereNull('accepted_at')->where('expires_at', '>', now())->exists()) {
            throw ValidationException::withMessages(['email' => 'Masih ada undangan aktif untuk alamat email ini.']);
        }

        $token = Str::random(48);
        $business->invitations()->create([
            'branch_id' => $data['branch_id'] ?? null,
            'email' => $data['email'],
            'role' => $data['role'],
            'token_hash' => hash('sha256', $token),
            'invited_by' => $request->user()->id,
            'expires_at' => now()->addDays(7),
        ]);

        return redirect('/team')->with('success', 'Undangan dibuat dan berlaku selama 7 hari. Salin tautan untuk dibagikan.')
            ->with('invite_url', url('/undangan/'.$token));
    }

    public function revokeInvitation(Request $request, BusinessInvitation $invitation): RedirectResponse
    {
        $business = $request->user()->business;
        abort_unless($business && $business->id === $invitation->business_id && $business->user_id === $request->user()->id, 404);
        $invitation->delete();

        return back()->with('success', 'Undangan dibatalkan.');
    }

    public function removeMember(Request $request, BusinessMember $member): RedirectResponse
    {
        $business = $request->user()->business;
        abort_unless($business && $business->id === $member->business_id && $business->user_id === $request->user()->id, 404);
        $member->delete();

        return back()->with('success', 'Akses anggota dicabut.');
    }

    public function updateMemberServices(Request $request, BusinessMember $member): RedirectResponse
    {
        $business = $request->user()->business;
        abort_unless($business && $business->id === $member->business_id && $business->user_id === $request->user()->id, 404);
        abort_unless($member->role === 'provider', 422, 'Penugasan layanan hanya berlaku untuk penyedia layanan.');

        $data = $request->validate([
            'service_ids' => ['required', 'array', 'max:100'],
            'service_ids.*' => ['required', 'integer', 'distinct', Rule::exists('services', 'id')],
        ]);
        $serviceIds = array_map('intval', $data['service_ids']);
        $eligibleCount = Service::query()
            ->whereIn('id', $serviceIds)
            ->where('is_active', true)
            ->whereHas('branch', fn ($query) => $query->where('business_id', $business->id)
                ->when($member->branch_id, fn ($branches) => $branches->whereKey($member->branch_id)))
            ->count();

        if ($eligibleCount !== count($serviceIds)) {
            throw ValidationException::withMessages(['service_ids' => 'Pilih layanan aktif dari usaha dan cabang yang ditugaskan.']);
        }

        $member->services()->sync($serviceIds);

        return back()->with('success', 'Penugasan layanan untuk '.$member->user->name.' diperbarui.');
    }

    public function showInvitation(string $token): Response
    {
        $invitation = $this->validInvitation($token);

        return Inertia::render('team/accept', [
            'invitation' => [
                'token' => $token,
                'email' => $invitation->email,
                'business' => $invitation->business->name,
                'branch' => $invitation->branch?->name ?? 'Semua cabang',
                'role' => $invitation->role,
                'expires_at' => $invitation->expires_at->translatedFormat('d M Y, H:i'),
                'existing_account' => User::where('email', $invitation->email)->exists(),
            ],
        ]);
    }

    public function acceptInvitation(Request $request, string $token): RedirectResponse
    {
        $invitation = $this->validInvitation($token);
        $existingUser = User::where('email', $invitation->email)->first();
        $hasExistingAccount = $existingUser !== null;
        $data = $request->validate([
            'name' => [$hasExistingAccount ? 'nullable' : 'required', 'string', 'max:120'],
            'phone' => [$hasExistingAccount ? 'nullable' : 'required', 'string', 'max:30', 'regex:/^[0-9+().\s-]+$/'],
            'address' => ['nullable', 'string', 'max:500'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        [$user, $businessName] = DB::transaction(function () use ($invitation, $hasExistingAccount, $data) {
            $lockedInvitation = BusinessInvitation::query()
                ->whereKey($invitation->id)
                ->whereNull('accepted_at')
                ->where('expires_at', '>', now())
                ->lockForUpdate()
                ->firstOrFail();
            $user = User::query()
                ->where('email', $lockedInvitation->email)
                ->lockForUpdate()
                ->first();

            if ($user) {
                if (! $hasExistingAccount) {
                    throw ValidationException::withMessages(['email' => 'Akun untuk email ini baru saja dibuat. Masuk ke akun tersebut, lalu buka kembali tautan undangan.']);
                }
                if (! Hash::check($data['password'], $user->password)) {
                    throw ValidationException::withMessages(['password' => 'Kata sandi tidak cocok untuk akun email undangan ini.']);
                }
                if ($user->businessContext()) {
                    throw ValidationException::withMessages(['email' => 'Akun ini sudah terhubung dengan ruang usaha lain.']);
                }
            } else {
                if ($hasExistingAccount) {
                    throw ValidationException::withMessages(['email' => 'Akun undangan tidak lagi tersedia. Muat ulang halaman undangan dan coba lagi.']);
                }

                $user = User::create([
                    'name' => $data['name'],
                    'email' => $lockedInvitation->email,
                    'phone' => trim($data['phone']),
                    'address' => filled($data['address'] ?? null) ? trim($data['address']) : null,
                    'password' => $data['password'],
                ]);
            }

            BusinessMember::create([
                'business_id' => $lockedInvitation->business_id,
                'user_id' => $user->id,
                'branch_id' => $lockedInvitation->branch_id,
                'role' => $lockedInvitation->role,
                'invited_by' => $lockedInvitation->invited_by,
                'joined_at' => now(),
            ]);
            $lockedInvitation->update(['accepted_at' => now()]);

            return [$user, $lockedInvitation->business->name];
        });

        Auth::login($user);
        $request->session()->regenerate();

        return redirect('/dashboard')->with('success', 'Selamat bergabung di '.$businessName.'.');
    }

    private function validInvitation(string $token): BusinessInvitation
    {
        $invitation = BusinessInvitation::with(['business', 'branch'])
            ->where('token_hash', hash('sha256', $token))
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->first();

        abort_unless($invitation, 404, 'Undangan tidak ditemukan atau sudah kedaluwarsa.');

        return $invitation;
    }
}
