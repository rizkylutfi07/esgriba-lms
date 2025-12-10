# CBT E-Sgriba API Documentation

API untuk sistem Computer Based Test (CBT) yang user-friendly khususnya untuk guru mata pelajaran.

## Base URL

```
http://localhost:8000/api
```

## Authentication

Semua endpoint (kecuali login/register) memerlukan token JWT di header:

```
Authorization: Bearer {your-jwt-token}
```

---

## 1. AUTHENTICATION

### 1.1 Login

```http
POST /login
```

**Body:**

```json
{
  "email": "guru@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "name": "Budi Santoso",
    "email": "guru@example.com",
    "role": "guru"
  }
}
```

### 1.2 Logout

```http
POST /logout
```

### 1.3 Get Profile

```http
GET /me
```

---

## 2. TEST MANAGEMENT (Untuk Guru)

### 2.1 Daftar Semua Test

```http
GET /tests?subject=Matematika&kelas=X&status=active&search=ujian&per_page=15
```

**Query Parameters:**

- `subject` - Filter by subject
- `kelas` - Filter by class
- `status` - Filter by status: `active`, `upcoming`, `finished`, `draft`
- `search` - Search by title or description
- `sort_by` - Sort by field (default: `created_at`)
- `sort_order` - `asc` or `desc` (default: `desc`)
- `per_page` - Items per page (default: 10)

### 2.2 Buat Test Baru

```http
POST /tests
```

**Body:**

```json
{
  "title": "Ujian Tengah Semester Matematika",
  "description": "Materi: Trigonometri dan Logaritma",
  "subject": "Matematika",
  "kelas": "X MIPA 1",
  "duration": 90,
  "passing_score": 70,
  "start_time": "2025-11-01 08:00:00",
  "end_time": "2025-11-01 10:00:00"
}
```

**Response:**

```json
{
  "message": "Test created successfully",
  "test": {
    "id": 1,
    "title": "Ujian Tengah Semester Matematika",
    "is_active": false,
    "created_by": 2,
    ...
  }
}
```

### 2.3 Update Test

```http
PUT /tests/{id}
```

### 2.4 Delete Test

```http
DELETE /tests/{id}
```

### 2.5 Duplicate Test

```http
POST /tests/{id}/duplicate
```

**Response:**

```json
{
  "message": "Test duplicated successfully",
  "test": {
    "id": 5,
    "title": "Ujian Tengah Semester Matematika (Copy)",
    "is_active": false,
    ...
  }
}
```

### 2.6 Publish/Unpublish Test

```http
POST /tests/{id}/toggle-publish
```

**Response:**

```json
{
  "message": "Test published successfully",
  "test": {
    "id": 1,
    "is_active": true,
    ...
  }
}
```

### 2.7 Tambah Soal ke Test

```http
POST /tests/{id}/questions
```

**Body:**

```json
{
  "questions": [
    {
      "question_text": "Berapakah hasil dari 2 + 2?",
      "question_type": "multiple_choice",
      "points": 10,
      "options": [
        {
          "option_text": "3",
          "is_correct": false
        },
        {
          "option_text": "4",
          "is_correct": true
        },
        {
          "option_text": "5",
          "is_correct": false
        }
      ]
    },
    {
      "question_text": "Jelaskan konsep trigonometri",
      "question_type": "essay",
      "points": 20,
      "options": []
    }
  ]
}
```

### 2.8 Update Soal

```http
PUT /tests/{testId}/questions/{questionId}
```

### 2.9 Delete Soal

```http
DELETE /tests/{testId}/questions/{questionId}
```

### 2.10 Lihat Attempts Test

```http
GET /tests/{id}/attempts
```

---

## 3. BANK SOAL (Untuk Guru)

### 3.1 Daftar Bank Soal

```http
GET /question-bank?subject_id=1&category=Trigonometri&difficulty_level=2&search=sin&per_page=15
```

**Query Parameters:**

