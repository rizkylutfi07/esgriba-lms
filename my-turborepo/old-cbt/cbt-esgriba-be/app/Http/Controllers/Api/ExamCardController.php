<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AcademicYear;
use Illuminate\Http\Request;

class ExamCardController extends Controller
{
    /**
     * Get exam cards data for students
     */
    public function getExamCards(Request $request)
    {
        $query = User::with(['class', 'major'])
            ->where('role', 'siswa')
            ->where('is_active', true);

        // Filter by class if provided
        if ($request->has('class_id') && $request->class_id !== 'all') {
            $query->where('class_id', $request->class_id);
        }

        // Filter by student IDs if provided (for specific students)
        if ($request->has('student_ids') && is_array($request->student_ids)) {
            $query->whereIn('id', $request->student_ids);
        }

        $students = $query->orderBy('name', 'asc')->get();

        // Get active academic year
        $academicYear = AcademicYear::where('is_active', true)->first();
        $yearLabel = $academicYear ? $academicYear->name : date('Y') . '/' . (date('Y') + 1);

        // Transform data for exam cards - simplified
        $cards = $students->map(function ($student) {
            return [
                'id' => $student->id,
                'name' => strtoupper($student->name),
                'class_name' => $student->class ? $student->class->class_name : '-',
                'username' => $student->nisn ?: $student->nis ?: $student->email,
                'password' => $this->getDisplayPassword($student),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $cards,
        ]);
    }

    /**
     * Get display password for student
     * Note: This shows the default password pattern, not the actual hashed password
     */
    private function getDisplayPassword($student)
    {
        // If there's a stored plain password pattern (which there shouldn't be in production)
        // we'll show a default pattern based on common conventions
        
        // Check if there's a password hint or use default
        // In real scenario, you might want to store a "password_hint" field
        // For now, we'll use a common pattern: last 6 digits of NISN or "123456"
        
        if ($student->nisn && strlen($student->nisn) >= 6) {
            return substr($student->nisn, -6);
        } elseif ($student->nis && strlen($student->nis) >= 6) {
            return substr($student->nis, -6);
        }
        
        return '123456'; // Default password
    }

    /**
     * Determine current semester based on month
     */
    private function getCurrentSemester()
    {
        $month = (int) date('n');
        
        // Semester Ganjil: Juli (7) - Desember (12)
        // Semester Genap: Januari (1) - Juni (6)
        
        if ($month >= 7 && $month <= 12) {
            return 'GANJIL';
        } else {
            return 'GENAP';
        }
    }

    /**
     * Get exam cards for specific class
     */
    public function getByClass($classId)
    {
        $request = new Request(['class_id' => $classId]);
        return $this->getExamCards($request);
    }
}
