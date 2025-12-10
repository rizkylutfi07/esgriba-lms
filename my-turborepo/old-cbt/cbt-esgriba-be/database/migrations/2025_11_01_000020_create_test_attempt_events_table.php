<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('test_attempt_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')
                ->constrained('test_attempts')
                ->onDelete('cascade');
            $table->string('event_type');
            $table->string('triggered_by')->default('student');
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['attempt_id', 'event_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_attempt_events');
    }
};
