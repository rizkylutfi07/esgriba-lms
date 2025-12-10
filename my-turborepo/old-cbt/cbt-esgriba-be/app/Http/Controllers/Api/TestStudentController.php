<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Test;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Validator;

class TestStudentController extends Controller
{
    /**
     * Eligible students based on test kelas/class filters
     */
    public function eligible(Request $request, $testId)
    {
        $test = Test::findOrFail($testId);

        if ($test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $studentQuery = User::query()
            ->select(['id', 'name', 'email', 'nisn', 'class_id', 'kelas'])
            ->where('role', 'siswa')
            ->where('is_active', true)
            ->with(['class:id,class_name'])
            ->orderBy('name');

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

        $students = $studentQuery->get()->map(function (User $u) {
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'nisn' => $u->nisn,
                'class_id' => $u->class_id,
                'class_name' => optional($u->class)->class_name ?? ($u->kelas ?? null),
            ];
        })->values();

        return response()->json([
            'test_id' => $test->id,
            'students' => $students,
        ]);
    }
    /**
     * List allowed students for a test (remedial)
     */
    public function index(Request $request, $testId)
    {
        $test = Test::with('allowedStudents:id,name,email,nisn,class_id')->findOrFail($testId);

        if ($test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'test_id' => $test->id,
            'allowed_students' => $test->allowedStudents->map(function (User $u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'nisn' => $u->nisn,
                    'class_id' => $u->class_id,
                ];
            }),
        ]);
    }

    /**
     * Replace full allowed student list
     */
    public function store(Request $request, $testId)
    {
        $test = Test::findOrFail($testId);
        if ($test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'integer|exists:users,id',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Filter only siswa role
        $studentIds = User::whereIn('id', $request->student_ids)->where('role', 'siswa')->pluck('id')->all();
        $test->allowedStudents()->sync($studentIds);

        return response()->json([
            'message' => 'Daftar siswa remidi diperbarui',
            'count' => count($studentIds),
        ]);
    }

    /**
     * Add students to allowed list (merge)
     */
    public function add(Request $request, $testId)
    {
        $test = Test::findOrFail($testId);
        if ($test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'integer|exists:users,id',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $studentIds = User::whereIn('id', $request->student_ids)->where('role', 'siswa')->pluck('id')->all();
        $existing = $test->allowedStudents()->pluck('student_id')->all();
        $merged = array_unique(array_merge($existing, $studentIds));
        $test->allowedStudents()->sync($merged);

        return response()->json([
            'message' => 'Siswa ditambahkan ke daftar remidi',
            'count' => count($merged),
        ]);
    }

    /**
     * Remove students from allowed list
     */
    public function remove(Request $request, $testId)
    {
        $test = Test::findOrFail($testId);
        if ($test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'integer|exists:users,id',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $idsToRemove = $request->student_ids;
        $test->allowedStudents()->detach($idsToRemove);

        return response()->json([
            'message' => 'Siswa dihapus dari daftar remidi',
            'remaining_count' => $test->allowedStudents()->count(),
        ]);
    }

    /**
     * Clear list (back to normal open-for-class mode)
     */
    public function clear(Request $request, $testId)
    {
        $test = Test::findOrFail($testId);
        if ($test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $test->allowedStudents()->detach();

        return response()->json([
            'message' => 'Daftar remidi dikosongkan. Ujian kembali normal untuk kelas.',
        ]);
    }

    /**
     * Export allowed remedial students as CSV
     */
    public function exportCsv(Request $request, $testId)
    {
        $test = Test::with(['allowedStudents.class'])->findOrFail($testId);

        if ($test->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $filename = 'remedial_students_test_' . $test->id . '.csv';

        $response = new StreamedResponse(function () use ($test) {
            $handle = fopen('php://output', 'w');
            // UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Header
            fputcsv($handle, ['No', 'Nama', 'NISN', 'Kelas', 'Email']);

            $no = 1;
            foreach ($test->allowedStudents as $student) {
                $className = optional($student->class)->class_name ?? ($student->kelas ?? '');
                fputcsv($handle, [
                    $no++,
                    $student->name,
                    $student->nisn,
                    $className,
                    $student->email,
                ]);
            }

            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
        $response->headers->set('Content-Disposition', 'attachment; filename="' . $filename . '"');

        return $response;
    }
}
