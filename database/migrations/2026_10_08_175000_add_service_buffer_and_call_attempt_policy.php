<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->unsignedTinyInteger('max_call_attempts')->default(3);
        });

        Schema::table('services', function (Blueprint $table) {
            $table->unsignedSmallInteger('buffer_minutes')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('buffer_minutes');
        });

        Schema::table('branches', function (Blueprint $table) {
            $table->dropColumn('max_call_attempts');
        });
    }
};
