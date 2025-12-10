<?php

namespace Tests\Feature;

use App\Models\Classes;
use App\Models\Major;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TestMonitorTest extends TestCase
{
    use RefreshDatabase;

    public function test_monitor_list_includes_students_without_attempts(): void
    {
        $major = Major::create([
            'code' => 'TKJ',
            'name' => 'Teknik Komputer & Jaringan',
            'description' => 'Jurusan testing',
            'is_active' => true,
        ]);

        $class = Classes::create([
            'name' => 'X',
            'major_id' => $major->id,
            'class_name' => 'X TKJ 1',
            'capacity' => 32,
            'is_active' => true,
        ]);

        $teacher = User::create([
            'name' => 'Guru Monitoring',
            'email' => 'guru.monitor@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'guru',
            'is_active' => true,
        ]);

        $studentWithAttempt = User::create([
            'name' => 'Siswa Mulai',
            'email' => 'siswa.mulai@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'siswa',
            'is_active' => true,
            'major_id' => $major->id,
            'class_id' => $class->id,
        ]);

        $studentWithoutAttempt = User::create([
            'name' => 'Siswa Belum Mulai',
            'email' => 'siswa.belum@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'siswa',
            'is_active' => true,
            'major_id' => $major->id,
            'class_id' => $class->id,
        ]);

        $test = Test::create([
            'title' => 'Ujian Monitoring',
            'description' => 'Mengujikan status monitor',
            'duration' => 60,
            'total_questions' => 20,
            'passing_score' => 75,
            'is_active' => true,
            'start_time' => Carbon::now()->subMinutes(30),
            'end_time' => Carbon::now()->addMinutes(60),
            'created_by' => $teacher->id,
            'subject' => 'Teknologi Informasi',
            'kelas' => $class->class_name,
        ]);

        TestAttempt::create([
            'test_id' => $test->id,
            'user_id' => $studentWithAttempt->id,
            'started_at' => Carbon::now()->subMinutes(15),
            'finished_at' => null,
            'score' => null,
            'is_passed' => null,
            'status' => 'in_progress',
            'is_blocked' => false,
            'cheat_count' => 0,
            'last_activity_at' => Carbon::now()->subMinutes(5),
        ]);

        $response = $this->actingAs($teacher, 'api')->getJson("/api/tests/{$test->id}/monitor");

        $response->assertOk();
        $payload = $response->json();

        $this->assertArrayHasKey('attempts', $payload);
        $this->assertCount(2, $payload['attempts']);

        $attemptsByStudent = collect($payload['attempts'])->keyBy(fn($attempt) => $attempt['student']['id']);

        $activeAttempt = $attemptsByStudent->get($studentWithAttempt->id);
        $waitingAttempt = $attemptsByStudent->get($studentWithoutAttempt->id);

        $this->assertNotNull($activeAttempt);
        $this->assertEquals('in_progress', $activeAttempt['status']);
        $this->assertSame($test->total_questions, $activeAttempt['total_questions']);

        $this->assertNotNull($waitingAttempt);
        $this->assertNull($waitingAttempt['id']);
        $this->assertEquals('not_started', $waitingAttempt['status']);
        $this->assertEquals(
            'Belum memulai (belum login / belum klik ujian)',
            $waitingAttempt['status_label']
        );
        $this->assertSame(0, $waitingAttempt['progress_percent']);
    }
}
