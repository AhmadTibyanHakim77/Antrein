<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->json('closed_dates')->nullable();
            $table->unsignedSmallInteger('booking_advance_days')->default(60);
            $table->unsignedInteger('cancellation_cutoff_minutes')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->dropColumn(['closed_dates', 'booking_advance_days', 'cancellation_cutoff_minutes']);
        });
    }
};
