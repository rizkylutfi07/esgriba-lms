<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\TestAttemptEvent;
use App\Models\User;
use App\Models\UserAnswer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class TestAttemptController extends Controller
{
    private const MAX_CHEAT_EVENTS = 1;

    /**
     * Start a test attempt
     */
    public function start(Request $request, $testId)
    {
        $test = Test::with(['questions.options', 'allowedStudents:id'])->findOrFail($testId);

        // Check if test has questions
        if ($test->questions->count() === 0) {
            return response()->json([
                'message' => 'Ujian ini belum memiliki soal. Silakan hubungi guru.'
            ], 422);
        }

        // Check if test is active
        if (!$test->is_active) {
            return response()->json(['message' => 'Ujian belum diaktifkan'], 403);
        }

        // Check if within time range
        $now = now();
        if ($now < $test->start_time) {
            return response()->json([
                'message' => 'Ujian belum dimulai. Waktu mulai: ' . $test->start_time->format('d/m/Y H:i')
            ], 403);
        }

        // Only prevent NEW attempts if expired, allow continuing existing attempts
        $existingInProgress = TestAttempt::where('test_id', $testId)
            ->where('user_id', $request->user()->id)
            ->where('status', 'in_progress')
            ->first();
        
        if ($now > $test->end_time && !$existingInProgress) {
            return response()->json([
                'message' => 'Ujian sudah berakhir. Waktu berakhir: ' . $test->end_time->format('d/m/Y H:i')
            ], 403);
        }

        // If remedial list exists, restrict only to assigned students
        try {
            $allowedCount = $test->allowedStudents()->count();
        } catch (\Throwable $e) {
            $allowedCount = 0;
        }

        if ($allowedCount > 0) {
            $isAllowed = $test->allowedStudents()->where('student_id', $request->user()->id)->exists();
            if (!$isAllowed) {
                return response()->json([
                    'message' => 'Anda tidak terdaftar pada remidi ujian ini.'
                ], 403);
            }
        }

        // Check if user already has a completed attempt
        $completedAttempt = TestAttempt::where('test_id', $testId)
            ->where('user_id', $request->user()->id)
            ->where('status', 'completed')
            ->first();

        if ($completedAttempt) {
            return response()->json([
                'message' => 'Anda sudah menyelesaikan ujian ini',
                'attempt' => $completedAttempt->load(['test.questions.options', 'answers']),
            ], 422);
        }

        // Check if user already has an active attempt (in_progress or blocked)
        $existingAttempt = TestAttempt::where('test_id', $testId)
            ->where('user_id', $request->user()->id)
            ->whereIn('status', ['in_progress', 'blocked'])
            ->first();

        if ($existingAttempt) {
            $existingAttempt->load([
                'test.questions.options',
                'answers',
            ]);

            if ($existingAttempt->status === 'blocked' || $existingAttempt->is_blocked) {
                return response()->json([
                    'message' => 'Attempt ini telah diblokir oleh pengawas. Silakan hubungi guru.',
                    'attempt' => $existingAttempt,
                ], 423);
            }

            return response()->json([
                'message' => 'Anda sudah memiliki attempt yang aktif untuk ujian ini',
                'attempt' => $existingAttempt,
            ]);
        }

        $attempt = TestAttempt::create([
            'test_id' => $testId,
            'user_id' => $request->user()->id,
            'started_at' => now(),
            'status' => 'in_progress',
            'last_activity_at' => now(),
        ]);

        return response()->json([
            'message' => 'Test attempt started',
            'attempt' => $attempt->load(['test.questions.options', 'answers']),
        ], 201);
    }

    /**
     * Submit an answer
     */
    public function submitAnswer(Request $request, $attemptId)
    {
        $validator = Validator::make($request->all(), [
            'question_id' => 'required|exists:questions,id',
            'option_id' => 'nullable|exists:question_options,id',
            'answer_text' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $attempt = TestAttempt::findOrFail($attemptId);

        // Check if attempt belongs to user
        if ($attempt->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Check if attempt is still in progress
        if ($attempt->status !== 'in_progress') {
            return response()->json(['message' => 'Test attempt is not in progress'], 403);
        }

        if ($attempt->is_blocked) {
            return response()->json([
                'message' => 'Attempt Anda diblokir oleh pengawas',
            ], 423);
        }

        if ($attempt->is_blocked) {
            return response()->json([
                'message' => 'Attempt Anda diblokir oleh pengawas',
            ], 423);
        }

        $question = $attempt->test->questions()->findOrFail($request->question_id);

        // Check if answer already exists
        $existingAnswer = UserAnswer::where('attempt_id', $attemptId)
            ->where('question_id', $request->question_id)
            ->first();

        $isCorrect = false;
        $pointsEarned = 0;

        if ($question->question_type === 'multiple_choice' && $request->option_id) {
            $option = $question->options()->findOrFail($request->option_id);
            $isCorrect = $option->is_correct;
            $pointsEarned = $isCorrect ? $question->points : 0;
        }

        $answerData = [
            'attempt_id' => $attemptId,
            'question_id' => $request->question_id,
            'option_id' => $request->option_id,
            'answer_text' => $request->answer_text,
            'is_correct' => $isCorrect,
            'points_earned' => $pointsEarned,
        ];

        if ($existingAnswer) {
            $existingAnswer->update($answerData);
            $answer = $existingAnswer;
        } else {
            $answer = UserAnswer::create($answerData);
        }

        $attempt->forceFill(['last_activity_at' => now()])->save();

        return response()->json([
            'message' => 'Answer submitted successfully',
            'answer' => $answer,
        ]);
    }

    /**
     * Log suspicious events during attempt (e.g., tab switch)
     */
    public function logEvent(Request $request, $attemptId)
    {
        $attempt = TestAttempt::with('test')->findOrFail($attemptId);

        if ($attempt->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($attempt->status !== 'in_progress') {
            return response()->json(['message' => 'Attempt is not active'], 403);
        }

        if ($attempt->is_blocked) {
            return response()->json([
                'message' => 'Attempt Anda sudah diblokir oleh pengawas',
                'attempt' => $attempt,
            ], 423);
        }

        $validator = Validator::make($request->all(), [
            'event_type' => 'required|string|max:100',
            'description' => 'nullable|string',
            'metadata' => 'nullable|array',
            'is_violation' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $shouldCount = $request->boolean('is_violation', true);
        $autoBlocked = false;
        $event = null;

        // Check if cheat detection is enabled for this test
        $cheatDetectionEnabled = $attempt->test->cheat_detection_enabled ?? true;

        DB::transaction(function () use ($request, $attempt, $shouldCount, $cheatDetectionEnabled, &$autoBlocked, &$event) {
            $attempt->refresh();

            if ($attempt->is_blocked) {
                $autoBlocked = true;
                return;
            }

            $event = TestAttemptEvent::create([
                'attempt_id' => $attempt->id,
                'event_type' => $request->event_type,
                'triggered_by' => 'student',
                'description' => $request->get('description'),
                'metadata' => $request->get('metadata'),
            ]);

            // Only count violations and auto-block if cheat detection is enabled
            if ($shouldCount && $cheatDetectionEnabled) {
                $attempt->cheat_count = ($attempt->cheat_count ?? 0) + 1;
            }

            $attempt->last_activity_at = now();
            $attempt->save();

            // Auto-block only if cheat detection is enabled
            if ($shouldCount && $cheatDetectionEnabled && !$attempt->is_blocked && $attempt->cheat_count >= self::MAX_CHEAT_EVENTS) {
                $this->performBlock($attempt, 'Sistem mendeteksi aktivitas mencurigakan berulang', 'system');
                $autoBlocked = true;
            }
        });

        $attempt->refresh();
        $attempt->load(['test', 'events' => function ($query) {
            $query->latest()->limit(5);
        }]);

        return response()->json([
            'message' => 'Event recorded',
            'cheat_count' => $attempt->cheat_count,
            'auto_blocked' => $autoBlocked,
            'cheat_detection_enabled' => $cheatDetectionEnabled,
            'attempt' => $attempt,
            'event' => $event,
        ], $autoBlocked ? 423 : 200);
    }

    /**
     * Finish a test attempt
     */
    public function finish(Request $request, $attemptId)
    {
        $attempt = TestAttempt::with('test')->findOrFail($attemptId);

        Log::info('Finish Attempt Request', [
            'attempt_id' => $attemptId,
            'user_id' => $request->user()->id,
            'attempt_user_id' => $attempt->user_id,
            'current_status' => $attempt->status,
            'is_blocked' => $attempt->is_blocked,
        ]);

        // Check if attempt belongs to user
        if ($attempt->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Check if attempt is still in progress
        if ($attempt->status !== 'in_progress') {
            Log::warning('Attempt not in progress', [
                'attempt_id' => $attemptId,
                'status' => $attempt->status,
            ]);
            return response()->json([
                'message' => 'Test attempt is not in progress. Current status: ' . $attempt->status
            ], 403);
        }

        // Calculate score
        $totalPoints = $attempt->test->questions()->sum('points');
        $earnedPoints = $attempt->answers()->sum('points_earned');
        $score = $totalPoints > 0 ? ($earnedPoints / $totalPoints) * 100 : 0;

        Log::info('Finishing attempt', [
            'attempt_id' => $attemptId,
            'total_points' => $totalPoints,
            'earned_points' => $earnedPoints,
            'score' => $score,
        ]);

        $attempt->update([
            'finished_at' => now(),
            'score' => $score,
            'is_passed' => $score >= $attempt->test->passing_score,
            'status' => 'completed',
            'last_activity_at' => now(),
        ]);

        Log::info('Attempt finished successfully', [
            'attempt_id' => $attemptId,
            'final_status' => $attempt->status,
        ]);

        return response()->json([
            'message' => 'Test completed successfully',
            'attempt' => $attempt->load('test', 'answers.question', 'answers.option'),
        ]);
    }

    /**
     * Get user's test attempts
     */
    public function myAttempts(Request $request)
    {
        $query = TestAttempt::with(['test', 'answers'])
            ->where('user_id', $request->user()->id);

        // Filter by test_id if provided
        if ($request->has('test_id')) {
            $query->where('test_id', $request->test_id);
        }

        $attempts = $query->latest()->paginate(10);

        return response()->json($attempts);
    }

    /**
     * Get a specific attempt
     */
    public function show($attemptId)
    {
        $attempt = TestAttempt::with([
            'test.questions.options',
            'user.class',
            'answers' => function ($query) {
                $query->with(['question.options', 'option']);
            }
        ])->findOrFail($attemptId);

        // Calculate statistics for the detail view
        $totalQuestions = $attempt->test->questions()->count();
        $answers = $attempt->answers;

        // Only count multiple choice for correct/wrong
        $mcAnswers = $answers->filter(function ($answer) {
            return $answer->question && $answer->question->question_type === 'multiple_choice';
        });

        $correctAnswers = $mcAnswers->where('is_correct', true)->count();
        $wrongAnswers = $mcAnswers->where('is_correct', false)->count();
        $totalAnswered = $answers->count();
        $unanswered = $totalQuestions - $totalAnswered;

        // Calculate total points
        $totalPoints = $attempt->test->questions()->sum('points');
        $earnedPoints = $answers->sum('points_earned');
        $percentage = $totalPoints > 0 ? ($earnedPoints / $totalPoints) * 100 : 0;

        // Add user's class name to user object
        if ($attempt->user && $attempt->user->class) {
            $attempt->user->class_name = $attempt->user->class->class_name;
        }

        // Transform answers to include question_type for frontend
        $transformedAnswers = $answers->map(function ($answer) {
            $answerData = $answer->toArray();
            if ($answer->question) {
                $answerData['question_type'] = $answer->question->question_type;
            }
            return $answerData;
        });

        $attemptData = $attempt->toArray();
        $attemptData['answers'] = $transformedAnswers;
        $attemptData['correct_answers'] = $correctAnswers;
        $attemptData['wrong_answers'] = $wrongAnswers;
        $attemptData['total_answered'] = $totalAnswered;
        $attemptData['unanswered'] = $unanswered;
        $attemptData['total_points'] = $earnedPoints;
        $attemptData['max_points'] = $totalPoints;
        $attemptData['percentage'] = round($percentage, 2);

        return response()->json($attemptData);
    }
    /**
     * Get all attempts for a test (for guru/admin)
     */
    public function testAttempts(Request $request, $testId)
    {
        $test = Test::findOrFail($testId);

        // Check if user is creator or admin
        if ($test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $attempts = TestAttempt::with(['user', 'answers'])
            ->where('test_id', $testId)
            ->latest()
            ->paginate(20);

        return response()->json($attempts);
    }

    /**
     * Monitor attempts for a specific test
     */
    public function monitor(Request $request, $testId)
    {
        $test = Test::withCount(['questions', 'allowedStudents'])->findOrFail($testId);

        if ($test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Check if this is a remedial test (has allowed students restriction)
        $isRemedialTest = $test->allowed_students_count > 0;
        $allowedStudentIds = [];

        if ($isRemedialTest) {
            // Load allowed student IDs for remedial test
            $allowedStudentIds = $test->allowedStudents()->pluck('users.id')->toArray();
        }

        // Get only the LATEST attempt per user to avoid showing stale data
        $attempts = TestAttempt::with([
            'user:id,name,email,nisn,class_id',
            'user.class:id,class_name',
            'events' => function ($query) {
                $query->latest()->limit(5);
            },
            'test:id,total_questions',
        ])
            ->withCount('answers as answered_count')
            ->where('test_id', $testId)
            ->whereIn('id', function ($query) use ($testId) {
                $query->selectRaw('MAX(id)')
                    ->from('test_attempts')
                    ->where('test_id', $testId)
                    ->groupBy('user_id');
            })
            ->orderBy('started_at', 'desc')
            ->get();

        Log::info('Monitor Query Results', [
            'test_id' => $testId,
            'attempts_count' => $attempts->count(),
            'attempts' => $attempts->map(fn($a) => [
                'id' => $a->id,
                'user_id' => $a->user_id,
                'user_name' => $a->user->name,
                'status' => $a->status,
                'started_at' => $a->started_at
            ])
        ]);

        $totalQuestions = $test->total_questions ?? $test->questions_count ?? 0;

        $attemptDetails = $attempts->mapWithKeys(function (TestAttempt $attempt) use ($totalQuestions) {
            $questionsTotal = $totalQuestions > 0 ? $totalQuestions : ($attempt->test->total_questions ?? 0);
            $progress = $questionsTotal > 0
                ? round(($attempt->answered_count / max($questionsTotal, 1)) * 100)
                : 0;

            $statusLabel = match ($attempt->status) {
                'completed' => 'Selesai',
                'blocked' => 'Diblokir',
                default => 'Sedang berlangsung',
            };

            return [
                $attempt->user_id => [
                    'id' => $attempt->id,
                    'student' => [
                        'id' => $attempt->user->id,
                        'name' => $attempt->user->name,
                        'email' => $attempt->user->email,
                        'nisn' => $attempt->user->nisn ?? null,
                        'class_name' => optional($attempt->user->class)->class_name,
                    ],
                    'status' => $attempt->status,
                    'status_label' => $statusLabel,
                    'is_blocked' => (bool) $attempt->is_blocked,
                    'blocked_reason' => $attempt->blocked_reason,
                    'cheat_count' => $attempt->cheat_count,
                    'answered_count' => $attempt->answered_count,
                    'total_questions' => $questionsTotal,
                    'progress_percent' => $progress,
                    'started_at' => optional($attempt->started_at)->toIso8601String(),
                    'last_activity_at' => optional($attempt->last_activity_at)->toIso8601String(),
                    'finished_at' => optional($attempt->finished_at)->toIso8601String(),
                    'events' => $attempt->events->map(function (TestAttemptEvent $event) {
                        return [
                            'id' => $event->id,
                            'event_type' => $event->event_type,
                            'triggered_by' => $event->triggered_by,
                            'description' => $event->description,
                            'metadata' => $event->metadata,
                            'created_at' => $event->created_at->toIso8601String(),
                        ];
                    })->all(),
                ],
            ];
        });

        $studentQuery = User::query()
            ->select(['id', 'name', 'email', 'nisn', 'class_id', 'kelas'])
            ->where('role', 'siswa')
            ->where('is_active', true)
            ->with(['class:id,class_name'])
            ->orderBy('name');

        // If this is a remedial test, only show allowed students
        if ($isRemedialTest && !empty($allowedStudentIds)) {
            $studentQuery->whereIn('id', $allowedStudentIds);
        } else {
            // Normal test: filter by class
            if ($test->class_id) {
                $studentQuery->where('class_id', $test->class_id);
            } elseif (!empty($test->kelas)) {
                $classNames = collect(explode(',', $test->kelas))
                    ->map(fn($value) => trim($value))
                    ->filter();

                if ($classNames->isNotEmpty()) {
                    $studentQuery->where(function ($students) use ($classNames) {
                        foreach ($classNames as $index => $className) {
                            $students->{$index === 0 ? 'where' : 'orWhere'}(function ($subQuery) use ($className) {
                                $subQuery->where('kelas', 'like', '%' . $className . '%')
                                    ->orWhereHas('class', function ($classQuery) use ($className) {
                                        $classQuery->where('class_name', $className);
                                    });
                            });
                        }
                    });
                }
            }
        }

        $students = $studentQuery->get();

        // Ensure every recorded attempt is still represented even if the student no longer matches class filters.
        $studentsById = $students->keyBy('id');
        foreach ($attempts as $attempt) {
            if (!$studentsById->has($attempt->user_id)) {
                $studentsById->put($attempt->user_id, $attempt->user);
            }
        }

        $participants = $studentsById->values()->sortBy('name')->values();

        $payload = $participants->map(function (User $student) use ($attemptDetails, $totalQuestions) {
            if ($attemptDetails->has($student->id)) {
                return $attemptDetails->get($student->id);
            }

            return [
                'id' => null,
                'student' => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'nisn' => $student->nisn ?? null,
                    'class_name' => optional($student->class)->class_name ?? ($student->kelas ?? null),
                ],
                'status' => 'not_started',
                'status_label' => 'Belum memulai (belum login / belum klik ujian)',
                'is_blocked' => false,
                'blocked_reason' => null,
                'cheat_count' => 0,
                'answered_count' => 0,
                'total_questions' => $totalQuestions,
                'progress_percent' => 0,
                'started_at' => null,
                'last_activity_at' => null,
                'finished_at' => null,
                'events' => [],
            ];
        });

        return response()->json([
            'test' => [
                'id' => $test->id,
                'title' => $test->title,
                'duration' => $test->duration,
                'kelas' => $test->kelas,
                'subject' => $test->subject,
                'total_questions' => $totalQuestions,
                'cheat_detection_enabled' => $test->cheat_detection_enabled ?? true,
                'is_remedial' => $isRemedialTest,
                'allowed_students_count' => $test->allowed_students_count ?? 0,
            ],
            'attempts' => $payload,
        ]);
    }

    /**
     * Block an attempt manually by teacher/admin
     */
    public function blockAttempt(Request $request, $attemptId)
    {
        $attempt = TestAttempt::with('test')->findOrFail($attemptId);

        if ($attempt->test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($attempt->status === 'completed') {
            return response()->json(['message' => 'Attempt sudah selesai dan tidak dapat diblokir'], 422);
        }

        $reason = $request->input('reason') ?: 'Diblokir oleh pengawas';

        $this->performBlock($attempt, $reason, 'teacher');

        $attempt->refresh();

        return response()->json([
            'message' => 'Attempt berhasil diblokir',
            'attempt' => $attempt,
        ]);
    }

    /**
     * Unblock an attempt to allow student to continue
     */
    public function unblockAttempt(Request $request, $attemptId)
    {
        $attempt = TestAttempt::with('test')->findOrFail($attemptId);

        if ($attempt->test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (!$attempt->is_blocked) {
            return response()->json(['message' => 'Attempt tidak dalam kondisi diblokir']);
        }

        if (now()->greaterThan($attempt->test->end_time)) {
            return response()->json([
                'message' => 'Ujian sudah berakhir, attempt tidak dapat dibuka kembali',
            ], 422);
        }

        $attempt->update([
            'is_blocked' => false,
            'blocked_at' => null,
            'blocked_reason' => null,
            'status' => 'in_progress',
            'finished_at' => null,
            'last_activity_at' => now(),
        ]);

        TestAttemptEvent::create([
            'attempt_id' => $attempt->id,
            'event_type' => 'unblocked',
            'triggered_by' => 'teacher',
            'description' => $request->input('reason') ?? 'Attempt dibuka kembali oleh pengawas',
        ]);

        $attempt->refresh();

        return response()->json([
            'message' => 'Attempt berhasil dibuka kembali',
            'attempt' => $attempt,
        ]);
    }

    private function performBlock(TestAttempt $attempt, string $reason, string $triggeredBy = 'system'): void
    {
        if ($attempt->is_blocked) {
            return;
        }

        $attempt->update([
            'is_blocked' => true,
            'blocked_at' => now(),
            'blocked_reason' => $reason,
            'status' => 'blocked',
            'finished_at' => $attempt->finished_at ?? now(),
            'last_activity_at' => now(),
        ]);

        TestAttemptEvent::create([
            'attempt_id' => $attempt->id,
            'event_type' => 'blocked',
            'triggered_by' => $triggeredBy,
            'description' => $reason,
        ]);
    }
}
