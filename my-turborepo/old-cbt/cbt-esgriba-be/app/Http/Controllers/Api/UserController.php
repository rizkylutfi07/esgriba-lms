<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Imports\StudentsImport;
use App\Exports\StudentsTemplateExport;
use App\Exports\StudentsExport;
use App\Imports\TeachersImport;
use App\Exports\TeachersTemplateExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

class UserController extends Controller
{
    /**
     * Get all users
     */
    public function index(Request $request)
    {
        $query = User::with(['subjects', 'class', 'major']);

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Filter by kelas (for siswa)
        if ($request->has('kelas')) {
            $query->where('kelas', $request->kelas);
        }

        $users = $query->latest()->get();

        return response()->json([
            'data' => $users
        ]);
    }

    /**
     * Store a new user
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,guru,siswa',
            'gender' => 'nullable|in:L,P',
            'birth_date' => 'nullable|date',
            'birth_place' => 'nullable|string',
            'religion' => 'nullable|string',
            'nip' => 'nullable|string',
            'nisn' => 'nullable|string',
            'nis' => 'nullable|string',
            'kelas' => 'nullable|string',
            'jurusan' => 'nullable|string',
            'class_id' => 'nullable|exists:classes,id',
            'major_id' => 'nullable|exists:majors,id',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userData = [
            'name' => $request->name,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'gender' => $request->gender,
            'birth_date' => $request->birth_date,
            'birth_place' => $request->birth_place,
            'religion' => $request->religion,
            'nip' => $request->nip,
            'nisn' => $request->nisn,
            'nis' => $request->nis,
            'kelas' => $request->kelas,
            'jurusan' => $request->jurusan,
            'class_id' => $request->class_id,
            'major_id' => $request->major_id,
            'phone' => $request->phone,
            'address' => $request->address,
            'is_active' => true,
        ];

        // Add email only if provided
        if ($request->filled('email')) {
            $userData['email'] = $request->email;
        }

        $user = User::create($userData);

        // Attach subjects if provided (for guru)
        if ($request->has('subject_ids') && $request->role === 'guru') {
            $user->subjects()->sync($request->subject_ids);
        }

        $user->load(['subjects', 'class', 'major']);

        return response()->json([
            'message' => 'User created successfully',
            'data' => $user,
        ], 201);
    }

    /**
     * Show a specific user
     */
    public function show($id)
    {
        $user = User::with(['subjects', 'class', 'major'])->findOrFail($id);

        return response()->json([
            'data' => $user
        ]);
    }

    /**
     * Update a user
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|nullable|string|email|max:255|unique:users,email,' . $id,
            'password' => 'sometimes|nullable|string|min:6',
            'role' => 'sometimes|required|in:admin,guru,siswa',
            'gender' => 'sometimes|nullable|in:L,P',
            'birth_date' => 'sometimes|nullable|date',
            'birth_place' => 'sometimes|nullable|string',
            'religion' => 'sometimes|nullable|string',
            'nip' => 'sometimes|nullable|string',
            'nisn' => 'sometimes|nullable|string',
            'nis' => 'sometimes|nullable|string',
            'class_id' => 'sometimes|nullable|exists:classes,id',
            'major_id' => 'sometimes|nullable|exists:majors,id',
            'phone' => 'sometimes|nullable|string',
            'address' => 'sometimes|nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $updateData = $request->except(['password']);
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        // Sync subjects if provided (for guru)
        if ($request->has('subject_ids') && $user->role === 'guru') {
            $user->subjects()->sync($request->subject_ids);
        }

        $user->load(['subjects', 'class', 'major']);

        return response()->json([
            'message' => 'User updated successfully',
            'data' => $user,
        ]);
    }

    /**
     * Delete a user
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Toggle user active status
     */
    public function toggleActive($id)
    {
        $user = User::findOrFail($id);
        $user->is_active = !$user->is_active;
        $user->save();

        return response()->json([
            'message' => $user->is_active ? 'User activated successfully' : 'User deactivated successfully',
            'data' => $user->load(['subjects', 'class', 'major']),
        ]);
    }

    /**
     * Get user subjects (for guru)
     */
    public function getSubjects($id)
    {
        $user = User::with('subjects')->findOrFail($id);

        return response()->json([
            'data' => $user->subjects
        ]);
    }

    /**
     * Download template Excel untuk import siswa
     */
    public function downloadTemplate()
    {
        return Excel::download(
            new StudentsTemplateExport(),
            'template_import_siswa.xlsx'
        );
    }

    /**
     * Import data siswa dari file Excel
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

            // Create import instance
            $import = new StudentsImport();

            // Import the file
            Excel::import($import, $file);

            // Get statistics
            $stats = $import->getStats();

            // Check if there are any errors
            if ($stats['failed'] > 0) {
                return response()->json([
                    'message' => 'Import completed with some errors',
                    'stats' => [
                        'total' => $stats['imported'] + $stats['failed'],
                        'success' => $stats['imported'],
                        'failed' => $stats['failed']
                    ],
                    'errors' => $stats['errors']
                ], 207); // 207 Multi-Status
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
     * Export data siswa ke Excel
     */
    public function export(Request $request)
    {
        try {
            return Excel::download(
                new StudentsExport(),
                'data_siswa_' . date('Y-m-d') . '.xlsx'
            );
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to export data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download template Excel untuk import guru
     */
    public function downloadTeacherTemplate()
    {
        return Excel::download(
            new TeachersTemplateExport(),
            'template_import_guru.xlsx'
        );
    }

    /**
     * Import data guru dari file Excel
     */
    public function importTeachers(Request $request)
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

            $import = new TeachersImport();
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
     * Export data guru ke Excel
     */
    public function exportTeachers(Request $request)
    {
        try {
            $query = User::where('role', 'guru');

            $teachers = $query->get();

            $data = $teachers->map(function ($teacher) {
                return [
                    'nama' => $teacher->name,
                    'email' => $teacher->email,
                    'nip' => $teacher->nip,
                    'jenis_kelamin' => $teacher->gender,
                    'tanggal_lahir' => $teacher->birth_date,
                    'phone' => $teacher->phone,
                    'address' => $teacher->address,
                    'status' => $teacher->is_active ? 'aktif' : 'nonaktif',
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
                        return ['nama', 'email', 'nip', 'jenis_kelamin', 'tanggal_lahir', 'phone', 'address', 'status'];
                    }
                },
                'data_guru_' . date('Y-m-d') . '.xlsx'
            );
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to export data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
