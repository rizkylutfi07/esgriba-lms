<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Imports\SubjectsImport;
use App\Exports\SubjectsTemplateExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // If user is guru, only return their subjects
        if ($user && $user->role === 'guru') {
            $subjects = $user->subjects()
                ->with('major')
                ->withCount('tests')
                ->orderBy('name')
                ->get();
        } else {
            // Admin or other roles get all subjects
            $subjects = Subject::with('major')
                ->withCount('tests')
                ->orderBy('name')
                ->get();
        }

        return response()->json([
            'data' => $subjects
        ]);
    }

    /**
     * Get subjects for the authenticated teacher (guru)
     */
    public function mySubjects(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'guru') {
            return response()->json([
                'message' => 'Hanya guru yang dapat mengakses endpoint ini'
            ], 403);
        }

        $subjects = $user->subjects()
            ->with('major')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $subjects
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:20|unique:subjects',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'major_id' => 'nullable|exists:majors,id',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $subject = Subject::create($request->all());
        $subject->load('major');

        return response()->json([
            'message' => 'Mata pelajaran berhasil ditambahkan',
            'data' => $subject
        ], 201);
    }

    public function show($id)
    {
        $subject = Subject::with(['major', 'tests'])
            ->findOrFail($id);

        return response()->json([
            'data' => $subject
        ]);
    }

    public function update(Request $request, $id)
    {
        $subject = Subject::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:20|unique:subjects,code,' . $id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'major_id' => 'nullable|exists:majors,id',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $subject->update($request->all());
        $subject->load('major');

        return response()->json([
            'message' => 'Mata pelajaran berhasil diupdate',
            'data' => $subject
        ]);
    }

    public function destroy($id)
    {
        $subject = Subject::findOrFail($id);
        $subject->delete();

        return response()->json([
            'message' => 'Mata pelajaran berhasil dihapus'
        ]);
    }

    /**
     * Assign subjects to a teacher (Admin only)
     */
    public function assignToTeacher(Request $request, $subjectId)
    {
        $validator = Validator::make($request->all(), [
            'teacher_ids' => 'required|array',
            'teacher_ids.*' => 'exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $subject = Subject::with('major')->findOrFail($subjectId);

        // Validate that all users are teachers
        $users = \App\Models\User::whereIn('id', $request->teacher_ids)->get();
        $nonTeachers = $users->where('role', '!=', 'guru');

        if ($nonTeachers->count() > 0) {
            return response()->json([
                'message' => 'Semua user harus memiliki role guru'
            ], 422);
        }

        // Sync teachers (replace existing assignments)
        $subject->teachers()->sync($request->teacher_ids);

        return response()->json([
            'message' => 'Guru berhasil di-assign ke mata pelajaran',
            'subject' => $subject->load('teachers')
        ]);
    }

    /**
     * Get teachers assigned to a subject
     */
    public function getTeachers($subjectId)
    {
        $subject = Subject::with('teachers')->findOrFail($subjectId);

        return response()->json([
            'data' => $subject->teachers
        ]);
    }

    /**
     * Download template Excel untuk import mata pelajaran
     */
    public function downloadTemplate()
    {
        return Excel::download(
            new SubjectsTemplateExport(),
            'template_import_mapel.xlsx'
        );
    }

    /**
     * Import data mata pelajaran dari file Excel
     */
    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|mimes:xlsx,xls|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');

            $import = new SubjectsImport();
            Excel::import($import, $file);

            $stats = $import->getStats();

            if ($stats['failed'] > 0) {
                return response()->json([
                    'message' => 'Import completed with some errors',
                    'stats' => [
                        'total' => $stats['imported'] + $stats['failed'],
                        'success' => $stats['imported'],
                        'failed' => $stats['failed']
                    ],
                    'errors' => $stats['errors']
                ], 207);
            }

            return response()->json([
                'message' => 'Import completed successfully',
                'stats' => [
                    'total' => $stats['imported'],
                    'success' => $stats['imported'],
                    'failed' => $stats['failed']
                ]
            ], 200);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();
            $errors = [];

            foreach ($failures as $failure) {
                $errors[] = [
                    'row' => $failure->row(),
                    'attribute' => $failure->attribute(),
                    'errors' => $failure->errors(),
                    'values' => $failure->values()
                ];
            }

            return response()->json([
                'message' => 'Validation errors in Excel file',
                'errors' => $errors
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to import file',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export data mata pelajaran ke Excel
     */
    public function export(Request $request)
    {
        try {
            $query = Subject::with('major');

            $subjects = $query->get();

            $data = $subjects->map(function ($subject) {
                return [
                    'nama' => $subject->name,
                    'kode' => $subject->code,
                    'deskripsi' => $subject->description,
                    'jurusan' => $subject->major ? $subject->major->name : '',
                    'status' => $subject->is_active ? 'aktif' : 'nonaktif',
                ];
            });

            return Excel::download(
                new class($data) implements \Maatwebsite\Excel\Concerns\FromCollection, \Maatwebsite\Excel\Concerns\WithHeadings {
                    private $data;

                    public function __construct($data)
                    {
                        $this->data = $data;
                    }

                    public function collection()
                    {
                        return $this->data;
                    }

                    public function headings(): array
                    {
                        return ['nama', 'kode', 'deskripsi', 'jurusan', 'status'];
                    }
                },
                'data_mapel_' . date('Y-m-d') . '.xlsx'
            );
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to export data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
