<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_member_service', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['business_member_id', 'service_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('business_member_service');
    }
};
