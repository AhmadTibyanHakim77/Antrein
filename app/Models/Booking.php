<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    use HasFactory;

    public const STATUSES = ['scheduled', 'waiting', 'called', 'in_service', 'completed', 'cancelled', 'no_show', 'paused'];

    protected $fillable = [
        'branch_id', 'service_id', 'customer_name', 'customer_phone', 'customer_email',
        'booking_code', 'access_token', 'type', 'scheduled_for', 'queue_date', 'queue_number',
        'status', 'call_count', 'checked_in_at', 'called_at', 'service_started_at',
        'service_completed_at', 'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_for' => 'datetime',
            'queue_date' => 'date',
            'checked_in_at' => 'datetime',
            'called_at' => 'datetime',
            'service_started_at' => 'datetime',
            'service_completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'call_count' => 'integer',
            'queue_number' => 'integer',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(QueueEvent::class);
    }
}
