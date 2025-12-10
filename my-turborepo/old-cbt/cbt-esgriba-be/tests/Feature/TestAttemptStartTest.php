<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\User;
use App\Models\UserAnswer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TestAttemptStartTest extends TestCase
{
    use RefreshDatabase;

    private function createTeacher(): User
    {
        return User::create([
            'name' => 'Guru',
            'email' => 'guru@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'guru',
            'is_active' => true,
        ]);
    }

    private function createStudent(): User
    {
        return User::create([
            'name' => 'Siswa',
            'email' => 'siswa@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'siswa',
            'is_active' => true,
        ]);
    }

    private function createActiveTest(User $teacher): array
    {
        $test = Test::create([
            'title' => 'Tes Resume',
            'description' => 'Tes untuk memastikan resume attempt',
            'duration' => 60,
            'total_questions' => 1,
            'passing_score' => 70,
            'is_active' => true,
            'start_time' => Carbon::now()->subMinutes(5),
            'end_time' => Carbon::now()->addHour(),
            'created_by' => $teacher->id,
            'subject' => 'Matematika',
            'kelas' => 'X TKR 1',
        ]);

        $question = Question::create([
            'test_id' => $test->id,
            'question_text' => 'Siapa penemu lampu?',
            'question_type' => 'multiple_choice',
            'points' => 10,
            'order' => 1,
        ]);

        $optionA = QuestionOption::create([
            'question_id' => $question->id,
            'option_text' => 'Thomas Edison',
            'is_correct' => true,
            'order' => 1,
        ]);

        QuestionOption::create([
            'question_id' => $question->id,
            'option_text' => 'Nikola Tesla',
            'is_correct' => false,
            'order' => 2,
        ]);

        return [$test, $question, $optionA];
    }

    public function test_resume_attempt_returns_saved_answers(): void
    {
        $teacher = $this->createTeacher();
        $student = $this->createStudent();
        [$test, $question, $option] = $this->createActiveTest($teacher);

        $attempt = TestAttempt::create([
            'test_id' => $test->id,
            'user_id' => $student->id,
            'started_at' => Carbon::now()->subMinutes(3),
            'status' => 'in_progress',
            'last_activity_at' => Carbon::now()->subMinute(),
        ]);

        UserAnswer::create([
            'attempt_id' => $attempt->id,
            'question_id' => $question->id,
            'option_id' => $option->id,
            'is_correct' => true,
            'points_earned' => 10,
        ]);

        $response = $this->actingAs($student, 'api')->postJson("/api/tests/{$test->id}/start");

        $response->assertOk();

        $payload = $response->json('attempt');

        $this->assertNotNull($payload);
        $this->assertEquals($attempt->id, $payload['id']);
        $this->assertIsArray($payload['answers']);
        $this->assertCount(1, $payload['answers']);
        $this->assertEquals($question->id, $payload['answers'][0]['question_id']);
        $this->assertEquals($option->id, $payload['answers'][0]['option_id']);
    }

    public function test_starting_new_attempt_returns_empty_answers_array(): void
    {
        $teacher = $this->createTeacher();
        $student = $this->createStudent();
        [$test] = $this->createActiveTest($teacher);

        $response = $this->actingAs($student, 'api')->postJson("/api/tests/{$test->id}/start");

        $response->assertCreated();

        $payload = $response->json('attempt');

        $this->assertNotNull($payload);
        $this->assertSame('in_progress', $payload['status']);
        $this->assertIsArray($payload['answers']);
        $this->assertCount(0, $payload['answers']);
    }
}
