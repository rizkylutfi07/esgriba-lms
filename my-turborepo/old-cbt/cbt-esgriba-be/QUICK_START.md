# 🚀 Quick Start Guide - CBT E-Sgriba

Panduan cepat untuk mulai menggunakan sistem CBT E-Sgriba.

---

## 📋 Prerequisites

✅ PHP 8.3+
✅ MySQL/MariaDB
✅ Composer
✅ Laravel 10.x

---

## 🔧 Setup Awal

### 1. Install Dependencies

```bash
composer install
```

### 2. Setup Environment

```bash
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

### 3. Konfigurasi Database

Edit file `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cbt_esgriba
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Jalankan Migration

```bash
php artisan migrate
```

### 5. (Optional) Seed Data

```bash
php artisan db:seed
```

### 6. Jalankan Server

```bash
php artisan serve
php artisan serve --host=0.0.0.0 --port=8000
```

Server berjalan di: `http://localhost:8000`

---

## 👥 Buat User Pertama

### Cara 1: Via API (POST /api/register)

```json
{
  "name": "Admin System",
  "email": "admin@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "admin"
}
```

### Cara 2: Via Tinker

```bash
php artisan tinker
```

```php
// Buat Admin
User::create([
    'name' => 'Admin System',
    'email' => 'admin@example.com',
    'password' => bcrypt('password123'),
    'role' => 'admin',
    'is_active' => true,
]);

// Buat Guru
User::create([
    'name' => 'Budi Santoso',
    'email' => 'guru@example.com',
    'password' => bcrypt('password123'),
    'role' => 'guru',
    'is_active' => true,
]);

// Buat Siswa
User::create([
    'name' => 'Ahmad Student',
    'email' => 'siswa@example.com',
    'password' => bcrypt('password123'),
    'role' => 'siswa',
    'is_active' => true,
]);
```

---

## 🧪 Testing API

### 1. Login

```bash
POST http://localhost:8000/api/login
Content-Type: application/json

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
  "expires_in": 3600
}
```

### 2. Test Endpoint (dengan token)

```bash
GET http://localhost:8000/api/me
Authorization: Bearer {your-token}
```

---

## 📝 Workflow Testing

### A. Testing sebagai Guru

1. **Login sebagai Guru**

```bash
POST /api/login
{
  "email": "guru@example.com",
  "password": "password123"
}
```

2. **Buat Subject (jika belum ada)**

```bash
POST /api/subjects
Authorization: Bearer {token}
{
  "name": "Matematika",
  "code": "MTK"
}
```

3. **Tambah Soal ke Bank**

```bash
POST /api/question-bank
Authorization: Bearer {token}
{
  "subject_id": 1,
  "category": "Trigonometri",
  "question_text": "Berapakah nilai sin 30°?",
  "question_type": "multiple_choice",
  "difficulty_level": 1,
  "points": 10,
  "explanation": "Sin 30° = 1/2",
  "options": [
    {"text": "1/2", "is_correct": true},
    {"text": "1/3", "is_correct": false},
    {"text": "√3/2", "is_correct": false}
  ]
}
```

4. **Buat Test**

```bash
POST /api/tests
Authorization: Bearer {token}
{
  "title": "Ujian Matematika UTS",
  "description": "Materi: Trigonometri",
  "subject": "Matematika",
  "kelas": "X MIPA 1",
  "duration": 90,
  "passing_score": 70,
  "start_time": "2025-11-01 08:00:00",
  "end_time": "2025-11-01 10:00:00"
}
```

5. **Tambah Soal dari Bank ke Test**

```bash
POST /api/question-bank/bulk-add-to-test
Authorization: Bearer {token}
{
  "test_id": 1,
  "question_ids": [1, 2, 3, 4, 5]
}
```

6. **Publish Test**

```bash
POST /api/tests/1/toggle-publish
Authorization: Bearer {token}
```

