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
        // Tabel Tahun Pelajaran
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // 2024/2025
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });

        // Tabel Jurusan
        Schema::create('majors', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // TKR, TKJ, AKT
            $table->string('name'); // Teknik Kendaraan Ringan
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Tabel Kelas
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // X, XI, XII
            $table->foreignId('major_id')->constrained()->onDelete('cascade');
            $table->string('class_name'); // X TKR 1
            $table->integer('capacity')->default(30);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Tabel Mata Pelajaran
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('major_id')->nullable()->constrained()->onDelete('set null');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Tabel Ruang
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->integer('capacity');
            $table->string('floor')->nullable();
            $table->string('building')->nullable();
            $table->text('facilities')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Update tabel users untuk relasi dengan kelas dan jurusan
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('major_id')->nullable()->after('role')->constrained()->onDelete('set null');
            $table->foreignId('class_id')->nullable()->after('major_id')->constrained()->onDelete('set null');
        });

        // Update tabel tests untuk relasi
        Schema::table('tests', function (Blueprint $table) {
            $table->foreignId('subject_id')->nullable()->after('created_by')->constrained()->onDelete('set null');
            $table->foreignId('class_id')->nullable()->after('subject_id')->constrained()->onDelete('set null');
            $table->foreignId('academic_year_id')->nullable()->after('class_id')->constrained()->onDelete('set null');
            $table->foreignId('room_id')->nullable()->after('academic_year_id')->constrained()->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            $table->dropForeign(['subject_id']);
            $table->dropForeign(['class_id']);
            $table->dropForeign(['academic_year_id']);
            $table->dropForeign(['room_id']);
            $table->dropColumn(['subject_id', 'class_id', 'academic_year_id', 'room_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['major_id']);
            $table->dropForeign(['class_id']);
            $table->dropColumn(['major_id', 'class_id']);
        });

        Schema::dropIfExists('rooms');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('classes');
        Schema::dropIfExists('majors');
        Schema::dropIfExists('academic_years');
    }
};
