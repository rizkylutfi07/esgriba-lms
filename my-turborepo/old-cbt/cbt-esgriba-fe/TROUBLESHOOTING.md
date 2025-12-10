# Troubleshooting - Siswa Mengerjakan Ujian

## Error: "Data ujian tidak lengkap"

### Penyebab

Error ini terjadi ketika test yang dipilih belum memiliki soal.

### Solusi

#### Untuk Guru:

1. Buka menu **CBT** > **Bank Soal**
2. Klik **Buat Soal Baru** atau **Import Soal**
3. Buat minimal 1 soal untuk ujian tersebut
4. Pastikan soal sudah tersimpan dengan benar
5. Kembali ke **Daftar Ujian** dan edit ujian
6. Pastikan soal sudah ter-assign ke ujian

#### Untuk Admin/Developer:

Cek database untuk memastikan:

```sql
-- Cek apakah test punya soal
SELECT t.id, t.title, COUNT(q.id) as total_soal
FROM tests t
LEFT JOIN questions q ON q.test_id = t.id
WHERE t.id = YOUR_TEST_ID
GROUP BY t.id;
```

Jika `total_soal = 0`, maka test belum punya soal.

## Error: "Ujian belum diaktifkan"

### Penyebab

Test memiliki flag `is_active = false`

### Solusi

1. Guru harus mengaktifkan ujian terlebih dahulu
2. Buka **Daftar Ujian** > Klik ujian > **Edit**
3. Toggle **Status Aktif** menjadi ON
4. Simpan perubahan

## Error: "Ujian belum dimulai" atau "Ujian sudah berakhir"

### Penyebab

Waktu sekarang berada di luar rentang `start_time` dan `end_time` ujian

### Solusi

1. Guru perlu update waktu ujian
2. Buka **Daftar Ujian** > Klik ujian > **Edit**
3. Update **Waktu Mulai** dan **Waktu Selesai**
4. Pastikan waktu sudah sesuai
5. Simpan perubahan

## Testing - Cara Membuat Test dengan Soal

### 1. Buat Test Baru

```http
POST /api/tests
{
  "title": "Test Matematika",
  "subject": "Matematika",
  "kelas": "X MIPA 1",
  "duration": 60,
  "passing_score": 75,
  "start_time": "2025-10-31 08:00:00",
  "end_time": "2025-11-01 23:59:59",
  "is_active": true
}
```

### 2. Tambah Soal Multiple Choice

```http
POST /api/questions
{
  "test_id": 1,
  "question_text": "Berapa hasil dari 2 + 2?",
  "question_type": "multiple_choice",
  "points": 10,
  "order_number": 1,
  "options": [
    { "option_text": "3", "is_correct": false },
    { "option_text": "4", "is_correct": true },
    { "option_text": "5", "is_correct": false },
    { "option_text": "6", "is_correct": false }
  ]
}
```

### 3. Tambah Soal Essay

```http
POST /api/questions
{
  "test_id": 1,
  "question_text": "Jelaskan teorema Pythagoras!",
  "question_type": "essay",
  "points": 20,
  "order_number": 2
}
```

### 4. Mulai Test

```http
POST /api/tests/1/start
```

Response yang benar:

```json
{
  "message": "Test attempt started",
  "attempt": {
    "id": 1,
    "test_id": 1,
    "user_id": 3,
    "started_at": "2025-10-31T22:00:00.000000Z",
    "status": "in_progress",
    "test": {
      "id": 1,
      "title": "Test Matematika",
      "duration": 60,
      "questions": [
        {
          "id": 1,
          "question_text": "Berapa hasil dari 2 + 2?",
          "question_type": "multiple_choice",
          "points": 10,
          "options": [...]
        },
        {
          "id": 2,
          "question_text": "Jelaskan teorema Pythagoras!",
          "question_type": "essay",
          "points": 20
        }
      ]
    }
  }
}
```

## Debug Checklist

Ketika siswa tidak bisa mulai ujian, cek:

- [ ] Apakah test sudah punya soal? (minimal 1)
- [ ] Apakah test.is_active = true?
- [ ] Apakah waktu sekarang antara start_time dan end_time?
- [ ] Apakah siswa sudah login dengan benar?
- [ ] Apakah siswa punya role 'siswa'?
- [ ] Apakah tidak ada attempt aktif sebelumnya?

## Console Errors

### Browser Console

Buka browser console (F12) untuk melihat:

- API Response log
- Error details
- Network errors

### Laravel Log

Check file `storage/logs/laravel.log` untuk:

- Database errors
- Validation errors
- Permission errors

## Common Issues

### 1. "Cannot read properties of undefined (reading '0')"

**Penyebab**: Questions array kosong atau undefined  
**Solusi**: Tambah soal ke test

### 2. "403 Forbidden"

**Penyebab**: Test tidak aktif atau di luar waktu  
**Solusi**: Aktifkan test dan atur waktu yang benar

### 3. "Network Error"

**Penyebab**: Backend tidak running atau CORS issue  
**Solusi**:

- Pastikan backend running di port 8000
- Check CORS configuration
- Check API base URL di frontend

## Kontak Support

Jika masih ada masalah:

1. Screenshot error message
2. Copy console log
3. Hubungi tim developer
4. Sertakan informasi test ID dan user ID

---

**Last Updated**: Oktober 2025