7. **Lihat Dashboard**

```bash
GET /api/dashboard/teacher
Authorization: Bearer {token}
```

### B. Testing sebagai Siswa

1. **Login sebagai Siswa**

```bash
POST /api/login
{
  "email": "siswa@example.com",
  "password": "password123"
}
```

2. **Lihat Test Tersedia**

```bash
GET /api/tests?status=active
Authorization: Bearer {token}
```

3. **Mulai Test**

```bash
POST /api/tests/1/start
Authorization: Bearer {token}
```

4. **Submit Jawaban**

```bash
POST /api/attempts/1/answer
Authorization: Bearer {token}
{
  "question_id": 1,
  "option_id": 2
}
```

5. **Finish Test**

```bash
POST /api/attempts/1/finish
Authorization: Bearer {token}
```

6. **Lihat Hasil**

```bash
GET /api/attempts/1
Authorization: Bearer {token}
```

### C. Testing sebagai Guru (Lihat Hasil)

1. **Statistik Test**

```bash
GET /api/reports/test/1/statistics
Authorization: Bearer {token}
```

2. **Analisis Jawaban Siswa**

```bash
GET /api/reports/attempt/1/analysis
Authorization: Bearer {token}
```

3. **Export Hasil**

```bash
GET /api/reports/test/1/export
Authorization: Bearer {token}
```

---

## 🐛 Troubleshooting

### Error: "Nothing to migrate"

✅ Migration sudah dijalankan sebelumnya. Cek dengan:

```bash
php artisan migrate:status
```

### Error: "SQLSTATE[HY000] [1045] Access denied"

❌ Username/password database salah di `.env`
✅ Cek konfigurasi database

### Error: "Class 'X' not found"

❌ Autoload belum di-refresh
✅ Jalankan:

```bash
composer dump-autoload
```

### Error: "Token has expired"

❌ Token JWT sudah kadaluarsa
✅ Login ulang untuk dapat token baru

### Test tidak muncul untuk siswa

✅ Check:

- Test sudah di-publish?
- Waktu start sudah lewat?
- Waktu end belum lewat?

---

## 📚 Dokumentasi Lengkap

- **API Documentation**: `API_DOCUMENTATION.md`
- **Panduan Guru**: `PANDUAN_GURU.md`
- **Summary Fitur**: `FITUR_SUMMARY.md`
- **Import Siswa**: `IMPORT_SISWA_FEATURE.md` ⭐
- **Toggle Deteksi Kecurangan**: `../FITUR_TOGGLE_DETEKSI_KECURANGAN.md` 🔄 NEW!

---

## 🔑 Default Credentials (Setelah Seeding)

| Role  | Email             | Password    |
| ----- | ----------------- | ----------- |
| Admin | admin@example.com | password123 |
| Guru  | guru@example.com  | password123 |
| Siswa | siswa@example.com | password123 |

**⚠️ PENTING:** Ganti password ini di production!

---

## 🎯 Next Steps

1. ✅ Buat master data (Subject, Class, Major, Room)
2. ✅ Buat user guru dan siswa (atau import via Excel! 📥)
3. ✅ Guru buat bank soal
4. ✅ Guru buat test
5. ✅ Siswa mengerjakan test
6. ✅ Guru analisis hasil

### 📥 Cara Cepat: Import Siswa dari Excel

```bash
# 1. Download template
GET /api/students/template

# 2. Isi data di Excel

# 3. Import
POST /api/students/import
Body: file=@data_siswa.xlsx

# Done! 🎉
```

**📖 Detail lengkap:** Lihat `IMPORT_SISWA_FEATURE.md`

---

## 🆘 Need Help?

- 📖 Baca dokumentasi lengkap
- 🐛 Check error logs di `storage/logs/laravel.log`
- 💬 Hubungi admin system

---

**Happy Testing!** 🎉

_Last Updated: 29 Oktober 2025_
