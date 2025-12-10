<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nip')->nullable()->after('birth_date');
        });
        
        // Copy data from nim_nip to nip
        DB::statement('UPDATE users SET nip = nim_nip WHERE nim_nip IS NOT NULL');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('nim_nip');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nim_nip')->nullable();
        });
        
        DB::statement('UPDATE users SET nim_nip = nip WHERE nip IS NOT NULL');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('nip');
        });
    }
};