- `subject_id` - Filter by subject ID
- `category` - Filter by category/topik
- `difficulty_level` - 1 (mudah), 2 (sedang), 3 (sulit)
- `question_type` - `multiple_choice`, `essay`, `true_false`
- `search` - Search in question text
- `per_page` - Items per page (default: 15)

### 3.2 Tambah Soal ke Bank

```http
POST /question-bank
```

**Body:**

```json
{
  "subject_id": 1,
  "category": "Trigonometri",
  "question_text": "Berapakah nilai sin 30°?",
  "question_type": "multiple_choice",
  "difficulty_level": 1,
  "points": 10,
  "explanation": "Sin 30° = 1/2 berdasarkan tabel trigonometri",
  "options": [
    {
      "text": "1/2",
      "is_correct": true
    },
    {
      "text": "1/3",
      "is_correct": false
    },
    {
      "text": "√3/2",
      "is_correct": false
    }
  ]
}
```

### 3.3 Update Soal di Bank

```http
PUT /question-bank/{id}
```

### 3.4 Delete Soal dari Bank

```http
DELETE /question-bank/{id}
```

### 3.5 Duplicate Soal

```http
POST /question-bank/{id}/duplicate
```

### 3.6 Daftar Kategori

```http
GET /question-bank/categories/list
```

**Response:**

```json
["Trigonometri", "Logaritma", "Aljabar", "Geometri"]
```

### 3.7 Bulk Add Soal ke Test

```http
POST /question-bank/bulk-add-to-test
```

**Body:**

```json
{
  "test_id": 1,
  "question_ids": [5, 10, 15, 20, 25]
}
```

**Response:**

```json
{
  "message": "Questions added to test successfully",
  "test": {
    "id": 1,
    "total_questions": 25,
    ...
  }
}
```

---

## 4. STATISTIK & LAPORAN

### 4.1 Dashboard Guru

```http
GET /dashboard/teacher
```

**Response:**

```json
{
  "summary": {
    "total_tests": 15,
    "active_tests": 3,
    "total_attempts": 450,
    "completed_attempts": 420,
    "average_score": 78.5,
    "pass_rate": 85.2
  },
  "recent_tests": [...]
}
```

### 4.2 Dashboard Siswa

```http
GET /dashboard/student
```

**Response:**

```json
{
  "summary": {
    "total_attempts": 12,
    "completed_attempts": 10,
    "available_tests": 5,
    "average_score": 82.3,
    "passed_tests": 9,
    "pass_rate": 90.0
  },
  "recent_attempts": [...]
}
```

### 4.3 Statistik Detail Test

```http
GET /reports/test/{testId}/statistics
```

**Response:**

```json
{
  "test": {...},
  "statistics": {
    "total_attempts": 30,
    "completed_attempts": 28,
    "in_progress_attempts": 2,
    "average_score": 76.5,
    "highest_score": 95.0,
    "lowest_score": 45.0,
    "passed_count": 22,
    "failed_count": 6,
    "pass_rate": 78.57
  },
  "score_distribution": [
    {"score_range": "90-100", "count": 5},
    {"score_range": "80-89", "count": 8},
    {"score_range": "70-79", "count": 9},
    {"score_range": "60-69", "count": 4},
    {"score_range": "0-59", "count": 2}
  ],
  "question_analysis": [
    {
      "question_id": 1,
      "question_text": "Berapakah hasil dari...",
      "total_answers": 28,
      "correct_answers": 25,
      "correct_percentage": 89.29
    }
  ],
  "top_performers": [...]
}
```

### 4.4 Analisis Jawaban Siswa

```http
GET /reports/attempt/{attemptId}/analysis
```

**Response:**

```json
{
  "attempt": {
    "id": 1,
    "student": {...},
    "test": {...},
    "score": 85.5,
    "is_passed": true,
    "duration_minutes": 75
  },
  "analysis": [
    {
      "question": {
        "id": 1,
        "text": "Berapakah hasil dari 2 + 2?",
        "type": "multiple_choice",
        "points": 10
      },
      "user_answer": {
        "option_id": 2,
        "is_correct": true,
        "points_earned": 10
      },
      "correct_answer": [...],
      "all_options": [...]
    }
  ]
}
```

