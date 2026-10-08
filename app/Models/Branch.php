<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id', 'name', 'slug', 'address', 'phone', 'timezone', 'opening_time',
        'closing_time', 'working_days', 'closed_dates', 'booking_advance_days', 'cancellation_cutoff_minutes',
        'call_grace_minutes', 'max_call_attempts', 'queue_enabled', 'accepts_appointments',
    ];

    protected function casts(): array
    {
        return [
            'working_days' => 'array',
            'closed_dates' => 'array',
            'booking_advance_days' => 'integer',
            'cancellation_cutoff_minutes' => 'integer',
            'call_grace_minutes' => 'integer',
            'max_call_attempts' => 'integer',
            'queue_enabled' => 'boolean',
            'accepts_appointments' => 'boolean',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function walkInUnavailableReason(Service $service): ?string
    {
        if (! $this->queue_enabled) {
            return 'Antrean langsung sedang dijeda oleh usaha.';
        }

        if (! $service->allow_walk_ins) {
            return 'Layanan ini tidak menerima antrean langsung.';
        }

        $localNow = now($this->timezone);
        $workingDays = array_map('intval', $this->working_days ?? []);

        if (! in_array((int) $localNow->dayOfWeekIso, $workingDays, true)) {
            return 'Cabang tidak beroperasi hari ini.';
        }

        if (in_array($localNow->toDateString(), $this->closed_dates ?? [], true)) {
            return 'Cabang tutup pada tanggal ini.';
        }

        $opening = $localNow->copy()->setTimeFromTimeString($this->opening_time);
        $closing = $localNow->copy()->setTimeFromTimeString($this->closing_time);

        if ($localNow->lessThan($opening)) {
            return 'Antrean langsung dibuka mulai pukul '.$opening->format('H:i').'.';
        }

        $serviceEnd = $localNow->copy()->addMinutes($service->duration_minutes + $service->buffer_minutes);
        if ($serviceEnd->greaterThan($closing)) {
            return 'Pendaftaran walk-in hari ini sudah ditutup. Jam layanan berakhir pukul '.$closing->format('H:i').'.';
        }

        return null;
    }
}
