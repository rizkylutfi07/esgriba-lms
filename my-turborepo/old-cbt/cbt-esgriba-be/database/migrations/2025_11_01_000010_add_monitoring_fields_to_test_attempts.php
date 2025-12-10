<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('test_attempts', function (Blueprint $table) {
            $table->boolean('is_blocked')->default(false)->after('status');
            $table->timestamp('blocked_at')->nullable()->after('is_blocked');
            $table->string('blocked_reason')->nullable()->after('blocked_at');
            $table->unsignedInteger('cheat_count')->default(0)->after('blocked_reason');
            $table->timestamp('last_activity_at')->nullable()->after('cheat_count');
        });

        DB::statement("ALTER TABLE test_attempts MODIFY COLUMN status ENUM('in_progress','completed','abandoned','blocked') DEFAULT 'in_progress'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE test_attempts MODIFY COLUMN status ENUM('in_progress','completed','abandoned') DEFAULT 'in_progress'");

        Schema::table('test_attempts', function (Blueprint $table) {
            $table->dropColumn(['is_blocked', 'blocked_at', 'blocked_reason', 'cheat_count', 'last_activity_at']);
        });
    }
};