### 4.5 Export Hasil Test

```http
GET /reports/test/{testId}/export
```

**Response:**

```json
{
  "test_info": {
    "title": "Ujian Matematika",
    "total_questions": 20,
    ...
  },
  "results": [
    {
      "student_name": "Ahmad",
      "student_email": "ahmad@example.com",
      "score": 85.5,
      "is_passed": true,
      "duration_minutes": 75,
      "total_answers": 20,
      "correct_answers": 17
    }
  ]
}
```

### 4.6 Perbandingan Performa Siswa

```http
GET /reports/student/comparison?student_id=10
```

---

## 5. SISWA - MENGERJAKAN TEST

### 5.1 Mulai Test

```http
POST /tests/{id}/start
```

**Response:**

```json
{
  "message": "Test attempt started",
  "attempt": {
    "id": 50,
    "test_id": 1,
    "user_id": 10,
    "started_at": "2025-10-29 08:00:00",
    "status": "in_progress",
    "test": {
      "id": 1,
      "title": "Ujian Matematika",
      "duration": 90,
      "questions": [...]
    }
  }
}
```

### 5.2 Submit Jawaban

```http
POST /attempts/{id}/answer
```

**Body (Multiple Choice):**

```json
{
  "question_id": 5,
  "option_id": 15
}
```

**Body (Essay):**

```json
{
  "question_id": 6,
  "answer_text": "Trigonometri adalah cabang matematika yang..."
}
```

### 5.3 Finish Test

```http
POST /attempts/{id}/finish
```

**Response:**

```json
{
  "message": "Test completed successfully",
  "attempt": {
    "id": 50,
    "score": 85.5,
    "is_passed": true,
    "finished_at": "2025-10-29 09:15:00",
    ...
  }
}
```

### 5.4 Daftar Attempt Saya

```http
GET /attempts
```

### 5.5 Detail Attempt

```http
GET /attempts/{id}
```

---

## 6. MASTER DATA (Admin)

### 6.1 Subjects (Mata Pelajaran)

```http
GET /subjects
POST /subjects
PUT /subjects/{id}
DELETE /subjects/{id}
```

### 6.2 Classes (Kelas)

```http
GET /classes
POST /classes
PUT /classes/{id}
DELETE /classes/{id}
```

### 6.3 Majors (Jurusan)

```http
GET /majors
POST /majors
PUT /majors/{id}
DELETE /majors/{id}
```

### 6.4 Rooms (Ruangan)

```http
GET /rooms
POST /rooms
PUT /rooms/{id}
DELETE /rooms/{id}
```

### 6.5 Academic Years (Tahun Pelajaran)

```http
GET /academic-years
POST /academic-years
PUT /academic-years/{id}
DELETE /academic-years/{id}
POST /academic-years/{id}/set-active
```

---

## 7. USER MANAGEMENT (Admin)

### 7.1 List Users

```http
GET /users?role=siswa
```

### 7.2 Create User

```http
POST /users
```

### 7.3 Get User

```http
GET /users/{id}
```

### 7.4 Update User

```http
PUT /users/{id}
```

### 7.5 Delete User

```http
DELETE /users/{id}
```

### 7.6 Import Students from Excel

```http
POST /students/import
```

**Headers:**

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body:**

```
file: [Excel file .xlsx or .xls]
```

**Response (Success):**

```json
{
  "message": "Import completed successfully",
  "stats": {
    "total": 50,
    "success": 50,
    "failed": 0
  }
}
```

**Response (With Errors - 207):**

