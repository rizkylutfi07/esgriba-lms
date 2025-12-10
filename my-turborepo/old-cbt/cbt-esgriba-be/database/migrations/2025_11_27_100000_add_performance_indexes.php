<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected function indexExists(string $table, string $index): bool
    {
        $connection = Schema::getConnection();
        $database = $connection->getDatabaseName();
        
        $result = $connection->select(
            "SELECT COUNT(*) as count FROM information_schema.statistics 
             WHERE table_schema = ? AND table_name = ? AND index_name = ?",
            [$database, $table, $index]
        );
        
        return $result[0]->count > 0;
    }

    public function up(): void
    {
        // Tests table indexes
        Schema::table('tests', function (Blueprint $table) {
            if (!$this->indexExists('tests', 'idx_tests_active_dates')) {
                $table->index(['is_active', 'start_time', 'end_time'], 'idx_tests_active_dates');
            }
            if (!$this->indexExists('tests', 'idx_tests_creator_subject')) {
                $table->index(['created_by', 'subject'], 'idx_tests_creator_subject');
            }
            if (!$this->indexExists('tests', 'idx_tests_kelas')) {
                $table->index('kelas', 'idx_tests_kelas');
            }
        });

        // Test attempts table indexes
        Schema::table('test_attempts', function (Blueprint $table) {
            $table->index(['test_id', 'user_id', 'status'], 'idx_attempts_test_user_status');
            $table->index(['user_id', 'status', 'created_at'], 'idx_attempts_user_status_date');
            $table->index('status', 'idx_attempts_status');
        });

        // Users table indexes
        Schema::table('users', function (Blueprint $table) {
            $table->index(['role', 'is_active'], 'idx_users_role_active');
            $table->index('class_id', 'idx_users_class');
        });

        // Questions table indexes
        Schema::table('questions', function (Blueprint $table) {
            $table->index(['test_id', 'question_type'], 'idx_questions_test_type');
        });

        // Test answers table indexes
        Schema::table('test_answers', function (Blueprint $table) {
            $table->index(['attempt_id', 'question_id'], 'idx_answers_attempt_question');
            $table->index('is_correct', 'idx_answers_correct');
        });

        // Test students (remedial) table indexes
        Schema::table('test_students', function (Blueprint $table) {
            $table->index(['test_id', 'user_id'], 'idx_test_students_test_user');
        });

        // Question banks indexes
        Schema::table('question_banks', function (Blueprint $table) {
            $table->index(['subject_id', 'question_type'], 'idx_qbanks_subject_type');
            $table->index('difficulty_level', 'idx_qbanks_difficulty');
        });
    }

    public function down(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            $table->dropIndex('idx_tests_active_dates');
            $table->dropIndex('idx_tests_creator_subject');
            $table->dropIndex('idx_tests_kelas');
        });

        Schema::table('test_attempts', function (Blueprint $table) {
            $table->dropIndex('idx_attempts_test_user_status');
            $table->dropIndex('idx_attempts_user_status_date');
            $table->dropIndex('idx_attempts_status');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_role_active');
            $table->dropIndex('idx_users_class');
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->dropIndex('idx_questions_test_type');
        });

        Schema::table('test_answers', function (Blueprint $table) {
            $table->dropIndex('idx_answers_attempt_question');
            $table->dropIndex('idx_answers_correct');
        });

        Schema::table('test_students', function (Blueprint $table) {
            $table->dropIndex('idx_test_students_test_user');
        });

        Schema::table('question_banks', function (Blueprint $table) {
            $table->dropIndex('idx_qbanks_subject_type');
            $table->dropIndex('idx_qbanks_difficulty');
        });
    }
};
