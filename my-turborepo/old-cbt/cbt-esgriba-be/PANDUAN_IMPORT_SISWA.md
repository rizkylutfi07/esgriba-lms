# 🎓 Panduan Import Data Siswa - CBT E-Sgriba

## Untuk Admin

### 📥 Cara Import Data Siswa dengan Excel

#### Langkah 1: Download Template

1. Login sebagai Admin
2. Akses endpoint: `GET /api/students/template`
3. Atau gunakan Postman/cURL:
   ```bash
   curl -X GET "http://localhost:8000/api/students/template" \
     -H "Authorization: Bearer {your-admin-token}" \
     --output template_siswa.xlsx
   ```
4. Template akan terdownload dengan nama `template_import_siswa.xlsx`

#### Langkah 2: Isi Data di Excel

1. Buka file template di Microsoft Excel atau Google Sheets
2. Hapus 2 baris contoh (row 2 dan 3)
3. Isi data siswa dengan format:

| nama        | email             | nis     | password | kelas    | jurusan | status |
| ----------- | ----------------- | ------- | -------- | -------- | ------- | ------ |
| Ahmad Rizki | ahmad@sekolah.com | 2024001 | pass123  | X MIPA 1 | IPA     | aktif  |
| Siti Nur    | siti@sekolah.com  | 2024002 | pass123  | X MIPA 2 | IPA     | aktif  |

**Catatan Penting:**

- ✅ **nama** dan **email** WAJIB diisi
- ✅ **email** harus unik (tidak boleh sama)
- ✅ **nis** harus unik jika diisi
- ✅ **password** jika kosong akan jadi "password123"
- ✅ **kelas** dan **jurusan** akan dibuat otomatis jika belum ada
- ✅ **status** jika kosong akan jadi "aktif"

#### Langkah 3: Upload File

1. Save file Excel
2. Upload via API:
   ```bash
   curl -X POST "http://localhost:8000/api/students/import" \
     -H "Authorization: Bearer {your-admin-token}" \
     -F "file=@template_siswa.xlsx"
   ```

#### Langkah 4: Cek Hasil

Response akan menampilkan:

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

Jika ada error:

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
      "row": { "nama": "Ahmad", "email": "ahmad@email.com" },
      "error": "Email sudah terdaftar"
    }
  ]
}
```

### 📤 Cara Export Data Siswa

#### Export Semua Siswa

```bash
curl -X GET "http://localhost:8000/api/students/export" \
  -H "Authorization: Bearer {your-admin-token}" \
  --output data_siswa.xlsx
```

#### Export Siswa per Kelas

```bash
curl -X GET "http://localhost:8000/api/students/export?class_id=1" \
  -H "Authorization: Bearer {your-admin-token}" \
  --output data_siswa_kelas_1.xlsx
```

#### Export Siswa per Jurusan

```bash
curl -X GET "http://localhost:8000/api/students/export?major_id=2" \
  -H "Authorization: Bearer {your-admin-token}" \
  --output data_siswa_ipa.xlsx
```

## 🎯 Tips & Trik

### ✅ Do's (Yang Harus Dilakukan)

1. **Test dulu** dengan 5-10 data sebelum import besar
2. **Backup database** sebelum import data banyak
3. **Cek duplikat** email dan NIS sebelum upload
4. **Gunakan format email yang valid** (contoh@sekolah.com)
5. **Password minimal 6 karakter** untuk keamanan
6. **Konsisten** dalam penulisan nama kelas dan jurusan

### ❌ Don'ts (Yang Harus Dihindari)

1. **Jangan** gunakan email yang sudah terdaftar
2. **Jangan** gunakan NIS yang sama untuk siswa berbeda
3. **Jangan** import file > 2 MB (max 1000 siswa per import)
4. **Jangan** gunakan format selain .xlsx atau .xls
5. **Jangan** kosongkan kolom nama dan email
6. **Jangan** lupa hapus baris contoh di template

## 🐛 Troubleshooting

### Error: "Email sudah terdaftar"

**Penyebab:** Email yang diinput sudah ada di database

**Solusi:**

- Cek apakah siswa sudah pernah didaftarkan
- Gunakan email lain yang belum terdaftar
- Export data dulu untuk cek email yang sudah ada

### Error: "NIS sudah terdaftar"

**Penyebab:** NIS yang diinput sudah digunakan siswa lain

**Solusi:**

- Gunakan NIS yang berbeda
- Kosongkan kolom NIS jika tidak wajib

### Error: "Format email tidak valid"

**Penyebab:** Format email salah (contoh: "ahmad" bukan "ahmad@email.com")

**Solusi:**

- Perbaiki format: namauser@domain.com
- Contoh: siswa@sekolah.com, ahmad.123@gmail.com

### Error: "The file field is required"

**Penyebab:** File tidak diupload atau nama field salah

**Solusi:**

- Pastikan field form bernama "file"
- Cek file sudah dipilih sebelum upload

### Error: "Validation errors in Excel file"

**Penyebab:** Ada data yang tidak valid di Excel

**Solusi:**

- Cek response untuk detail error di row mana
- Perbaiki data sesuai aturan validasi
- Upload ulang

## 📊 Contoh Kasus Penggunaan

### Kasus 1: Import 50 Siswa Baru Kelas X

1. Download template
2. Isi data 50 siswa kelas X
3. Set kelas: "X MIPA 1", "X MIPA 2", "X IPS 1"
4. Set jurusan: "IPA" atau "IPS"
5. Upload file
6. Cek hasil: 50 success, 0 failed ✅

### Kasus 2: Import dengan Beberapa Error

1. Upload file 100 siswa
2. Response: 95 success, 5 failed
3. Cek detail error:
   - Row 23: Email duplikat
   - Row 45: NIS duplikat
   - Row 67: Format email salah
   - Row 78: Nama kosong
   - Row 91: Email duplikat
4. Perbaiki 5 data yang error
5. Buat file baru dengan 5 data yang sudah diperbaiki
6. Upload ulang: 5 success, 0 failed ✅

### Kasus 3: Update Data (Cara Manual)

**Note:** Import tidak support update otomatis

Untuk update data siswa yang sudah ada:

1. Export data siswa dulu
2. Edit data di Excel
3. Delete siswa lama via API: `DELETE /api/users/{id}`
4. Import data baru
5. Atau gunakan: `PUT /api/users/{id}` untuk update satu per satu

## 🔒 Keamanan

### Password Default

- Semua siswa yang diimport mendapat password default: `password123`
- **PENTING:** Minta siswa mengganti password setelah login pertama kali
- Untuk production, gunakan password yang lebih kuat

### Permission

- Hanya **Admin** yang bisa import/export data siswa
- Guru dan Siswa tidak bisa akses fitur ini
- Token JWT wajib valid dan belum expired

## 📞 Bantuan

Jika mengalami kesulitan:

1. Baca dokumentasi lengkap: `IMPORT_SISWA_FEATURE.md`
2. Cek API Documentation: `API_DOCUMENTATION.md`
3. Lihat log error di: `storage/logs/laravel.log`
4. Hubungi admin sistem

---

**Happy Importing! 🎉**

_Dibuat dengan ❤️ untuk kemudahan Admin dalam mengelola data siswa_

_Last Updated: 4 November 2025_
