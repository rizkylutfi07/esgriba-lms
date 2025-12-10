# 📋 Template Excel - Import Data Siswa

Template ini digunakan untuk import data siswa ke sistem CBT E-Sgriba secara massal.

## 📝 Cara Menggunakan

### 1. Download Template

```bash
GET http://localhost:8000/api/students/template
Authorization: Bearer {admin-token}
```

File yang didownload: `template_import_siswa.xlsx`

### 2. Isi Data

Buka file di Microsoft Excel, Google Sheets, atau LibreOffice Calc.

### 3. Format Data

| Kolom    | Wajib    | Keterangan                               | Contoh            |
| -------- | -------- | ---------------------------------------- | ----------------- |
| nama     | ✅ Ya    | Nama lengkap siswa                       | Ahmad Rizki       |
| email    | ✅ Ya    | Email unik, format valid                 | ahmad@example.com |
| nis      | ❌ Tidak | Nomor Induk Siswa (unik)                 | 2024001           |
| password | ❌ Tidak | Min 6 karakter (default: password123)    | password123       |
| kelas    | ❌ Tidak | Nama kelas                               | X MIPA 1          |
| jurusan  | ❌ Tidak | Nama jurusan                             | IPA               |
| status   | ❌ Tidak | aktif/nonaktif atau 1/0 (default: aktif) | aktif             |

### 4. Contoh Data

```
nama              | email                   | nis     | password    | kelas    | jurusan | status
Ahmad Rizki       | ahmad@example.com       | 2024001 | password123 | X MIPA 1 | IPA     | aktif
Siti Nurhaliza    | siti@example.com        | 2024002 | password123 | X MIPA 2 | IPA     | aktif
Budi Santoso      | budi@example.com        | 2024003 | password123 | X IPS 1  | IPS     | aktif
```

### 5. Upload File

```bash
POST http://localhost:8000/api/students/import
Authorization: Bearer {admin-token}
Content-Type: multipart/form-data

file: [your-excel-file]
```

## ⚠️ Penting!

### Wajib Unique:

- **Email**: Tidak boleh sama dengan siswa lain
- **NIS**: Tidak boleh sama dengan siswa lain (jika diisi)

### Auto-Create:

- Jika **kelas** belum ada, akan otomatis dibuat
- Jika **jurusan** belum ada, akan otomatis dibuat
- Jika **password** kosong, default: `password123`
- Jika **status** kosong, default: `aktif`

## ✅ Best Practices

1. **Test dulu** dengan 5-10 data
2. **Backup** data sebelum import besar
3. **Cek** tidak ada email/NIS duplicate
4. **Hapus** baris contoh di template
5. **Save as** .xlsx format

## 🐛 Common Errors

| Error                    | Penyebab           | Solusi                   |
| ------------------------ | ------------------ | ------------------------ |
| Email sudah terdaftar    | Email duplicate    | Gunakan email lain       |
| NIS sudah terdaftar      | NIS duplicate      | Gunakan NIS lain         |
| Format email tidak valid | Email salah format | Contoh: user@example.com |
| Nama wajib diisi         | Kolom nama kosong  | Isi kolom nama           |

## 📊 Response

### Sukses (200)

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

### Sebagian Gagal (207)

```json
{
  "message": "Import completed with some errors",
  "stats": {
    "total": 50,
    "success": 45,
    "failed": 5
  },
  "errors": [...]
}
```

### Error (422)

```json
{
  "message": "Validation errors in Excel file",
  "errors": [...]
}
```

## 📚 Dokumentasi Lengkap

Lihat: `IMPORT_SISWA_FEATURE.md`

---

**Selamat mengimport! 🎉**
