<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TestController;
use App\Http\Controllers\Api\TestAttemptController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\MajorController;
use App\Http\Controllers\Api\ClassController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\AcademicYearController;
use App\Http\Controllers\Api\QuestionBankController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ExamSessionController;
use App\Http\Controllers\Api\TestStudentController;
use App\Http\Controllers\Api\ExamCardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware(['auth:api'])->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);

    // Test routes - cached for 60 seconds
    Route::get('/tests', [TestController::class, 'index'])->middleware('cache.response:60');
    Route::get('/tests/{id}', [TestController::class, 'show'])->middleware('cache.response:120');

    // Test routes for Guru and Admin
    Route::middleware(['role:guru,admin'])->group(function () {
        Route::post('/tests', [TestController::class, 'store']);
        Route::put('/tests/{id}', [TestController::class, 'update']);
        Route::delete('/tests/{id}', [TestController::class, 'destroy']);
        Route::post('/tests/{id}/duplicate', [TestController::class, 'duplicate']);
        Route::post('/tests/{id}/clone-remedial', [TestController::class, 'cloneRemedial']);
        Route::post('/tests/{id}/toggle-publish', [TestController::class, 'togglePublish']);
        Route::post('/tests/{id}/questions', [TestController::class, 'addQuestions']);
        Route::post('/tests/{id}/question-packages', [TestController::class, 'addPackage']);
        Route::put('/tests/{testId}/questions/{questionId}', [TestController::class, 'updateQuestion']);
        Route::delete('/tests/{testId}/questions/{questionId}', [TestController::class, 'deleteQuestion']);
        Route::get('/tests/{id}/attempts', [TestAttemptController::class, 'testAttempts']);
        Route::get('/tests/{id}/monitor', [TestAttemptController::class, 'monitor']);
        Route::post('/attempts/{id}/block', [TestAttemptController::class, 'blockAttempt']);
        Route::post('/attempts/{id}/unblock', [TestAttemptController::class, 'unblockAttempt']);

        // Remedial assignment (allowed students)
        Route::get('/tests/{id}/students', [TestStudentController::class, 'index']);
        Route::get('/tests/{id}/students/eligible', [TestStudentController::class, 'eligible']);
        Route::get('/tests/{id}/students/export', [TestStudentController::class, 'exportCsv']);
        Route::post('/tests/{id}/students', [TestStudentController::class, 'store']); // replace all
        Route::patch('/tests/{id}/students/add', [TestStudentController::class, 'add']);
        Route::patch('/tests/{id}/students/remove', [TestStudentController::class, 'remove']);
        Route::delete('/tests/{id}/students', [TestStudentController::class, 'clear']);

        // Test results and essay grading
        Route::get('/tests/{id}/results', [TestController::class, 'getResults']);
        Route::get('/tests/{testId}/attempts/{attemptId}/essays', [TestController::class, 'getEssayAnswers']);
        Route::post('/tests/{testId}/attempts/{attemptId}/essays/{answerId}/grade', [TestController::class, 'gradeEssay']);
    });

    // Test attempt routes (for Siswa)
    Route::post('/tests/{id}/start', [TestAttemptController::class, 'start']);
    Route::post('/attempts/{id}/answer', [TestAttemptController::class, 'submitAnswer']);
    Route::post('/attempts/{id}/events', [TestAttemptController::class, 'logEvent']);
    Route::post('/attempts/{id}/finish', [TestAttemptController::class, 'finish']);
    Route::get('/attempts', [TestAttemptController::class, 'myAttempts']);
    Route::get('/attempts/{id}', [TestAttemptController::class, 'show']);

    // Question Bank routes (for Guru and Admin)
    Route::middleware(['role:guru,admin'])->group(function () {
        Route::get('/question-bank', [QuestionBankController::class, 'index']);
        Route::post('/question-bank', [QuestionBankController::class, 'store']);
        Route::get('/question-bank/{id}', [QuestionBankController::class, 'show']);
        Route::put('/question-bank/{id}', [QuestionBankController::class, 'update']);
        Route::delete('/question-bank/{id}', [QuestionBankController::class, 'destroy']);
        Route::post('/question-bank/{id}/duplicate', [QuestionBankController::class, 'duplicate']);
        Route::get('/question-bank/categories/list', [QuestionBankController::class, 'categories']);
        Route::post('/question-bank/bulk-add-to-test', [QuestionBankController::class, 'bulkAddToTest']);
        Route::post('/question-bank/bulk-delete', [QuestionBankController::class, 'bulkDelete']);
    });

    // Question Package routes (for Guru and Admin)
    Route::middleware(['role:guru,admin'])->group(function () {
        Route::get('/question-packages', [\App\Http\Controllers\Api\QuestionPackageController::class, 'index']);
        Route::post('/question-packages', [\App\Http\Controllers\Api\QuestionPackageController::class, 'store']);
        Route::get('/question-packages/{id}', [\App\Http\Controllers\Api\QuestionPackageController::class, 'show']);
        Route::put('/question-packages/{id}', [\App\Http\Controllers\Api\QuestionPackageController::class, 'update']);
        Route::delete('/question-packages/{id}', [\App\Http\Controllers\Api\QuestionPackageController::class, 'destroy']);
        Route::post('/question-packages/{id}/questions', [\App\Http\Controllers\Api\QuestionPackageController::class, 'addQuestions']);
        Route::delete('/question-packages/{id}/questions/{questionId}', [\App\Http\Controllers\Api\QuestionPackageController::class, 'removeQuestion']);
        Route::put('/question-packages/{id}/reorder', [\App\Http\Controllers\Api\QuestionPackageController::class, 'reorderQuestions']);
        Route::post('/question-packages/{id}/duplicate', [\App\Http\Controllers\Api\QuestionPackageController::class, 'duplicate']);

        // Parse DOCX file (server-side)
        Route::post('/question-packages/parse-docx', [\App\Http\Controllers\Api\QuestionPackageController::class, 'parseDocx']);
    });

    // Report & Statistics routes
    Route::get('/dashboard/admin', [ReportController::class, 'adminDashboard'])->middleware('role:admin');
    Route::get('/dashboard/teacher', [ReportController::class, 'teacherDashboard'])->middleware('role:guru,admin');
    Route::get('/dashboard/student', [ReportController::class, 'studentDashboard']);
    Route::get('/reports/test/{testId}/statistics', [ReportController::class, 'testStatistics'])->middleware('role:guru,admin');
    Route::get('/reports/attempt/{attemptId}/analysis', [ReportController::class, 'attemptAnalysis']);
    Route::get('/reports/test/{testId}/export', [ReportController::class, 'exportTestResults'])->middleware('role:guru,admin');
    Route::get('/reports/student/comparison', [ReportController::class, 'studentComparison']);

    // Exam Cards routes (Admin and Teacher)
    Route::get('/exam-cards', [ExamCardController::class, 'getExamCards'])->middleware('role:guru,admin');
    Route::get('/exam-cards/class/{classId}', [ExamCardController::class, 'getByClass'])->middleware('role:guru,admin');

    // User management routes (Admin only)
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
        Route::post('/users/{id}/toggle-active', [UserController::class, 'toggleActive']);
        Route::get('/users/{id}/subjects', [UserController::class, 'getSubjects']);

        // Import/Export Students
        Route::get('/students/template', [UserController::class, 'downloadTemplate']);
        Route::post('/students/import', [UserController::class, 'import']);
        Route::get('/students/export', [UserController::class, 'export']);

        // Import/Export Teachers
        Route::get('/teachers/template', [UserController::class, 'downloadTeacherTemplate']);
        Route::post('/teachers/import', [UserController::class, 'importTeachers']);
        Route::get('/teachers/export', [UserController::class, 'exportTeachers']);
    });

    // Master Data Management routes (Admin only)
    Route::middleware(['role:admin'])->group(function () {
        // Majors (Jurusan)
        Route::post('/majors', [MajorController::class, 'store']);
        Route::get('/majors/{id}', [MajorController::class, 'show']);
        Route::put('/majors/{id}', [MajorController::class, 'update']);
        Route::delete('/majors/{id}', [MajorController::class, 'destroy']);

        // Classes (Kelas) - CRUD only for admin
        Route::post('/classes', [ClassController::class, 'store']);
        Route::put('/classes/{id}', [ClassController::class, 'update']);
        Route::delete('/classes/{id}', [ClassController::class, 'destroy']);

        // Subjects (Mata Pelajaran) - CRUD only for admin
        Route::post('/subjects', [SubjectController::class, 'store']);
        Route::put('/subjects/{id}', [SubjectController::class, 'update']);
        Route::delete('/subjects/{id}', [SubjectController::class, 'destroy']);
        Route::post('/subjects/{id}/assign-teachers', [SubjectController::class, 'assignToTeacher']);
        Route::get('/subjects/{id}/teachers', [SubjectController::class, 'getTeachers']);

        // Import/Export Subjects
        Route::get('/subjects/template', [SubjectController::class, 'downloadTemplate']);
        Route::post('/subjects/import', [SubjectController::class, 'import']);
        Route::get('/subjects/export', [SubjectController::class, 'export']);

        // Rooms (Ruangan)
        Route::post('/rooms', [RoomController::class, 'store']);
        Route::get('/rooms/{id}', [RoomController::class, 'show']);
        Route::put('/rooms/{id}', [RoomController::class, 'update']);
        Route::delete('/rooms/{id}', [RoomController::class, 'destroy']);

        // Academic Years (Tahun Pelajaran)
        Route::post('/academic-years', [AcademicYearController::class, 'store']);
        Route::get('/academic-years/{id}', [AcademicYearController::class, 'show']);
        Route::put('/academic-years/{id}', [AcademicYearController::class, 'update']);
        Route::delete('/academic-years/{id}', [AcademicYearController::class, 'destroy']);
        Route::post('/academic-years/{id}/set-active', [AcademicYearController::class, 'setActive']);

        // Exam Sessions management
        Route::get('/sessions/all', [ExamSessionController::class, 'index']); // admin view all active (same as public filtered route but namespaced)
        Route::post('/sessions', [ExamSessionController::class, 'store']);
        Route::put('/sessions/{id}', [ExamSessionController::class, 'update']);
        Route::delete('/sessions/{id}', [ExamSessionController::class, 'destroy']);
    });

    // Read-only access to master data for all authenticated users - cached for 5 minutes
    Route::get('/majors', [MajorController::class, 'index'])->middleware('cache.response:300');
    Route::get('/classes', [ClassController::class, 'index'])->middleware('cache.response:300');
    Route::get('/classes/{id}', [ClassController::class, 'show'])->middleware('cache.response:300');

    // Subjects - specific routes before dynamic routes - cached for 5 minutes
    Route::get('/my-subjects', [SubjectController::class, 'mySubjects'])->middleware(['role:guru', 'cache.response:300']);
    Route::get('/subjects', [SubjectController::class, 'index'])->middleware('cache.response:300');
    Route::get('/subjects/{id}', [SubjectController::class, 'show'])->middleware('cache.response:300');

    Route::get('/rooms', [RoomController::class, 'index'])->middleware('cache.response:300');
    Route::get('/academic-years', [AcademicYearController::class, 'index'])->middleware('cache.response:300');
    // Public (authenticated) list of active sessions for selection - cached for 2 minutes
    Route::get('/sessions', [ExamSessionController::class, 'index'])->middleware('cache.response:120');
});
