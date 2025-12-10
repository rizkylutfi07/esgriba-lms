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
        Schema::create('question_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->enum('difficulty_level', ['easy', 'medium', 'hard'])->default('medium');
            $table->integer('total_questions')->default(0);
            $table->integer('total_points')->default(0);
            $table->timestamps();
        });

        // Pivot table for package questions
        Schema::create('package_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->constrained('question_packages')->onDelete('cascade');
            $table->unsignedBigInteger('question_id');
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        if (Schema::hasTable('question_banks')) {
            Schema::table('package_questions', function (Blueprint $table) {
                $table->foreign('question_id', 'package_questions_question_id_foreign')
                    ->references('id')
                    ->on('question_banks')
                    ->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('package_questions') && Schema::hasColumn('package_questions', 'question_id')) {
            Schema::table('package_questions', function (Blueprint $table) {
                $table->dropForeign('package_questions_question_id_foreign');
            });
        }

        Schema::dropIfExists('package_questions');
        Schema::dropIfExists('question_packages');
    }
};
