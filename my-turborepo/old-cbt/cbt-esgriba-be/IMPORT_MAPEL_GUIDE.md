# Fitur Import Mata Pelajaran

## Cara Penggunaan

### Download Template

1. Buka halaman **Kelola Mata Pelajaran** di admin
2. Klik tombol **Import** → **Template**
3. File `template_import_mapel.xlsx` akan terdownload

### Format Excel

Template memiliki 3 kolom:

- **nama** - Nama mata pelajaran (wajib diisi)
- **kode** - Kode mapel uppercase (wajib, harus unique). Contoh: MAT, BIND, FIS
- **deskripsi** - Keterangan mata pelajaran (opsional)

### Contoh Data

```
| nama              | kode | deskripsi                                     |
|-------------------|------|-----------------------------------------------|
| Matematika        | MAT  | Mata pelajaran matematika untuk semua tingkat |
| Bahasa Indonesia  | BIND | Mata pelajaran bahasa Indonesia               |
| Bahasa Inggris    | BING | Mata pelajaran bahasa Inggris                 |
| Fisika            | FIS  | Mata pelajaran fisika                         |
| Kimia             | KIM  | Mata pelajaran kimia                          |
```

### Import Data

1. Isi template Excel dengan data mata pelajaran
2. Klik tombol **Import** di halaman Kelola Mata Pelajaran
3. Pilih file Excel yang sudah diisi
4. Klik **Import Sekarang**
5. Sistem akan menampilkan hasil import (sukses/gagal)

### Export Data

- Klik tombol **Export** untuk download data mata pelajaran yang sudah ada
- File akan tersimpan dengan nama `data_mapel_YYYY-MM-DD.xlsx`

## Fitur Khusus

### Auto-generate Kode

Jika kolom **kode** kosong, sistem akan otomatis generate dari nama:

- "Matematika" → "MAT"
- "Bahasa Indonesia" → "BIND" (ambil 2 huruf pertama tiap kata)
- "Fisika" → "FIS"

Jika kode sudah ada (duplicate), sistem akan tambahkan angka: MAT1, MAT2, dst.

### Header Alternatif

Sistem mendukung berbagai variasi nama kolom:

- **nama**: nama, name, mata_pelajaran, mapel, subject_name, nama_mapel
- **kode**: kode, code, kode_mapel, subject_code
- **deskripsi**: deskripsi, description, desc, keterangan

### Skip Baris Kosong

Baris yang semua kolomnya kosong akan otomatis di-skip (tidak error).

## Validasi

### Wajib Diisi

- Nama mata pelajaran
- Kode mata pelajaran

### Aturan

- Kode harus unique (tidak boleh duplikat)
- Kode otomatis diubah ke uppercase
- Maksimal 255 karakter untuk nama
- Maksimal 50 karakter untuk kode

## Error Handling

Jika ada error saat import:

- Sistem akan menampilkan detail error per baris
- Data yang valid tetap akan tersimpan
- Data yang error akan di-skip
- Summary menampilkan jumlah sukses dan gagal

## API Endpoints

### Backend Routes

```php
GET  /api/subjects/template  - Download template Excel
POST /api/subjects/import    - Import data dari Excel
GET  /api/subjects/export    - Export data ke Excel
```

### Request Format (Import)

```
POST /api/subjects/import
Content-Type: multipart/form-data

file: [Excel file .xlsx/.xls]
```

### Response Format

```json
{
  "message": "Import completed successfully",
  "stats": {
    "total": 5,
    "success": 5,
    "failed": 0
  }
}
```

Jika ada error:

```json
{
  "message": "Import completed with some errors",
  "stats": {
    "total": 5,
    "success": 3,
    "failed": 2
  },
  "errors": [
    {
      "row": 4,
      "attribute": "kode",
      "errors": ["Kode mata pelajaran sudah terdaftar"]
    }
  ]
}
```
