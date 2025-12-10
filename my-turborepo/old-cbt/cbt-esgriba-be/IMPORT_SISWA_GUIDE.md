# Panduan Import Data Siswa

## Fitur Import/Export Data Siswa

Sistem CBT Esgriba sekarang dilengkapi dengan fitur import dan export data siswa dalam format Excel, sama seperti fitur untuk Guru dan Mata Pelajaran.

## Cara Menggunakan

### 1. Download Template Excel

- Klik tombol **"Import"** pada halaman Kelola Siswa
- Klik tombol **"Template"** untuk download template Excel
- File template bernama: `template_import_siswa.xlsx`

### 2. Isi Data Siswa di Excel

Template memiliki kolom berikut:

| Kolom             | Deskripsi                        | Wajib/Optional                  | Contoh                     |
| ----------------- | -------------------------------- | ------------------------------- | -------------------------- |
| **nama**          | Nama lengkap siswa               | **Wajib**                       | Ahmad Rizki                |
| **email**         | Email siswa (harus unique)       | **Wajib**                       | ahmad.rizki@example.com    |
| **nisn**          | NISN siswa (format TEXT)         | Optional                        | 0012024001                 |
| **nis**           | NIS siswa (format TEXT)          | Optional                        | 0012024001                 |
| **jenis_kelamin** | L (Laki-laki) atau P (Perempuan) | Optional                        | L                          |
| **password**      | Password siswa                   | Optional (default: password123) | password123                |
| **kelas**         | Nama kelas lengkap               | Optional                        | X TEKNIK KOMPUTER JARINGAN |
| **jurusan**       | Nama jurusan                     | Optional                        | Teknik Komputer Jaringan   |
| **status**        | Status siswa                     | Optional (default: aktif)       | aktif                      |

### 3. Catatan Penting

#### NISN dan NIS

- **Kolom NISN dan NIS harus berformat TEXT** agar angka 0 di depan tidak hilang
- Template sudah diset format TEXT otomatis
- Awali dengan `00` jika diperlukan. Contoh: `0012024001`
- NISN/NIS harus unique (tidak boleh sama)

#### Auto-Create Kelas dan Jurusan

- Jika kelas belum ada, sistem akan **otomatis membuat kelas baru**
- Jika jurusan belum ada, sistem akan **otomatis membuat jurusan baru** dengan kode yang di-generate
- Contoh: "Teknik Komputer Jaringan" → kode: "TEK" atau "TEK1" jika conflict

#### Email dan Password

- Email harus unique (tidak boleh duplikat)
- Jika password tidak diisi, akan otomatis diisi: `password123`

#### Status

- Nilai yang diterima: `aktif`, `nonaktif`, `1`, `0`, `active`
- Default jika kosong: `aktif`

### 4. Import File Excel

- Klik tombol **"Import"** pada halaman Kelola Siswa
- Pilih file Excel yang sudah diisi
- Klik **"Import Sekarang"**
- Tunggu proses selesai

### 5. Hasil Import

Sistem akan menampilkan:

- ✅ **Berhasil**: Jumlah siswa yang berhasil diimport
- ❌ **Gagal**: Jumlah siswa yang gagal (jika ada)
- 📋 **Detail Error**: Daftar error per baris (jika ada)

### 6. Export Data Siswa

Untuk export data siswa yang sudah ada:

- Klik tombol **Export** (icon download hijau)
- File akan terdownload dengan nama: `data_siswa_YYYY-MM-DD.xlsx`
- File berisi semua data siswa dalam format yang sama dengan template

## Contoh Data

Berikut contoh data yang bisa diimport:

```
nama                | email                      | nisn        | nis         | jenis_kelamin | password     | kelas                          | jurusan                      | status
-------------------|----------------------------|-------------|-------------|---------------|--------------|--------------------------------|------------------------------|--------
Ahmad Rizki        | ahmad.rizki@example.com    | 0012024001  | 0012024001  | L             | password123  | X TEKNIK KOMPUTER JARINGAN     | Teknik Komputer Jaringan     | aktif
Siti Nurhaliza     | siti.nur@example.com       | 0012024002  | 0012024002  | P             | password123  | X TEKNIK KENDARAAN RINGAN      | Teknik Kendaraan Ringan      | aktif
Budi Santoso       | budi.santoso@example.com   | 0012024003  | 0012024003  | L             | password123  | XI AKUNTANSI                   | Akuntansi                    | aktif
```

## Troubleshooting

### Error: "Email sudah terdaftar"

- Pastikan email di Excel unique (tidak ada duplikat)
- Cek database, mungkin email sudah terdaftar sebelumnya

### Error: "NISN sudah terdaftar"

- NISN harus unique per siswa
- Cek database untuk NISN yang sama

### NISN/NIS berubah menjadi angka scientific (1.20240E+09)

- Pastikan kolom NISN/NIS di Excel **sudah format TEXT**
- Awali dengan `00` atau format manual ke TEXT sebelum input angka

### Kelas atau Jurusan tidak sesuai

- Sistem akan auto-create kelas/jurusan baru jika tidak ada
- Periksa ejaan nama kelas/jurusan di Excel
- Gunakan nama yang konsisten

## API Endpoints

Backend menyediakan endpoint berikut:

- `GET /api/students/template` - Download template
- `POST /api/students/import` - Import data (multipart/form-data)
- `GET /api/students/export` - Export data siswa

## Fitur Tambahan

✅ **Skip Empty Rows**: Baris kosong otomatis diabaikan
✅ **Batch Insert**: Import cepat (100 rows per batch)
✅ **Validation**: Validasi real-time per row
✅ **Auto-Generate**: Password, kelas, jurusan otomatis dibuat
✅ **Error Handling**: Detail error per baris untuk debugging
✅ **Partial Success**: Jika ada error, data yang valid tetap tersimpan

---

**Update**: November 2025  
Fitur import/export siswa sudah tersedia dan siap digunakan! 🎉
