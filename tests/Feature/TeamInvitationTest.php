<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\BusinessInvitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class TeamInvitationTest extends TestCase
{
    use RefreshDatabase;

    public function test_invitation_can_only_be_accepted_once(): void
    {
        $owner = User::factory()->create();
        $business = Business::create([
            'user_id' => $owner->id,
            'name' => 'Usaha Undangan Uji',
            'slug' => 'usaha-undangan-uji',
            'category' => 'other',
            'is_active' => true,
        ]);
        $token = Str::random(48);
        $invitation = BusinessInvitation::query()->create([
            'business_id' => $business->id,
            'email' => 'anggota@example.com',
            'role' => 'operator',
            'token_hash' => hash('sha256', $token),
            'invited_by' => $owner->id,
            'expires_at' => now()->addDays(7),
        ]);

        $this->post("/undangan/{$token}", [
            'name' => 'Anggota Usaha',
            'phone' => '081234567890',
            'password' => 'password-sangat-aman',
            'password_confirmation' => 'password-sangat-aman',
        ])
            ->assertRedirect('/dashboard')
            ->assertSessionHas('success');

        $member = User::query()->where('email', 'anggota@example.com')->firstOrFail();
        $this->assertDatabaseHas('business_members', [
            'business_id' => $business->id,
            'user_id' => $member->id,
            'role' => 'operator',
        ]);
        $this->assertNotNull($invitation->fresh()->accepted_at);

        $this->post("/undangan/{$token}", [
            'name' => 'Anggota Usaha',
            'phone' => '081234567890',
            'password' => 'password-sangat-aman',
            'password_confirmation' => 'password-sangat-aman',
        ])->assertNotFound();

        $this->assertDatabaseCount('business_members', 1);
        $this->assertDatabaseCount('users', 2);
    }
}
