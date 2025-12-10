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

class TestIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_active_tests_excludes_completed_attempts(): void
    {
        $major = Major::create([
            'code' => 'TKR',
            'name' => 'Teknik Kendaraan Ringan',
            'description' => 'Jurusan uji coba',
            'is_active' => true,
        ]);

        $class = Classes::create([
            'name' => 'X',
            'major_id' => $major->id,
            'class_name' => 'X TKR 1',
            'capacity' => 30,
            'is_active' => true,
        ]);

        $teacher = User::create([
            'name' => 'Guru Penguji',
            'email' => 'guru@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'guru',
            'is_active' => true,
        ]);

        $student = User::create([
            'name' => 'Siswa Penguji',
            'email' => 'siswa@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'siswa',
            'is_active' => true,
            'major_id' => $major->id,
            'class_id' => $class->id,
        ]);

        $completedTest = Test::create([
            'title' => 'Ujian Matematika',
            'description' => 'Tes yang sudah selesai',
            'duration' => 60,
            'total_questions' => 10,
            'passing_score' => 70,
            'is_active' => true,
            'start_time' => Carbon::now()->subHour(),
            'end_time' => Carbon::now()->addHour(),
            'created_by' => $teacher->id,
            'subject' => 'Matematika',
            'kelas' => $class->class_name,
        ]);

        TestAttempt::create([
            'test_id' => $completedTest->id,
            'user_id' => $student->id,
            'started_at' => Carbon::now()->subMinutes(30),
            'finished_at' => Carbon::now()->subMinutes(10),
            'score' => 85,
            'is_passed' => true,
            'status' => 'completed',
            'is_blocked' => false,
            'cheat_count' => 0,
            'last_activity_at' => Carbon::now()->subMinutes(10),
        ]);

        $availableTest = Test::create([
            'title' => 'Ujian Bahasa',
            'description' => 'Tes yang masih aktif',
            'duration' => 45,
            'total_questions' => 15,
            'passing_score' => 75,
            'is_active' => true,
            'start_time' => Carbon::now()->subMinutes(5),
            'end_time' => Carbon::now()->addHour(),
            'created_by' => $teacher->id,
            'subject' => 'Bahasa Indonesia',
            'kelas' => $class->class_name,
        ]);

        $response = $this->actingAs($student, 'api')->getJson('/api/tests?status=active');

        $response->assertOk();
        $payload = $response->json();

        $this->assertArrayHasKey('data', $payload);
        $this->assertCount(1, $payload['data']);
        $this->assertEquals($availableTest->id, $payload['data'][0]['id']);
        $this->assertArrayHasKey('current_attempt', $payload['data'][0]);
        $this->assertNull($payload['data'][0]['current_attempt']);
        $this->assertFalse($payload['data'][0]['is_completed']);
        $this->assertFalse($payload['data'][0]['can_resume']);
        $this->assertArrayNotHasKey('attempts', $payload['data'][0]);
    }
}