```json
{
  "message": "Import completed with some errors",
  "stats": {
    "total": 50,
    "success": 45,
    "failed": 5
  },
  "errors": [
    {
      "row": {
        "nama": "Ahmad Test",
        "email": "ahmad@example.com"
      },
      "error": "Email sudah terdaftar"
    }
  ]
}
```

**Format Excel:**

- **nama** (required): Nama lengkap siswa
- **email** (required): Email valid & unique
- **nis** (optional): Nomor Induk Siswa (unique)
- **password** (optional): Password (default: password123)
- **kelas** (optional): Nama kelas (auto-create if new)
- **jurusan** (optional): Nama jurusan (auto-create if new)
- **status** (optional): aktif/nonaktif atau 1/0 (default: aktif)

### 7.7 Download Import Template

```http
GET /students/template
```

**Response:** Excel file (template_import_siswa.xlsx)

Template includes:

- Header row dengan nama kolom
- 2 sample data rows
- Pre-formatted columns
- Ready to use

### 7.8 Export Students to Excel

```http
GET /students/export?class_id=1&major_id=2
```

**Query Parameters:**

- `class_id` (optional) - Filter by kelas
- `major_id` (optional) - Filter by jurusan

**Response:** Excel file (data_siswa_YYYY-MM-DD.xlsx)

**Example cURL:**

```bash
# Download template
curl -X GET "http://localhost:8000/api/students/template" \
  -H "Authorization: Bearer {token}" \
  --output template.xlsx

# Import data
curl -X POST "http://localhost:8000/api/students/import" \
  -H "Authorization: Bearer {token}" \
  -F "file=@data_siswa.xlsx"

# Export data
curl -X GET "http://localhost:8000/api/students/export" \
  -H "Authorization: Bearer {token}" \
  --output export.xlsx
```

**📖 Dokumentasi Lengkap:** Lihat `IMPORT_SISWA_FEATURE.md`

---

## Error Responses

### 401 Unauthorized

```json
{
  "message": "Unauthenticated"
}
```

### 403 Forbidden

```json
{
  "message": "Forbidden"
}
```

### 422 Validation Error

```json
{
  "errors": {
    "title": ["The title field is required."],
    "duration": ["The duration must be at least 1."]
  }
}
```

### 404 Not Found

```json
{
  "message": "Resource not found"
}
```

---

## Tips untuk Frontend Developer

### 1. Alur Guru Membuat Test:

1. Buat test draft: `POST /tests` dengan `is_active: false`
2. Tambah soal dari bank: `POST /question-bank/bulk-add-to-test`
3. Atau buat soal manual: `POST /tests/{id}/questions`
4. Preview: `GET /tests/{id}`
5. Publish: `POST /tests/{id}/toggle-publish`

### 2. Alur Siswa Mengerjakan Test:

1. Lihat test tersedia: `GET /tests?status=active`
2. Mulai test: `POST /tests/{id}/start`
3. Submit jawaban satu per satu: `POST /attempts/{id}/answer`
4. Selesai: `POST /attempts/{id}/finish`
5. Lihat hasil: `GET /attempts/{id}`

### 3. Alur Guru Melihat Hasil:

1. Dashboard: `GET /dashboard/teacher`
2. Statistik test: `GET /reports/test/{testId}/statistics`
3. Detail siswa: `GET /reports/attempt/{attemptId}/analysis`
4. Export: `GET /reports/test/{testId}/export`

---

## Fitur-Fitur Unggulan

✅ **Bank Soal** - Simpan dan gunakan ulang soal
✅ **Duplicate Test** - Salin test dengan cepat
✅ **Statistik Lengkap** - Analisis mendalam hasil test
✅ **Filter & Search** - Cari test dan soal dengan mudah
✅ **Multi Level Difficulty** - Tingkat kesulitan soal
✅ **Question Analysis** - Analisis soal mana yang sulit
✅ **Export Results** - Export hasil untuk laporan
✅ **Real-time Dashboard** - Monitor progress siswa

---

Dibuat dengan ❤️ untuk kemudahan Guru dalam mengelola CBT
