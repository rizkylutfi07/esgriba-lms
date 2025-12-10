# 📥 Import Data Siswa - Quick Reference

## 🚀 Quick Start (3 Langkah)

### 1️⃣ Download Template

```bash
GET /api/students/template
```

Download file Excel dengan format yang sudah ditentukan.

### 2️⃣ Isi Data

Buka Excel, isi data siswa:

- **nama** ✅ (wajib)
- **email** ✅ (wajib, unique)
- **nis** (optional, unique)
- **password** (optional, default: password123)
- **kelas** (optional, auto-create)
- **jurusan** (optional, auto-create)
- **status** (optional, default: aktif)

### 3️⃣ Upload

```bash
POST /api/students/import
Body: file=[your-excel-file]
```

Done! ✅

---

## 📋 Template Excel Format

```
┌──────────────┬─────────────────────────┬─────────┬─────────────┬──────────┬─────────┬────────┐
│ nama         │ email                   │ nis     │ password    │ kelas    │ jurusan │ status │
├──────────────┼─────────────────────────┼─────────┼─────────────┼──────────┼─────────┼────────┤
│ Ahmad Rizki  │ ahmad.rizki@example.com │ 2024001 │ password123 │ X MIPA 1 │ IPA     │ aktif  │
│ Siti Nur     │ siti.nur@example.com    │ 2024002 │ password123 │ X MIPA 2 │ IPA     │ aktif  │
└──────────────┴─────────────────────────┴─────────┴─────────────┴──────────┴─────────┴────────┘
```

---

## 🔌 API Endpoints

| Method | Endpoint                 | Description             |
| ------ | ------------------------ | ----------------------- |
| GET    | `/api/students/template` | Download template Excel |
| POST   | `/api/students/import`   | Import siswa dari Excel |
| GET    | `/api/students/export`   | Export siswa ke Excel   |

**Auth:** Admin only (Bearer token required)

---

## ✅ Success Response

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

---

## ❌ Error Response

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
      "row": { "nama": "Test", "email": "test@mail.com" },
      "error": "Email sudah terdaftar"
    }
  ]
}
```

---

## 📚 Dokumentasi Lengkap

| File                          | Deskripsi                            |
| ----------------------------- | ------------------------------------ |
| **IMPORT_SISWA_FEATURE.md**   | 📖 Dokumentasi teknis lengkap        |
| **PANDUAN_IMPORT_SISWA.md**   | 👤 Panduan user friendly untuk admin |
| **TEMPLATE_IMPORT_README.md** | 📝 Panduan format template           |
| **IMPLEMENTATION_SUMMARY.md** | 🔧 Summary implementasi teknis       |
| **API_DOCUMENTATION.md**      | 🔌 API endpoints (Section 7.6-7.8)   |

---

## 🐛 Common Issues

| Error                    | Solution                |
| ------------------------ | ----------------------- |
| Email sudah terdaftar    | Gunakan email lain      |
| NIS sudah terdaftar      | Gunakan NIS lain        |
| Format email tidak valid | Format: user@domain.com |
| File too large           | Max 2MB, ~1000 rows     |

---

## 💡 Tips

✅ Test dengan 5-10 rows dulu
✅ Backup database sebelum import besar
✅ Cek email & NIS tidak duplicate
✅ Hapus baris contoh di template
✅ Format: .xlsx atau .xls

---

## 📞 Need Help?

1. Baca dokumentasi lengkap
2. Check `storage/logs/laravel.log`
3. Hubungi admin system

---

**Version:** 1.0.0 | **Last Updated:** 4 Nov 2025
