<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('name', 120);
            $table->string('slug')->unique();
            $table->string('category', 40)->default('other');
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->string('name', 120);
            $table->string('slug');
            $table->text('address');
            $table->string('phone', 30)->nullable();
            $table->string('timezone', 60)->default('Asia/Jakarta');
            $table->time('opening_time')->default('09:00:00');
            $table->time('closing_time')->default('17:00:00');
            $table->json('working_days');
            $table->unsignedSmallInteger('call_grace_minutes')->default(10);
            $table->boolean('queue_enabled')->default(true);
            $table->boolean('accepts_appointments')->default(true);
            $table->timestamps();
            $table->unique(['business_id', 'slug']);
        });

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('name', 120);
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('duration_minutes')->default(30);
            $table->unsignedTinyInteger('slot_capacity')->default(1);
            $table->boolean('allow_walk_ins')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['branch_id', 'is_active']);
        });

        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->string('customer_name', 120);
            $table->string('customer_phone', 30);
            $table->string('customer_email')->nullable();
            $table->string('booking_code', 20)->unique();
            $table->uuid('access_token')->unique();
            $table->string('type', 20)->default('walk_in');
            $table->dateTime('scheduled_for');
            $table->date('queue_date');
            $table->unsignedInteger('queue_number')->nullable();
            $table->string('status', 24)->default('waiting');
            $table->unsignedSmallInteger('call_count')->default(0);
            $table->timestamp('checked_in_at')->nullable();
            $table->timestamp('called_at')->nullable();
            $table->timestamp('service_started_at')->nullable();
            $table->timestamp('service_completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->index(['branch_id', 'queue_date', 'service_id', 'status'], 'bookings_queue_lookup');
            $table->index(['branch_id', 'scheduled_for', 'status'], 'bookings_schedule_lookup');
            $table->unique(['branch_id', 'service_id', 'queue_date', 'queue_number'], 'bookings_queue_number_unique');
        });

        Schema::create('queue_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('from_status', 24)->nullable();
            $table->string('to_status', 24)->nullable();
            $table->string('action', 40);
            $table->string('note', 255)->nullable();
            $table->timestamps();
            $table->index(['booking_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('queue_events');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('services');
        Schema::dropIfExists('branches');
        Schema::dropIfExists('businesses');
    }
};
