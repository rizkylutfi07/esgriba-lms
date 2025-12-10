<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\Question;
use App\Models\UserAnswer;
use App\Models\User;
use App\Models\Classes;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Dashboard statistik untuk admin
     */
    public function adminDashboard(Request $request)
    {
        // Total users by role
        $totalGuru = User::where('role', 'guru')->count();
        $totalSiswa = User::where('role', 'siswa')->count();

        // Total classes and subjects
        $totalClasses = Classes::count();
        $totalSubjects = Subject::count();

        // Total tests
        $totalTests = Test::count();

        // Active tests
        $activeTests = Test::where('is_active', true)
            ->where('start_time', '<=', now())
            ->where('end_time', '>=', now())
            ->count();

        // Total attempts
        $totalAttempts = TestAttempt::count();

        // Average score across all tests
        $avgScore = TestAttempt::where('status', 'completed')->avg('score');

        return response()->json([
            'total_teachers' => $totalGuru,
            'total_students' => $totalSiswa,
            'total_classes' => $totalClasses,
            'total_subjects' => $totalSubjects,
            'total_tests' => $totalTests,
            'active_tests' => $activeTests,
            'total_attempts' => $totalAttempts,
            'average_score' => round($avgScore ?? 0, 1),
        ]);
    }

    /**
     * Dashboard statistik untuk guru
     */
    public function teacherDashboard(Request $request)
    {
        $userId = $request->user()->id;

        // Total tests created
        $totalTests = Test::where('created_by', $userId)->count();

        // Active tests
        $activeTests = Test::where('created_by', $userId)
            ->where('is_active', true)
            ->where('start_time', '<=', now())
            ->where('end_time', '>=', now())
            ->count();

        // Total attempts on teacher's tests
        $totalAttempts = TestAttempt::whereHas('test', function ($query) use ($userId) {
            $query->where('created_by', $userId);
        })->count();

        // Completed attempts
        $completedAttempts = TestAttempt::whereHas('test', function ($query) use ($userId) {
            $query->where('created_by', $userId);
        })->where('status', 'completed')->count();

        // Average score
        $avgScore = TestAttempt::whereHas('test', function ($query) use ($userId) {
            $query->where('created_by', $userId);
        })->where('status', 'completed')->avg('score');

        // Pass rate
        $passedAttempts = TestAttempt::whereHas('test', function ($query) use ($userId) {
            $query->where('created_by', $userId);
        })->where('is_passed', true)->count();

        $passRate = $completedAttempts > 0 ? ($passedAttempts / $completedAttempts) * 100 : 0;

        // Recent tests with stats
        $recentTests = Test::where('created_by', $userId)
            ->withCount(['attempts', 'attempts as completed_attempts_count' => function ($query) {
                $query->where('status', 'completed');
            }])
            ->withCount('allowedStudents')
            ->with(['attempts' => function ($query) {
                $query->where('status', 'completed')->latest()->limit(5);
            }])
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'summary' => [
                'total_tests' => $totalTests,
                'active_tests' => $activeTests,
                'total_attempts' => $totalAttempts,
                'completed_attempts' => $completedAttempts,
                'average_score' => round($avgScore, 2),
                'pass_rate' => round($passRate, 2),
            ],
            'recent_tests' => $recentTests,
        ]);
    }

    /**
     * Dashboard statistik untuk siswa
     */
    public function studentDashboard(Request $request)
    {
        $userId = $request->user()->id;

        // Total attempts
        $totalAttempts = TestAttempt::where('user_id', $userId)->count();

        // Completed attempts
        $completedAttempts = TestAttempt::where('user_id', $userId)
            ->where('status', 'completed')
            ->count();

        // Average score
        $avgScore = TestAttempt::where('user_id', $userId)
            ->where('status', 'completed')
            ->avg('score');

        // Passed tests
        $passedTests = TestAttempt::where('user_id', $userId)
            ->where('is_passed', true)
            ->count();

        // Pass rate
        $passRate = $completedAttempts > 0 ? ($passedTests / $completedAttempts) * 100 : 0;

        // Recent attempts
        $recentAttempts = TestAttempt::where('user_id', $userId)
            ->with('test')
            ->latest()
            ->limit(10)
            ->get();

        // Available tests
        $availableTests = Test::where('is_active', true)
            ->where('start_time', '<=', now())
            ->where('end_time', '>=', now())
            ->whereDoesntHave('attempts', function ($query) use ($userId) {
                $query->where('user_id', $userId)->where('status', 'completed');
            })
            ->count();

        return response()->json([
            'summary' => [
                'total_attempts' => $totalAttempts,
                'completed_attempts' => $completedAttempts,
                'available_tests' => $availableTests,
                'average_score' => round($avgScore, 2),
                'passed_tests' => $passedTests,
                'pass_rate' => round($passRate, 2),
            ],
            'recent_attempts' => $recentAttempts,
        ]);
    }

    /**
     * Detail statistik untuk satu test
     */
    public function testStatistics(Request $request, $testId)
    {
        $test = Test::with(['questions'])->findOrFail($testId);

        // Check permission
        if (!$request->user()->isAdmin() && $test->created_by !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Total attempts
        $totalAttempts = TestAttempt::where('test_id', $testId)->count();

        // Completed attempts
        $completedAttempts = TestAttempt::where('test_id', $testId)
            ->where('status', 'completed')
            ->count();

        // In progress attempts
        $inProgressAttempts = TestAttempt::where('test_id', $testId)
            ->where('status', 'in_progress')
            ->count();

        // Score statistics
        $scoreStats = TestAttempt::where('test_id', $testId)
            ->where('status', 'completed')
            ->selectRaw('
                AVG(score) as average_score,
                MAX(score) as highest_score,
                MIN(score) as lowest_score
            ')
            ->first();

        // Pass/Fail distribution
        $passedCount = TestAttempt::where('test_id', $testId)
            ->where('is_passed', true)
            ->count();

        $failedCount = $completedAttempts - $passedCount;

        // Score distribution (groups)
        $scoreDistribution = TestAttempt::where('test_id', $testId)
            ->where('status', 'completed')
            ->selectRaw('
                CASE
                    WHEN score >= 90 THEN "90-100"
                    WHEN score >= 80 THEN "80-89"
                    WHEN score >= 70 THEN "70-79"
                    WHEN score >= 60 THEN "60-69"
                    ELSE "0-59"
                END as score_range,
                COUNT(*) as count
            ')
            ->groupBy('score_range')
            ->get();

        // Question analysis
        $questionAnalysis = [];
        foreach ($test->questions as $question) {
            $totalAnswers = UserAnswer::where('question_id', $question->id)->count();
            $correctAnswers = UserAnswer::where('question_id', $question->id)
                ->where('is_correct', true)
                ->count();

            $questionAnalysis[] = [
                'question_id' => $question->id,
                'question_text' => substr($question->question_text, 0, 100) . '...',
                'question_type' => $question->question_type,
                'points' => $question->points,
                'total_answers' => $totalAnswers,
                'correct_answers' => $correctAnswers,
                'correct_percentage' => $totalAnswers > 0 ? round(($correctAnswers / $totalAnswers) * 100, 2) : 0,
            ];
        }

        // Top performers
        $topPerformers = TestAttempt::where('test_id', $testId)
            ->where('status', 'completed')
            ->with('user:id,name,email')
            ->orderBy('score', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'test' => $test,
            'statistics' => [
                'total_attempts' => $totalAttempts,
                'completed_attempts' => $completedAttempts,
                'in_progress_attempts' => $inProgressAttempts,
                'average_score' => round($scoreStats->average_score ?? 0, 2),
                'highest_score' => round($scoreStats->highest_score ?? 0, 2),
                'lowest_score' => round($scoreStats->lowest_score ?? 0, 2),
                'passed_count' => $passedCount,
                'failed_count' => $failedCount,
                'pass_rate' => $completedAttempts > 0 ? round(($passedCount / $completedAttempts) * 100, 2) : 0,
            ],
            'score_distribution' => $scoreDistribution,
            'question_analysis' => $questionAnalysis,
            'top_performers' => $topPerformers,
        ]);
    }

    /**
     * Detail analisis jawaban siswa
     */
    public function attemptAnalysis($attemptId)
    {
        $attempt = TestAttempt::with([
            'test.questions.options',
            'user',
            'answers.question.options',
            'answers.option'
        ])->findOrFail($attemptId);

        $analysis = [];
        foreach ($attempt->test->questions as $question) {
            $userAnswer = $attempt->answers->where('question_id', $question->id)->first();

            $analysis[] = [
                'question' => [
                    'id' => $question->id,
                    'text' => $question->question_text,
                    'type' => $question->question_type,
                    'points' => $question->points,
                ],
                'user_answer' => $userAnswer ? [
                    'option_id' => $userAnswer->option_id,
                    'answer_text' => $userAnswer->answer_text,
                    'is_correct' => $userAnswer->is_correct,
                    'points_earned' => $userAnswer->points_earned,
                ] : null,
                'correct_answer' => $question->question_type === 'multiple_choice'
                    ? $question->options->where('is_correct', true)->values()
                    : null,
                'all_options' => $question->options,
            ];
        }

        return response()->json([
            'attempt' => [
                'id' => $attempt->id,
                'student' => $attempt->user,
                'test' => $attempt->test,
                'score' => $attempt->score,
                'is_passed' => $attempt->is_passed,
                'started_at' => $attempt->started_at,
                'finished_at' => $attempt->finished_at,
                'duration_minutes' => $attempt->finished_at
                    ? $attempt->started_at->diffInMinutes($attempt->finished_at)
                    : null,
            ],
            'analysis' => $analysis,
        ]);
    }

    /**
     * Export hasil test ke format sederhana (JSON untuk diproses frontend)
     */
    public function exportTestResults($testId)
    {
        $test = Test::with(['questions'])->findOrFail($testId);

        $attempts = TestAttempt::where('test_id', $testId)
            ->where('status', 'completed')
            ->with(['user', 'answers'])
            ->orderBy('score', 'desc')
            ->get();

        $exportData = [
            'test_info' => [
                'title' => $test->title,
                'description' => $test->description,
                'total_questions' => $test->total_questions,
                'duration' => $test->duration,
                'passing_score' => $test->passing_score,
            ],
            'results' => $attempts->map(function ($attempt) {
                return [
                    'student_name' => $attempt->user->name,
                    'student_email' => $attempt->user->email,
                    'score' => $attempt->score,
                    'is_passed' => $attempt->is_passed,
                    'started_at' => $attempt->started_at,
                    'finished_at' => $attempt->finished_at,
                    'duration_minutes' => $attempt->started_at->diffInMinutes($attempt->finished_at),
                    'total_answers' => $attempt->answers->count(),
                    'correct_answers' => $attempt->answers->where('is_correct', true)->count(),
                ];
            }),
        ];

        return response()->json($exportData);
    }

    /**
     * Comparison report - membandingkan performa siswa di berbagai test
     */
    public function studentComparison(Request $request)
    {
        $userId = $request->get('student_id', $request->user()->id);

        // Pastikan guru hanya bisa lihat siswa dari test yang dibuat
        if ($request->user()->isGuru() && $userId != $request->user()->id) {
            // Validate student has attempted teacher's test
            $hasAttempt = TestAttempt::where('user_id', $userId)
                ->whereHas('test', function ($query) use ($request) {
                    $query->where('created_by', $request->user()->id);
                })
                ->exists();

            if (!$hasAttempt) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        $attempts = TestAttempt::where('user_id', $userId)
            ->where('status', 'completed')
            ->with('test')
            ->orderBy('finished_at', 'desc')
            ->limit(20)
            ->get();

        $comparison = $attempts->map(function ($attempt) {
            return [
                'test_title' => $attempt->test->title,
                'subject' => $attempt->test->subject,
                'score' => $attempt->score,
                'is_passed' => $attempt->is_passed,
                'date' => $attempt->finished_at->format('Y-m-d'),
                'duration_minutes' => $attempt->started_at->diffInMinutes($attempt->finished_at),
            ];
        });

        $avgScore = $attempts->avg('score');
        $passRate = $attempts->count() > 0
            ? ($attempts->where('is_passed', true)->count() / $attempts->count()) * 100
            : 0;

        return response()->json([
            'student_id' => $userId,
            'summary' => [
                'total_tests' => $attempts->count(),
                'average_score' => round($avgScore, 2),
                'pass_rate' => round($passRate, 2),
            ],
            'test_history' => $comparison,
        ]);
    }
}
