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
        Schema::create('question_banks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->onDelete('set null');
            $table->string('category')->nullable(); // Topik/kategori soal
            $table->text('question_text');
            $table->enum('question_type', ['multiple_choice', 'essay'])->default('multiple_choice');
            $table->integer('difficulty_level')->default(1); // 1=mudah, 2=sedang, 3=sulit
            $table->integer('points')->default(1);
            $table->text('explanation')->nullable(); // Penjelasan jawaban
            $table->json('options')->nullable(); // Store options as JSON
            $table->json('correct_answer')->nullable(); // Store correct answer(s)
            $table->integer('usage_count')->default(0); // Berapa kali soal digunakan
            $table->timestamps();
            $table->softDeletes();

            $table->index(['created_by', 'subject_id']);
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('question_banks');
    }
};
