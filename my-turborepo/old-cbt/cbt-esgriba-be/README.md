# CBT Backend - Laravel API

# 🎓 CBT E-Sgriba Backend

Backend API untuk sistem **Computer Based Test (CBT) E-Sgriba** - Sistem ujian online yang user-friendly khususnya untuk guru mata pelajaran.

[![Laravel](https://img.shields.io/badge/Laravel-10.x-red.svg)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.3+-blue.svg)](https://php.net)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ Fitur Utama

### 🏦 Bank Soal

- Simpan soal untuk digunakan berkali-kali
- Kategori & level kesulitan (Mudah, Sedang, Sulit)
- Support multiple choice, essay, dan true/false
- Bulk add soal ke test
- Tracking penggunaan soal

### 📝 Manajemen Test

- Buat, edit, duplicate, dan delete test
- Publish/Unpublish test
- Filter by subject, class, status
- Auto-grading untuk multiple choice
- Set durasi & passing score

### 📊 Statistik & Laporan

- Dashboard guru & siswa
- Statistik detail per test
- Distribusi nilai (chart-ready)
- Analisis per soal (% jawaban benar)
- Top performers
- Export hasil test

### 👥 Role-Based Access

- **Admin**: Full control sistem
- **Guru**: Manage test & bank soal, lihat hasil siswa
- **Siswa**: Mengerjakan test, lihat hasil pribadi

### 🔐 Security & Monitoring

- JWT Authentication
- Role-based authorization
- Input validation
- SQL injection protection
- XSS protection
- 🔄 **NEW!** Toggle Sistem Deteksi Kecurangan (per ujian)
- Real-time monitoring aktivitas siswa
- Auto-blocking untuk pelanggaran berulang (opsional)
- Event logging lengkap untuk analisis

### 📥 Import/Export

- ⭐ **NEW!** Import siswa dari file Excel (.xlsx, .xls, .csv)
- Template download otomatis
- Validation & error reporting
- Export hasil ujian

---

## 📚 Dokumentasi

| File                                                                               | Deskripsi                          |
| ---------------------------------------------------------------------------------- | ---------------------------------- |
| [QUICK_START.md](QUICK_START.md)                                                   | Panduan setup & testing cepat      |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md)                                       | Dokumentasi lengkap API endpoints  |
| [PANDUAN_GURU.md](PANDUAN_GURU.md)                                                 | Panduan penggunaan untuk guru      |
| [FITUR_SUMMARY.md](FITUR_SUMMARY.md)                                               | Summary semua fitur yang tersedia  |
| [IMPORT_SISWA_FEATURE.md](IMPORT_SISWA_FEATURE.md)                                 | ⭐ Fitur import siswa dari Excel   |
| [../FITUR_TOGGLE_DETEKSI_KECURANGAN.md](../FITUR_TOGGLE_DETEKSI_KECURANGAN.md)     | 🔄 Fitur toggle deteksi kecurangan |
| [../PANDUAN_TOGGLE_DETEKSI_KECURANGAN.md](../PANDUAN_TOGGLE_DETEKSI_KECURANGAN.md) | 🎓 Panduan lengkap toggle deteksi  |
| [postman_collection.json](postman_collection.json)                                 | Postman collection untuk testing   |

---

## 🚀 Quick Start

### Prerequisites

- PHP 8.3+
- MySQL/MariaDB
- Composer

### Installation

```bash
# 1. Clone repository
git clone https://github.com/esgriba/cbt-esgriba-be.git
cd cbt-esgriba-be

# 2. Install dependencies
composer install

# 3. Setup environment
cp .env.example .env
php artisan key:generate
php artisan jwt:secret

# 4. Konfigurasi database di .env
# DB_DATABASE=cbt_esgriba
# DB_USERNAME=root
# DB_PASSWORD=

# 5. Jalankan migration
php artisan migrate

# 6. (Optional) Seed data
php artisan db:seed

# 7. Jalankan server
php artisan serve
```

Server berjalan di: `http://localhost:8000`

Lihat [QUICK_START.md](QUICK_START.md) untuk detail lebih lengkap.

---

## 📖 API Endpoints

### Authentication

- `POST /api/login` - Login
- `POST /api/logout` - Logout
- `GET /api/me` - Get profile

### Question Bank (Guru)

- `GET /api/question-bank` - List soal
- `POST /api/question-bank` - Tambah soal
- `PUT /api/question-bank/{id}` - Update soal
- `DELETE /api/question-bank/{id}` - Delete soal
- `POST /api/question-bank/bulk-add-to-test` - Bulk add ke test

### Tests (Guru)

- `GET /api/tests` - List test
- `POST /api/tests` - Buat test
- `PUT /api/tests/{id}` - Update test
- `DELETE /api/tests/{id}` - Delete test
- `POST /api/tests/{id}/duplicate` - Duplicate test
- `POST /api/tests/{id}/toggle-publish` - Publish/Unpublish

### Test Attempts (Siswa)

- `POST /api/tests/{id}/start` - Mulai test
- `POST /api/attempts/{id}/answer` - Submit jawaban
- `POST /api/attempts/{id}/finish` - Finish test
- `GET /api/attempts` - List attempt saya

### Reports & Statistics

- `GET /api/dashboard/teacher` - Dashboard guru
- `GET /api/dashboard/student` - Dashboard siswa
- `GET /api/reports/test/{id}/statistics` - Statistik test
- `GET /api/reports/attempt/{id}/analysis` - Analisis jawaban
- `GET /api/reports/test/{id}/export` - Export hasil

Lihat [API_DOCUMENTATION.md](API_DOCUMENTATION.md) untuk dokumentasi lengkap.

---

## 🎯 Use Cases

### Guru Membuat Test

1. Tambah soal ke bank soal (atau gunakan yang sudah ada)
2. Buat test baru (draft)
3. Bulk add soal dari bank
4. Preview & check
5. Publish test

### Siswa Mengerjakan Test

1. Login & lihat test tersedia
2. Start test
3. Jawab soal satu per satu
4. Finish test
5. Lihat hasil & pembahasan

### Guru Analisis Hasil

1. Lihat dashboard statistik
2. Check statistik per test
3. Analisis jawaban siswa
4. Identifikasi soal yang sulit
5. Export untuk laporan

---

## 🧪 Testing

### Import Postman Collection

1. Buka Postman
2. Import file `postman_collection.json`
3. Set variable `base_url` dan `token`
4. Test endpoints

### Manual Testing

```bash
# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"guru@example.com","password":"password123"}'

# Get profile (dengan token)
curl -X GET http://localhost:8000/api/me \
  -H "Authorization: Bearer {your-token}"
```

---

## 🏗️ Tech Stack

- **Framework**: Laravel 10.x
- **Authentication**: JWT (tymon/jwt-auth)
- **Database**: MySQL/MariaDB
- **PHP**: 8.3+
- **Architecture**: RESTful API

---

## 📁 Project Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── AuthController.php
│   │       ├── TestController.php
│   │       ├── QuestionBankController.php
│   │       ├── ReportController.php
│   │       └── ...
│   └── Middleware/
│       └── CheckRole.php
├── Models/
│   ├── Test.php
│   ├── Question.php
│   ├── QuestionBank.php
│   ├── TestAttempt.php
│   └── User.php
└── ...

database/
├── migrations/
└── seeders/

routes/
└── api.php
```

---

## 🔧 Configuration

### Environment Variables

```env
# App
APP_NAME="CBT E-Sgriba"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cbt_esgriba
DB_USERNAME=root
DB_PASSWORD=

# JWT
JWT_SECRET=your-secret-key
JWT_TTL=60
```

---

## 👥 Default Users (After Seeding)

| Role  | Email             | Password    |
| ----- | ----------------- | ----------- |
| Admin | admin@example.com | password123 |
| Guru  | guru@example.com  | password123 |
| Siswa | siswa@example.com | password123 |

**⚠️ Ganti password di production!**

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support

- **Documentation**: Lihat folder dokumentasi
- **Issues**: Buat issue di GitHub
- **Email**: [your-email@example.com]

---

## 🎉 Credits

Dibuat dengan ❤️ untuk kemudahan Guru dalam mengelola CBT

---

**Status**: ✅ Production Ready

_Last Updated: 29 Oktober 2025_

## Fitur

- 🔐 Multi-user authentication (Admin, Guru, Siswa)
- 📝 Manajemen ujian dan soal
- ✅ Sistem penilaian otomatis
- 📊 Laporan hasil ujian
- 🔒 JWT Authentication
- 🛡️ Role-based access control

## Requirement

- PHP >= 8.1
- Composer
- MySQL
- Laravel 10

## Instalasi

1. Install dependencies:

```bash
composer install
```

2. Copy file environment:

```bash
cp .env.example .env
```

3. Generate application key:

```bash
php artisan key:generate
```

4. Generate JWT secret:

```bash
php artisan jwt:secret
```

5. Konfigurasi database di file `.env`:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cbt_database
DB_USERNAME=root
DB_PASSWORD=
```

6. Jalankan migrasi database:

```bash
php artisan migrate
```

7. Jalankan seeder (untuk data awal):

```bash
php artisan db:seed
```

8. Jalankan server:

```bash
php artisan serve
```

API akan berjalan di `http://localhost:8000`

## Default Users

Setelah menjalankan seeder, tersedia user default:

**Admin:**

- Email: admin@cbt.com
- Password: password

**Guru:**

- Email: guru@cbt.com
- Password: password

**Siswa:**

- Email: siswa@cbt.com
- Password: password

## API Endpoints

### Authentication

- `POST /api/login` - Login
- `POST /api/register` - Register user baru
- `POST /api/logout` - Logout
- `GET /api/me` - Get user info
- `POST /api/refresh` - Refresh token

### Tests (Guru & Admin)

- `GET /api/tests` - Get all tests
- `POST /api/tests` - Create test
- `GET /api/tests/{id}` - Get test detail
- `PUT /api/tests/{id}` - Update test
- `DELETE /api/tests/{id}` - Delete test
- `POST /api/tests/{id}/questions` - Add questions to test
- `GET /api/tests/{id}/attempts` - Get test attempts

### Test Attempts (Siswa)

- `POST /api/tests/{id}/start` - Start test
- `POST /api/attempts/{id}/answer` - Submit answer
- `POST /api/attempts/{id}/finish` - Finish test
- `GET /api/attempts` - Get my attempts
- `GET /api/attempts/{id}` - Get attempt detail

### Users (Admin only)

- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user detail
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

## Database Schema

### Users

- Admin: Mengelola seluruh sistem
- Guru: Membuat dan mengelola ujian
- Siswa: Mengikuti ujian

### Tests

- Ujian yang dibuat oleh guru
- Memiliki waktu mulai dan selesai
- Memiliki durasi dan passing score

### Questions

- Soal untuk setiap ujian
- Tipe: Multiple choice atau essay
- Memiliki poin

### Question Options

- Opsi jawaban untuk soal multiple choice
- Menandai jawaban yang benar

### Test Attempts

- Record percobaan ujian siswa
- Menyimpan score dan status

### User Answers

- Jawaban siswa untuk setiap soal
- Menyimpan poin yang didapat

## License

MIT License
