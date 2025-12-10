<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuestionBank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class QuestionBankController extends Controller
{
    /**
     * Get all questions from bank with filters
     */
    public function index(Request $request)
    {
        $query = QuestionBank::with(['creator', 'subject']);

        // Visibility untuk guru: soal milik sendiri ATAU soal untuk mapel yang diajarkan (mis. dibuat admin)
        if ($request->user()->isGuru() && !$request->user()->isAdmin()) {
            $subjectIds = $request->user()->subjects()->pluck('subjects.id');
            $query->where(function ($q) use ($request, $subjectIds) {
                $q->where('created_by', $request->user()->id);
                if ($subjectIds->count() > 0) {
                    $q->orWhereIn('subject_id', $subjectIds);
                }
            });
        }

        // Filter by subject
        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', 'like', '%' . $request->category . '%');
        }

        // Filter by difficulty
        if ($request->has('difficulty_level')) {
            $query->where('difficulty_level', $request->difficulty_level);
        }

        // Filter by question type
        if ($request->has('question_type')) {
            $query->where('question_type', $request->question_type);
        }

        // Filter by creator (teacher)
        if ($request->has('creator_id')) {
            $query->where('created_by', $request->creator_id);
        }

        // Search
        if ($request->has('search')) {
            $query->where('question_text', 'like', '%' . $request->search . '%');
        }

        $questions = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json($questions);
    }

    /**
     * Store a new question in bank
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'subject_id' => 'nullable|exists:subjects,id',
            'category' => 'nullable|string|max:255',
            'question_text' => 'required|string',
            'question_type' => 'required|in:multiple_choice,essay',
            'difficulty_level' => 'required|integer|min:1|max:3',
            'points' => 'required|integer|min:1',
            'explanation' => 'nullable|string',
            'expected_answer' => 'nullable|string',
            'teacher_id' => 'nullable|exists:users,id',
            'options' => 'required_if:question_type,multiple_choice|array',
            'options.*.text' => 'required_with:options|string',
            'options.*.is_correct' => 'required_with:options|boolean',
            'correct_answer' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Validasi: harus ada minimal 1 jawaban benar untuk multiple choice
        if ($request->question_type === 'multiple_choice') {
            $hasCorrect = collect($request->options)->where('is_correct', true)->count();
            if ($hasCorrect === 0) {
                return response()->json([
                    'errors' => ['options' => ['At least one option must be marked as correct']]
                ], 422);
            }
        }

        // Determine creator: if admin provides teacher_id, use it; otherwise use current user
        $createdBy = $request->user()->id;
        if ($request->user()->isAdmin() && $request->has('teacher_id') && $request->teacher_id) {
            $createdBy = $request->teacher_id;
        }

        $questionBank = QuestionBank::create([
            'created_by' => $createdBy,
            'subject_id' => $request->subject_id,
            'category' => $request->category,
            'question_text' => $request->question_text,
            'question_type' => $request->question_type,
            'expected_answer' => $request->expected_answer,
            'difficulty_level' => $request->difficulty_level,
            'points' => $request->points,
            'explanation' => $request->explanation,
            'options' => $request->options,
            'correct_answer' => $request->correct_answer,
        ]);

        return response()->json([
            'message' => 'Question added to bank successfully',
            'question' => $questionBank->load('subject', 'creator'),
        ], 201);
    }

    /**
     * Show a specific question
     */
    public function show($id)
    {
        $question = QuestionBank::with(['creator', 'subject'])->findOrFail($id);

        return response()->json($question);
    }

    /**
     * Update a question in bank
     */
    public function update(Request $request, $id)
    {
        $question = QuestionBank::findOrFail($id);

        // Check if user is the creator or admin
        if ($question->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'subject_id' => 'nullable|exists:subjects,id',
            'category' => 'nullable|string|max:255',
            'question_text' => 'sometimes|required|string',
            'question_type' => 'sometimes|required|in:multiple_choice,essay,true_false',
            'difficulty_level' => 'sometimes|required|integer|min:1|max:3',
            'points' => 'sometimes|required|integer|min:1',
            'explanation' => 'nullable|string',
            'teacher_id' => 'nullable|exists:users,id',
            'options' => 'nullable|array',
            'correct_answer' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Prepare update data
        $updateData = $request->except(['teacher_id']);
        
        // Update created_by if admin provides teacher_id
        if ($request->user()->isAdmin() && $request->has('teacher_id')) {
            $updateData['created_by'] = $request->teacher_id ?: $request->user()->id;
        }

        $question->update($updateData);

        // Update statistics for all packages that use this question
        $packages = \App\Models\QuestionPackage::whereHas('questions', function ($query) use ($id) {
            $query->where('question_banks.id', $id);
        })->get();

        foreach ($packages as $package) {
            $package->updateStatistics();
        }

        return response()->json([
            'message' => 'Question updated successfully',
            'question' => $question->load('subject', 'creator'),
        ]);
    }

    /**
     * Delete a question from bank
     */
    public function destroy(Request $request, $id)
    {
        $question = QuestionBank::findOrFail($id);

        // Check if user is the creator or admin
        if ($question->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $question->delete();

        return response()->json(['message' => 'Question deleted successfully']);
    }

    /**
     * Bulk delete questions from bank
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'question_ids' => 'required|array',
            'question_ids.*' => 'required|exists:question_banks,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $questionIds = $request->question_ids;
        $deletedCount = 0;
        $forbiddenCount = 0;

        foreach ($questionIds as $id) {
            $question = QuestionBank::find($id);
            
            if (!$question) {
                continue;
            }

            // Check if user is the creator or admin
            if ($question->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
                $forbiddenCount++;
                continue;
            }

            $question->delete();
            $deletedCount++;
        }

        return response()->json([
            'message' => "Successfully deleted {$deletedCount} question(s)",
            'deleted_count' => $deletedCount,
            'forbidden_count' => $forbiddenCount,
        ]);
    }

    /**
     * Duplicate a question
     */
    public function duplicate(Request $request, $id)
    {
        $question = QuestionBank::findOrFail($id);

        $newQuestion = $question->replicate();
        $newQuestion->created_by = $request->user()->id;
        $newQuestion->usage_count = 0;
        $newQuestion->save();

        return response()->json([
            'message' => 'Question duplicated successfully',
            'question' => $newQuestion->load('subject', 'creator'),
        ], 201);
    }

    /**
     * Get categories list
     */
    public function categories(Request $request)
    {
        $query = QuestionBank::select('category')
            ->whereNotNull('category')
            ->distinct();

        // Filter untuk guru
        if ($request->user()->isGuru() && !$request->user()->isAdmin()) {
            $subjectIds = $request->user()->subjects()->pluck('subjects.id');
            $query->where(function ($q) use ($request, $subjectIds) {
                $q->where('created_by', $request->user()->id);
                if ($subjectIds->count() > 0) {
                    $q->orWhereIn('subject_id', $subjectIds);
                }
            });
        }

        $categories = $query->pluck('category');

        return response()->json($categories);
    }

    /**
     * Bulk import questions to test
     */
    public function bulkAddToTest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'test_id' => 'required|exists:tests,id',
            'question_ids' => 'required|array',
            'question_ids.*' => 'exists:question_banks,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $test = \App\Models\Test::findOrFail($request->test_id);

        // Check if user is the creator
        if ($test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $questions = QuestionBank::whereIn('id', $request->question_ids)->get();
        $order = \App\Models\Question::where('test_id', $test->id)->max('order') ?? 0;

        foreach ($questions as $bankQuestion) {
            $order++;

            $expectedAnswer = null;
            if ($bankQuestion->question_type === 'essay') {
                $expectedAnswer = $bankQuestion->expected_answer;

                if (empty($expectedAnswer) && !empty($bankQuestion->correct_answer)) {
                    $correctAnswer = $bankQuestion->correct_answer;
                    if (is_array($correctAnswer)) {
                        $expectedAnswer = implode(', ', array_filter($correctAnswer, fn ($item) => $item !== null && $item !== ''));
                    } elseif (is_string($correctAnswer)) {
                        $expectedAnswer = $correctAnswer;
                    }
                }
            }

            // Create question in test
            $question = \App\Models\Question::create([
                'test_id' => $test->id,
                'question_text' => $bankQuestion->question_text,
                'question_type' => $bankQuestion->question_type,
                'expected_answer' => $expectedAnswer,
                'points' => $bankQuestion->points,
                'order' => $order,
            ]);

            // Create options if multiple choice
            if ($bankQuestion->question_type === 'multiple_choice' && $bankQuestion->options) {
                foreach ($bankQuestion->options as $index => $option) {
                    \App\Models\QuestionOption::create([
                        'question_id' => $question->id,
                        'option_text' => $option['text'],
                        'is_correct' => $option['is_correct'],
                        'order' => $index + 1,
                    ]);
                }
            }

            // Increment usage count
            $bankQuestion->incrementUsage();
        }

        // Update total questions
        $test->update(['total_questions' => $test->questions()->count()]);

        return response()->json([
            'message' => 'Questions added to test successfully',
            'test' => $test->load('questions.options'),
        ]);
    }
}
