<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('package_questions') || ! Schema::hasTable('question_banks')) {
            return;
        }

        $constraintName = 'package_questions_question_id_foreign';

        $hasConstraint = DB::table('information_schema.TABLE_CONSTRAINTS')
            ->where('TABLE_SCHEMA', DB::getDatabaseName())
            ->where('TABLE_NAME', 'package_questions')
            ->where('CONSTRAINT_NAME', $constraintName)
            ->exists();

        if (! $hasConstraint) {
            Schema::table('package_questions', function (Blueprint $table) use ($constraintName) {
                $table->foreign('question_id', $constraintName)
                    ->references('id')
                    ->on('question_banks')
                    ->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('package_questions')) {
            return;
        }

        $constraintName = 'package_questions_question_id_foreign';

        $hasConstraint = DB::table('information_schema.TABLE_CONSTRAINTS')
            ->where('TABLE_SCHEMA', DB::getDatabaseName())
            ->where('TABLE_NAME', 'package_questions')
            ->where('CONSTRAINT_NAME', $constraintName)
            ->exists();

        if ($hasConstraint) {
            Schema::table('package_questions', function (Blueprint $table) use ($constraintName) {
                $table->dropForeign($constraintName);
            });
        }
    }
};
