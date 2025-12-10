<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('exam_sessions', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('number')->nullable()->comment('Ordinal number, e.g., 1,2,3');
            $table->string('label');
            $table->string('start_time', 5); // HH:MM
            $table->string('end_time', 5);   // HH:MM
            $table->unsignedSmallInteger('duration_minutes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_sessions');
    }
};
