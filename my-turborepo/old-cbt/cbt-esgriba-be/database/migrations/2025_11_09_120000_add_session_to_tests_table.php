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
        if (!Schema::hasColumn('tests', 'session')) {
            Schema::table('tests', function (Blueprint $table) {
                $table->unsignedTinyInteger('session')->nullable()->comment('Optional session number for scheduling')->after('kelas');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('tests', 'session')) {
            Schema::table('tests', function (Blueprint $table) {
                $table->dropColumn('session');
            });
        }
    }
};
