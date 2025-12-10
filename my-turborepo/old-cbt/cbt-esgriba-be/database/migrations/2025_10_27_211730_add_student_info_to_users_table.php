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
        Schema::table('users', function (Blueprint $table) {
            $table->string('nisn')->nullable()->after('nip');
            $table->string('nis')->nullable()->after('nisn');
            $table->string('birth_place')->nullable()->after('birth_date');
            $table->string('religion')->nullable()->after('birth_place');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nisn', 'nis', 'birth_place', 'religion']);
        });
    }
};
