# Fitur Paket Soal

## Deskripsi

Fitur paket soal memungkinkan guru untuk mengelompokkan soal-soal berdasarkan topik, tingkat kesulitan, atau tema tertentu untuk memudahkan pembuatan ujian.

## Backend Setup

### 1. Migration

Jalankan migration untuk membuat tabel:

```bash
cd cbt-esgriba-be
php artisan migrate
```

### 2. Model & Controller

- **Model**: `app/Models/QuestionPackage.php`
- **Controller**: `app/Http/Controllers/Api/QuestionPackageController.php`
- **Routes**: Sudah ditambahkan di `routes/api.php`

### 3. Fitur Backend

- ✅ Create, Read, Update, Delete paket soal
- ✅ Add/Remove soal ke/dari paket
- ✅ Reorder soal dalam paket
- ✅ Duplicate paket
- ✅ Filter by subject & difficulty
- ✅ Auto-update total questions & points

## Frontend Setup

### 1. Service

File: `src/lib/services/questionPackageService.ts`

- All CRUD operations
- Add/remove questions
- Reorder & duplicate

### 2. Pages

**List Page**: `src/pages/guru/QuestionPackages.tsx`

- Daftar semua paket soal
- Create/edit paket
- Delete & duplicate
- Filter & search

**Detail Page** (to be created): `src/pages/guru/QuestionPackageDetail.tsx`

- Manage questions in package
- Add questions from question bank
- Reorder questions
- Preview package

### 3. Routes

Tambahkan di `App.tsx`:

```tsx
<Route
  path="/question-packages"
  element={
    <ProtectedRoute allowedRoles={["guru", "admin"]}>
      <QuestionPackages />
    </ProtectedRoute>
  }
/>
<Route
  path="/question-packages/:id"
  element={
    <ProtectedRoute allowedRoles={["guru", "admin"]}>
      <QuestionPackageDetail />
    </ProtectedRoute>
  }
/>
```

### 4. Navigation

Tambahkan di `Sidebar.tsx`:

```tsx
{
  title: 'Paket Soal',
  icon: Package,
  path: '/question-packages',
  roles: ['admin', 'guru']
}
```

## Penggunaan

### Untuk Guru:

1. Masuk ke menu "Paket Soal"
2. Klik "Buat Paket Baru"
3. Isi nama, deskripsi, pilih mata pelajaran dan tingkat kesulitan
4. Klik "Buat & Tambah Soal"
5. Pilih soal dari bank soal untuk ditambahkan ke paket
6. Atur urutan soal (drag & drop atau input order)
7. Gunakan paket ini saat membuat ujian

### Keuntungan:

- ✅ Pengelompokan soal yang lebih terorganisir
- ✅ Pembuatan ujian lebih cepat
- ✅ Reuse paket soal untuk ujian berbeda
- ✅ Mudah duplikasi dan modifikasi
- ✅ Tracking total soal dan poin

## API Endpoints

### Packages

- `GET /api/question-packages` - List all packages
- `POST /api/question-packages` - Create package
- `GET /api/question-packages/{id}` - Get package detail
- `PUT /api/question-packages/{id}` - Update package
- `DELETE /api/question-packages/{id}` - Delete package

### Package Questions

- `POST /api/question-packages/{id}/questions` - Add questions
- `DELETE /api/question-packages/{id}/questions/{questionId}` - Remove question
- `PUT /api/question-packages/{id}/reorder` - Reorder questions
- `POST /api/question-packages/{id}/duplicate` - Duplicate package

## Database Schema

### question_packages

- id
- name
- description
- subject_id (FK)
- created_by (FK)
- difficulty_level (easy/medium/hard)
- total_questions
- total_points
- timestamps

### package_questions (pivot)

- id
- package_id (FK)
- question_id (FK)
- order
- timestamps

## Next Steps (Optional Enhancements)

- [ ] Drag & drop untuk reorder soal
- [ ] Bulk import soal ke paket
- [ ] Export paket as PDF/Word
- [ ] Share paket antar guru
- [ ] Template paket soal
- [ ] Statistics & analytics per paket
