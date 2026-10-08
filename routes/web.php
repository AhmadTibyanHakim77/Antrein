<?php

use App\Http\Controllers\BranchQrController;
use App\Http\Controllers\BusinessSettingsController;
use App\Http\Controllers\BusinessSetupController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PublicBookingController;
use App\Http\Controllers\QueueController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\TeamController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('welcome'))->name('home');
Route::get('/usaha/{business:slug}', [PublicBookingController::class, 'show'])->name('public.business');
Route::post('/usaha/{business:slug}/reservasi', [PublicBookingController::class, 'store'])->middleware('throttle:20,1')->name('public.booking.store');
Route::get('/status/{token}', [PublicBookingController::class, 'status'])->name('public.booking.status');
Route::post('/status/{token}/batal', [PublicBookingController::class, 'cancel'])->name('public.booking.cancel');
Route::post('/status/{token}/jadwal', [PublicBookingController::class, 'reschedule'])->name('public.booking.reschedule');
Route::get('/privasi', fn () => Inertia::render('legal', ['page' => 'privacy']))->name('legal.privacy');
Route::get('/ketentuan', fn () => Inertia::render('legal', ['page' => 'terms']))->name('legal.terms');
Route::get('/undangan/{token}', [TeamController::class, 'showInvitation'])->name('team.invitation.show');
Route::post('/undangan/{token}', [TeamController::class, 'acceptInvitation'])->name('team.invitation.accept');

Route::middleware('auth')->group(function () {
    Route::get('/setup', [BusinessSetupController::class, 'create'])->name('business.setup');
    Route::post('/setup', [BusinessSetupController::class, 'store'])->name('business.setup.store');
    Route::get('/business/settings', [BusinessSettingsController::class, 'index'])->name('business.settings');
    Route::put('/business/settings', [BusinessSettingsController::class, 'update'])->name('business.settings.update');
    Route::post('/business/branches', [BusinessSettingsController::class, 'storeBranch'])->name('business.branches.store');
    Route::get('/team', [TeamController::class, 'index'])->name('team.index');
    Route::get('/branches/{branch}/qr.svg', BranchQrController::class)->name('branches.qr');
    Route::post('/team/invitations', [TeamController::class, 'invite'])->name('team.invite');
    Route::delete('/team/invitations/{invitation}', [TeamController::class, 'revokeInvitation'])->name('team.invitation.revoke');
    Route::delete('/team/members/{member}', [TeamController::class, 'removeMember'])->name('team.member.remove');
    Route::put('/team/members/{member}/services', [TeamController::class, 'updateMemberServices'])->name('team.member.services');
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
    Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
    Route::post('/services', [ServiceController::class, 'store'])->name('services.store');
    Route::put('/services/{service}', [ServiceController::class, 'update'])->name('services.update');
    Route::delete('/services/{service}', [ServiceController::class, 'destroy'])->name('services.destroy');
    Route::post('/branches/{branch}/walk-ins', [QueueController::class, 'walkIn'])->name('queue.walk-in');
    Route::post('/branches/{branch}/queue/next', [QueueController::class, 'callNext'])->name('queue.next');
    Route::post('/branches/{branch}/queue/toggle', [QueueController::class, 'toggle'])->name('queue.toggle');
    Route::post('/bookings/{booking}/actions/{action}', [QueueController::class, 'act'])
        ->whereIn('action', ['check-in', 'recall', 'start', 'complete', 'no-show', 'cancel'])
        ->name('queue.action');
});

require __DIR__.'/settings.php';
