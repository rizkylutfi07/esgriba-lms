# Fitur: Filter Mata Pelajaran Berdasarkan Guru

## Deskripsi

Ketika guru membuat ujian baru, dropdown mata pelajaran hanya menampilkan mata pelajaran yang diajarkan oleh guru tersebut. Admin tetap dapat melihat semua mata pelajaran.

## Perubahan

### Backend

#### 1. `SubjectController.php`

- **Method `index()`**: Dimodifikasi untuk mengecek role user
  - Jika user adalah **guru**: hanya return subjects yang diajar
  - Jika user adalah **admin**: return semua subjects
- **Method `mySubjects()`**: Method baru khusus untuk guru
  - Endpoint: `GET /api/my-subjects`
  - Hanya bisa diakses oleh role **guru**
  - Return subjects yang di-assign ke guru tersebut

#### 2. `routes/api.php`

- Tambah route baru: `GET /api/my-subjects` (role: guru)

### Frontend

#### 1. `masterDataService.ts`

- Tambah method `getMySubjects()` untuk fetch subjects guru

#### 2. `CreateTest.tsx`

- Import `useAuthStore` untuk mengakses user role
- Modifikasi `loadMasterData()`:
  - Jika user adalah **guru**: gunakan `getMySubjects()`
  - Jika user adalah **admin**: gunakan `getAll()`
- Tambah pesan informatif jika guru belum punya mata pelajaran

## Cara Assign Mata Pelajaran ke Guru

### Opsi 1: Melalui Database (Manual)

```sql
-- Assign mata pelajaran ke guru
INSERT INTO subject_user (user_id, subject_id, created_at, updated_at)
VALUES (GURU_ID, SUBJECT_ID, NOW(), NOW());

-- Contoh: Assign Matematika (id=1) ke Guru Budi (id=5)
INSERT INTO subject_user (user_id, subject_id, created_at, updated_at)
VALUES (5, 1, NOW(), NOW());
```

### Opsi 2: Melalui API (Recommended)

Buat endpoint baru untuk admin assign subjects ke guru:

```php
// SubjectController.php
public function assignToTeacher(Request $request, $subjectId)
{
    $validator = Validator::make($request->all(), [
        'teacher_ids' => 'required|array',
        'teacher_ids.*' => 'exists:users,id'
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $subject = Subject::findOrFail($subjectId);

    // Sync teachers (replace existing assignments)
    $subject->teachers()->sync($request->teacher_ids);

    return response()->json([
        'message' => 'Guru berhasil di-assign ke mata pelajaran',
        'subject' => $subject->load('teachers')
    ]);
}
```

### Opsi 3: UI untuk Admin (Future Enhancement)

Buat halaman admin untuk manage teacher-subject assignment:

- List semua guru
- Untuk setiap guru, ada multi-select mata pelajaran
- Save assignment

## Testing

### 1. Test sebagai Guru

```bash
# Login sebagai guru
POST /api/login
{
  "email": "guru@example.com",
  "password": "password"
}

# Get my subjects
GET /api/my-subjects
# Seharusnya hanya return subjects yang di-assign
```

### 2. Test Create Test

1. Login sebagai guru yang sudah punya subjects
2. Klik **Buat Ujian**
3. Dropdown **Mata Pelajaran** hanya menampilkan mapel guru tersebut
4. Jika guru belum punya subjects, muncul pesan informatif

### 3. Test sebagai Admin

1. Login sebagai admin
2. Klik **Buat Ujian**
3. Dropdown **Mata Pelajaran** menampilkan semua mata pelajaran

## Database Schema

### Table: `subject_user` (Pivot Table)

```sql
CREATE TABLE subject_user (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    subject_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY subject_user_unique (user_id, subject_id)
);
```

## Benefits

✅ **Security**: Guru hanya bisa membuat ujian untuk mapel yang diajar
✅ **UX**: Dropdown lebih sederhana, tidak membingungkan
✅ **Data Integrity**: Mencegah guru membuat ujian untuk mapel yang bukan tanggung jawabnya
✅ **Scalability**: Mudah untuk manage banyak guru dengan berbagai mapel

## Troubleshooting

### Error: "Anda belum memiliki mata pelajaran"

**Penyebab**: Guru belum di-assign ke mata pelajaran apapun

**Solusi**:

1. Hubungi admin
2. Admin harus assign minimal 1 mata pelajaran ke guru tersebut
3. Bisa lewat database atau API

### Dropdown kosong untuk Admin

**Penyebab**: Belum ada mata pelajaran di database

**Solusi**:

1. Admin buka menu **Master Data** > **Mata Pelajaran**
2. Tambah mata pelajaran baru
3. Refresh halaman Create Test

## Future Enhancements

- [ ] UI untuk admin assign subjects ke guru
- [ ] Bulk assign subjects ke multiple guru
- [ ] Import guru dan subjects assignment dari Excel
- [ ] Notifikasi ke guru ketika di-assign mata pelajaran baru
- [ ] History log assignment changes

---

**Version**: 1.0.0  
**Date**: Oktober 2025  
**Author**: CBT Esgriba Team
