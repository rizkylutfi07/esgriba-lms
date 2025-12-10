<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Test;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\QuestionPackage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class TestController extends Controller
{
    /**
     * Get all tests
     */
    public function index(Request $request)
    {
        // Auto-deactivate expired tests before querying
        Test::autoDeactivateExpired();

        $query = Test::with(['creator', 'questions'])->withCount('allowedStudents');
        
        // Store server time for response
        $serverTime = now()->toIso8601String();

        // Filter for siswa: only active tests for their class
        if ($request->user()->isSiswa()) {
            $student = $request->user();
            $student->load('class');
            $userId = $student->id;

            // Show tests that meet any of these conditions:
            // 1. Active AND within time range (normal case)
            // 2. OR student has an in_progress attempt (allow resume even if expired/deactivated)
            $query->where('start_time', '<=', now())
                ->where(function($mainQuery) use ($userId) {
                    $mainQuery
                        // Condition 1: Active and not expired
                        ->where(function($activeQuery) {
                            $activeQuery->where('is_active', true)
                                ->where('end_time', '>=', now());
                        })
                        // Condition 2: OR has in_progress attempt (even if expired/inactive)
                        ->orWhereHas('attempts', function($attemptQuery) use ($userId) {
                            $attemptQuery->where('user_id', $userId)
                                ->where('status', 'in_progress');
                        });
                });

            // Filter by student's class using class_id relation
            if ($student->class) {
                $userClassName = $student->class->class_name; // e.g., "X TEKNIK KENDARAAN RINGAN"

                $query->where(function ($q) use ($userClassName) {
                    // Check if kelas is null (available for all) OR matches user's class
                    $q->whereNull('kelas')
                        ->orWhere('kelas', $userClassName)
                        ->orWhere('kelas', 'like', '%' . $userClassName . '%');
                });
            } else {
                // If student has no class assigned, show only tests with null kelas
                $query->whereNull('kelas');
            }

            // Exclude tests where LATEST attempt is completed (not just ANY completed attempt)
            if ($request->get('status') === 'active' || !$request->has('status')) {
                $query->where(function($testQuery) use ($userId) {
                    $testQuery
                        // Either no attempts at all
                        ->whereDoesntHave('attempts', function($q) use ($userId) {
                            $q->where('user_id', $userId);
                        })
                        // OR latest attempt is not completed (could be in_progress or blocked)
                        ->orWhereHas('attempts', function($attemptQuery) use ($userId) {
                            $attemptQuery->where('user_id', $userId)
                                ->where('status', '!=', 'completed')
                                ->whereRaw('id = (SELECT MAX(id) FROM test_attempts WHERE user_id = ? AND test_id = tests.id)', [$userId]);
                        });
                });
            }

            // Restrict to allowedStudents when remedial list exists
            $query->where(function ($q) use ($userId) {
                $q->whereDoesntHave('allowedStudents')
                    ->orWhereHas('allowedStudents', function ($sq) use ($userId) {
                        $sq->where('users.id', $userId);
                    });
            });

            // Eager load latest attempt info for the current student
            $query->with(['attempts' => function ($attemptQuery) use ($userId) {
                $attemptQuery->where('user_id', $userId)
                    ->latest()
                    ->limit(1);
            }]);
        }

        // Filter for guru: only their tests
        if ($request->user()->isGuru() && !$request->user()->isAdmin()) {
            $query->where('created_by', $request->user()->id);
        }

        // Filter by subject
        if ($request->has('subject')) {
            $query->where('subject', $request->subject);
        }

        // Filter by class
        if ($request->has('kelas')) {
            $query->where('kelas', $request->kelas);
        }

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true)
                    ->where('start_time', '<=', now())
                    ->where('end_time', '>=', now());
            } elseif ($request->status === 'upcoming') {
                $query->where('start_time', '>', now());
            } elseif ($request->status === 'finished') {
                $query->where('end_time', '<', now());
            } elseif ($request->status === 'draft') {
                $query->where('is_active', false);
            }
        }

        // Search
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $tests = $query->paginate($request->get('per_page', 10));

        if ($request->user()->isSiswa()) {
            foreach ($tests as $testItem) {
                $currentAttempt = $testItem->attempts->first();
                $testItem->setAttribute('current_attempt', $currentAttempt);
                $testItem->setAttribute('can_resume', $currentAttempt && $currentAttempt->status === 'in_progress');
                $testItem->setAttribute('is_completed', $currentAttempt && $currentAttempt->status === 'completed');
                $testItem->unsetRelation('attempts');
            }
        }

        // Tambahkan server time untuk sinkronisasi
        $response = $tests->toArray();
        $response['server_time'] = $serverTime;

        return response()->json($response);
    }

    /**
     * Store a new test
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration' => 'required|integer|min:1',
            'passing_score' => 'required|integer|min:0|max:100',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'subject' => 'nullable|string',
            'kelas' => 'nullable|string',
            'created_by' => 'nullable|integer|exists:users,id',
            'cheat_detection_enabled' => 'nullable|boolean',
            'session' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Use created_by from request if provided (admin creating for teacher), otherwise use current user
        $createdBy = $request->has('created_by') ? $request->created_by : $request->user()->id;

        $test = Test::create([
            'title' => $request->title,
            'description' => $request->description,
            'duration' => $request->duration,
            'passing_score' => $request->passing_score,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'subject' => $request->subject,
            'kelas' => $request->kelas,
            'created_by' => $createdBy,
            'cheat_detection_enabled' => $request->get('cheat_detection_enabled', true),
            'session' => $request->get('session'),
        ]);

        // Clear cache
        Cache::flush();

        return response()->json([
            'message' => 'Test created successfully',
            'test' => $test,
        ], 201);
    }

    /**
     * Show a specific test
     */
    public function show($id)
    {
        $test = Test::with(['creator', 'questions.options'])->withCount('allowedStudents')->findOrFail($id);

        Log::info("Test Show API", [
            'test_id' => $id,
            'questions_count' => $test->questions->count(),
            'has_questions' => $test->questions->count() > 0
        ]);

        // Tambahkan server time untuk sinkronisasi waktu
        $response = $test->toArray();
        $response['server_time'] = now()->toIso8601String();
        
        Log::info("Test Show Response", [
            'test_id' => $id,
            'response_questions_count' => count($response['questions'] ?? [])
        ]);
        
        return response()->json($response);
    }

    /**
     * Update a test
     */
    public function update(Request $request, $id)
    {
        $test = Test::findOrFail($id);

        // Check if user is the creator
        if ($test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'duration' => 'sometimes|required|integer|min:1',
            'passing_score' => 'sometimes|required|integer|min:0|max:100',
            'is_active' => 'sometimes|boolean',
            'cheat_detection_enabled' => 'sometimes|boolean',
            'start_time' => 'sometimes|required|date',
            'end_time' => 'sometimes|required|date',
            'session' => 'sometimes|nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $test->update($request->all());

        // Clear cache
        Cache::flush();

        return response()->json([
            'message' => 'Test updated successfully',
            'test' => $test,
        ]);
    }

    /**
     * Delete a test
     */
    public function destroy(Request $request, $id)
    {
        $test = Test::findOrFail($id);

        // Check if user is the creator
        if ($test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $test->delete();

        // Clear cache untuk /api/tests
        \Illuminate\Support\Facades\Cache::flush();

        return response()->json(['message' => 'Test deleted successfully']);
    }

    /**
     * Add questions to a test
     */
    public function addQuestions(Request $request, $id)
    {
        $test = Test::findOrFail($id);

        // Check if user is the creator
        if ($test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'questions' => 'required|array',
            'questions.*.question_text' => 'required|string',
            'questions.*.question_type' => 'required|in:multiple_choice,essay',
            'questions.*.points' => 'required|integer|min:1',
            'questions.*.expected_answer' => 'nullable|string',
            'questions.*.options' => 'required_if:questions.*.question_type,multiple_choice|array|min:2',
            'questions.*.options.*.option_text' => 'required_with:questions.*.options|string',
            'questions.*.options.*.is_correct' => 'required_with:questions.*.options|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        foreach ($request->questions as $index => $questionData) {
            $question = Question::create([
                'test_id' => $test->id,
                'question_text' => $questionData['question_text'],
                'question_type' => $questionData['question_type'],
                'expected_answer' => $questionData['expected_answer'] ?? null,
                'points' => $questionData['points'],
                'order' => $index + 1,
            ]);

            if ($questionData['question_type'] === 'multiple_choice') {
                foreach ($questionData['options'] as $optionIndex => $optionData) {
                    QuestionOption::create([
                        'question_id' => $question->id,
                        'option_text' => $optionData['option_text'],
                        'is_correct' => $optionData['is_correct'],
                        'order' => $optionIndex + 1,
                    ]);
                }
            }
        }

        // Update total questions
        $test->update(['total_questions' => $test->questions()->count()]);

        return response()->json([
            'message' => 'Questions added successfully',
            'test' => $test->load('questions.options'),
        ]);
    }

    /**
     * Import questions from a question package into the test
     */
    public function addPackage(Request $request, $id)
    {
        $test = Test::findOrFail($id);

        if ($test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'package_id' => 'required|exists:question_packages,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $package = QuestionPackage::with('questions')->findOrFail($request->package_id);

        if ($package->questions->isEmpty()) {
            return response()->json([
                'message' => 'Paket soal tidak memiliki soal untuk diimport',
            ], 422);
        }

        DB::beginTransaction();

        try {
            $order = Question::where('test_id', $test->id)->max('order') ?? 0;

            foreach ($package->questions as $bankQuestion) {
                $order++;

                $question = Question::create([
                    'test_id' => $test->id,
                    'question_text' => $bankQuestion->question_text,
                    'question_type' => $bankQuestion->question_type,
                    'expected_answer' => $bankQuestion->expected_answer ?? null,
                    'points' => $bankQuestion->points,
                    'order' => $order,
                ]);

                $options = $bankQuestion->options ?? [];

                if (in_array($bankQuestion->question_type, ['multiple_choice', 'true_false'], true) && is_array($options)) {
                    foreach ($options as $index => $option) {
                        $text = $option['text'] ?? ($option['option_text'] ?? null);

                        if ($text === null) {
                            continue;
                        }

                        QuestionOption::create([
                            'question_id' => $question->id,
                            'option_text' => $text,
                            'is_correct' => (bool) ($option['is_correct'] ?? false),
                            'order' => $index + 1,
                        ]);
                    }
                }

                $bankQuestion->incrementUsage();
            }

            $test->update(['total_questions' => $test->questions()->count()]);

            DB::commit();

            return response()->json([
                'message' => 'Paket soal berhasil ditambahkan ke ujian',
                'test' => $test->load('questions.options'),
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();

            throw $th;
        }
    }

    /**
     * Duplicate a test
     */
    public function duplicate(Request $request, $id)
    {
        $test = Test::with(['questions.options'])->findOrFail($id);

        // Check if user is the creator
        if ($test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Create new test
        $newTest = $test->replicate();
        $newTest->title = $test->title . ' (Copy)';
        $newTest->is_active = false; // Set as draft
        $newTest->created_by = $request->user()->id;
        $newTest->save();

        // Duplicate questions
        foreach ($test->questions as $question) {
            $newQuestion = $question->replicate();
            $newQuestion->test_id = $newTest->id;
            $newQuestion->save();

            // Duplicate options
            foreach ($question->options as $option) {
                $newOption = $option->replicate();
                $newOption->question_id = $newQuestion->id;
                $newOption->save();
            }
        }

        return response()->json([
            'message' => 'Test duplicated successfully',
            'test' => $newTest->load('questions.options'),
        ], 201);
    }

    /**
     * Clone a test specifically for remedial purposes
     * Optionally accept start_time, end_time, and initial student_ids for allowed list
     */
    public function cloneRemedial(Request $request, $id)
    {
        $source = Test::with(['questions.options'])->findOrFail($id);

        if ($source->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'start_time' => 'required|date|after:now',
            'end_time' => 'required|date|after:start_time',
            'student_ids' => 'sometimes|array',
            'student_ids.*' => 'integer|exists:users,id',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $new = $source->replicate();
            $new->title = $source->title . ' (Remidi)';
            $new->is_active = false; // start as draft
            // Use provided schedule (required now)
            $new->start_time = $request->start_time;
            $new->end_time = $request->end_time;
            $new->created_by = $request->user()->id;
            $new->save();

            foreach ($source->questions as $question) {
                $q = $question->replicate();
                $q->test_id = $new->id;
                $q->save();
                foreach ($question->options as $opt) {
                    $o = $opt->replicate();
                    $o->question_id = $q->id;
                    $o->save();
                }
            }

            // Initialize remedial list if provided
            if ($request->filled('student_ids')) {
                $ids = \App\Models\User::whereIn('id', $request->student_ids)->where('role', 'siswa')->pluck('id')->all();
                $new->allowedStudents()->sync($ids);
            }

            $new->load('questions.options');
            DB::commit();

            return response()->json([
                'message' => 'Remedial test cloned successfully',
                'test' => $new,
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to clone remedial test',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Publish/Unpublish a test
     */
    public function togglePublish(Request $request, $id)
    {
        $test = Test::findOrFail($id);

        // Check if user is the creator
        if ($test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Prevent publishing expired tests
        if (!$test->is_active && $test->end_time < now()) {
            return response()->json([
                'message' => 'Tidak dapat mempublikasikan ujian yang sudah berakhir. Silakan perbarui waktu ujian terlebih dahulu.',
            ], 422);
        }

        $newStatus = !$test->is_active;
        
        // Log for debugging
        Log::info('Toggle Publish', [
            'test_id' => $id,
            'old_status' => $test->is_active,
            'new_status' => $newStatus,
            'end_time' => $test->end_time,
            'is_expired' => $test->end_time < now()
        ]);
        
        // Update using query builder to ensure it saves
        $affected = DB::table('tests')
            ->where('id', $id)
            ->update([
                'is_active' => $newStatus,
                'updated_at' => now()
            ]);

        Log::info('Toggle Publish - Rows affected', ['affected' => $affected]);

        // Clear cache
        Cache::flush();

        // Refresh the model to get updated data from database
        $test = Test::find($id);
        
        Log::info('Toggle Publish - After refresh', [
            'is_active_in_db' => $test->is_active
        ]);

        return response()->json([
            'message' => $newStatus ? 'Test published successfully' : 'Test unpublished successfully',
            'data' => $test,
        ]);
    }

    /**
     * Update question in a test
     */
    public function updateQuestion(Request $request, $testId, $questionId)
    {
        $test = Test::findOrFail($testId);

        // Check if user is the creator
        if ($test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $question = Question::where('test_id', $testId)->findOrFail($questionId);

        $validator = Validator::make($request->all(), [
            'question_text' => 'sometimes|required|string',
            'question_type' => 'sometimes|required|in:multiple_choice,essay,true_false',
            'points' => 'sometimes|required|integer|min:1',
            'expected_answer' => 'nullable|string',
            'options' => 'sometimes|array',
            'options.*.id' => 'sometimes|exists:question_options,id',
            'options.*.option_text' => 'required_with:options|string',
            'options.*.is_correct' => 'required_with:options|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $question->update($request->only(['question_text', 'question_type', 'points', 'expected_answer']));

        // Update options if provided
        if ($request->has('options')) {
            foreach ($request->options as $optionData) {
                if (isset($optionData['id'])) {
                    // Update existing option
                    QuestionOption::where('id', $optionData['id'])
                        ->where('question_id', $questionId)
                        ->update([
                            'option_text' => $optionData['option_text'],
                            'is_correct' => $optionData['is_correct'],
                        ]);
                } else {
                    // Create new option
                    QuestionOption::create([
                        'question_id' => $questionId,
                        'option_text' => $optionData['option_text'],
                        'is_correct' => $optionData['is_correct'],
                        'order' => QuestionOption::where('question_id', $questionId)->max('order') + 1,
                    ]);
                }
            }
        }

        return response()->json([
            'message' => 'Question updated successfully',
            'question' => $question->load('options'),
        ]);
    }

    /**
     * Delete question from test
     */
    public function deleteQuestion(Request $request, $testId, $questionId)
    {
        $test = Test::findOrFail($testId);

        // Check if user is the creator
        if ($test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $question = Question::where('test_id', $testId)->findOrFail($questionId);
        $question->delete();

        // Update total questions
        $test->update(['total_questions' => $test->questions()->count()]);

        return response()->json(['message' => 'Question deleted successfully']);
    }

    /**
     * Get test results with essay answers for grading
     */
    public function getResults(Request $request, $id)
    {
        $test = Test::with(['creator'])->findOrFail($id);

        // Check if user is the creator or admin
        if ($test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Get attempts with detailed information
        $attempts = DB::table('test_attempts')
            ->join('users', 'test_attempts.user_id', '=', 'users.id')
            ->leftJoin('classes', 'users.class_id', '=', 'classes.id')
            ->where('test_attempts.test_id', $id)
            ->where('test_attempts.status', 'completed')
            ->select([
                'test_attempts.id',
                'test_attempts.user_id',
                'users.name as student_name',
                'users.nisn as student_nis',
                'classes.class_name',
                'test_attempts.score',
                'test_attempts.started_at',
                'test_attempts.finished_at',
                'test_attempts.status',
                DB::raw('TIMESTAMPDIFF(SECOND, test_attempts.started_at, test_attempts.finished_at) as duration_seconds')
            ])
            ->orderBy('test_attempts.finished_at', 'desc')
            ->get();

        // Enrich with answer details for each attempt
        foreach ($attempts as $attempt) {
            // Get all answers for this attempt
            $answers = DB::table('user_answers')
                ->join('questions', 'user_answers.question_id', '=', 'questions.id')
                ->where('user_answers.attempt_id', $attempt->id)
                ->select([
                    'user_answers.is_correct',
                    'user_answers.points_earned',
                    'questions.points as max_points',
                    'questions.question_type'
                ])
                ->get();

            // Count only multiple choice for correct/wrong
            $mcAnswers = $answers->where('question_type', 'multiple_choice');
            $correctCount = $mcAnswers->where('is_correct', true)->count();
            $wrongCount = $mcAnswers->where('is_correct', false)->count();

            // Calculate earned points from answers
            $totalPoints = $answers->sum('points_earned');

            // IMPORTANT: Denominator must be total points of ALL questions in the test,
            // not only the answered ones, so unanswered questions penalize the score.
            $maxPoints = DB::table('questions')
                ->where('test_id', $id)
                ->sum('points');

            $percentage = $maxPoints > 0 ? round(($totalPoints / $maxPoints) * 100, 2) : 0;

            // Count total answered questions
            $totalAnswered = $answers->count();

            // Add computed fields
            $attempt->correct_answers = $correctCount;
            $attempt->wrong_answers = $wrongCount;
            $attempt->total_points = $totalPoints;
            $attempt->max_points = $maxPoints;
            $attempt->percentage = $percentage;
            $attempt->total_answered = $totalAnswered;
            $attempt->duration_minutes = round($attempt->duration_seconds / 60, 0);
        }

        return response()->json([
            'data' => $attempts,
            'total' => count($attempts)
        ]);
    }

    /**
     * Get essay answers for a specific attempt
     */
    public function getEssayAnswers($testId, $attemptId)
    {
        $test = Test::findOrFail($testId);
        $attempt = DB::table('test_attempts')
            ->where('id', $attemptId)
            ->where('test_id', $testId)
            ->first();

        if (!$attempt) {
            return response()->json(['message' => 'Attempt not found'], 404);
        }

        // Get all essay answers for this attempt
        $essayAnswers = DB::table('user_answers')
            ->join('questions', 'user_answers.question_id', '=', 'questions.id')
            ->where('user_answers.attempt_id', $attemptId)
            ->where('questions.question_type', 'essay')
            ->select([
                'user_answers.id as answer_id',
                'questions.id as question_id',
                'questions.question_text',
                'questions.expected_answer',
                'questions.points as max_points',
                'user_answers.answer_text',
                'user_answers.points_earned',
                'user_answers.is_correct'
            ])
            ->orderBy('questions.order')
            ->get();

        return response()->json([
            'attempt' => $attempt,
            'essay_answers' => $essayAnswers
        ]);
    }

    /**
     * Grade essay answer
     */
    public function gradeEssay(Request $request, $testId, $attemptId, $answerId)
    {
        $validator = Validator::make($request->all(), [
            'points_earned' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $test = Test::findOrFail($testId);

        // Check if user is the creator or admin
        if ($test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        DB::beginTransaction();

        try {
            // Get the answer with question info
            $answer = DB::table('user_answers')
                ->join('questions', 'user_answers.question_id', '=', 'questions.id')
                ->where('user_answers.id', $answerId)
                ->where('user_answers.attempt_id', $attemptId)
                ->where('questions.test_id', $testId)
                ->select('user_answers.*', 'questions.points as max_points')
                ->first();

            if (!$answer) {
                return response()->json(['message' => 'Answer not found'], 404);
            }

            // Validate points don't exceed max
            if ($request->points_earned > $answer->max_points) {
                return response()->json([
                    'message' => 'Points earned cannot exceed maximum points'
                ], 422);
            }

            // Update the answer
            DB::table('user_answers')
                ->where('id', $answerId)
                ->update([
                    'points_earned' => $request->points_earned,
                    'is_correct' => $request->points_earned > 0,
                    'updated_at' => now()
                ]);

            // Recalculate total score for the attempt
            $totalPoints = DB::table('user_answers')
                ->where('attempt_id', $attemptId)
                ->sum('points_earned');

            $totalMaxPoints = DB::table('user_answers')
                ->join('questions', 'user_answers.question_id', '=', 'questions.id')
                ->where('user_answers.attempt_id', $attemptId)
                ->sum('questions.points');

            $score = $totalMaxPoints > 0 ? round(($totalPoints / $totalMaxPoints) * 100, 2) : 0;

            // Update attempt score
            DB::table('test_attempts')
                ->where('id', $attemptId)
                ->update([
                    'score' => $score,
                    'updated_at' => now()
                ]);

            DB::commit();

            return response()->json([
                'message' => 'Essay graded successfully',
                'score' => $score
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to grade essay',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
