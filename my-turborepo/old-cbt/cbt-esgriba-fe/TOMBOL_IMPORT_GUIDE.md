# 🎯 Quick Reference - Tombol Import Data Siswa

## 📍 Lokasi Tombol di UI

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  CBT System - Data Siswa                                    👤 Administrator       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  ┌────────┐  ┌────────┐ │
│  │ 🟠 Tambah    │  │ 🟢 Import    │  │ 🔵 Download      │  │ Kelas  │  │ Status │ │
│  │   Siswa      │  │   Excel      │  │   Template       │  │   ▼    │  │   ▼    │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘  └────────┘  └────────┘ │
│                                                                                     │
│                                                    ┌──────────┐ 🖨️  🟢⬇️           │
│                                                    │  Search  │                    │
│                                                    └──────────┘                    │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Tombol-tombol Baru

### 1. 🟢 **Import Excel** (Tombol Hijau)

```
Warna: Hijau (bg-green-600)
Icon: Upload ⬆️
Posisi: Setelah "Tambah Siswa"
Fungsi: Buka dialog import
```

**Klik → Muncul Dialog:**

```
┌─────────────────────────────────────┐
│ 📤 Import Data Siswa dari Excel    │
├─────────────────────────────────────┤
│                                     │
│ Pilih File Excel                    │
│ [Browse...] [Template]              │
│                                     │
│ 📋 Format Data:                     │
│ • nama, email, nis, password...     │
│                                     │
│              [Batal] [Import]       │
└─────────────────────────────────────┘
```

---

### 2. 🔵 **Download Template** (Tombol Biru Outline)

```
Warna: Biru outline (border-blue-500)
Icon: FileSpreadsheet 📊
Posisi: Setelah "Import Excel"
Fungsi: Download template.xlsx langsung
```

**Klik → Download File:**

```
📥 template_import_siswa.xlsx
✅ Template berhasil didownload
```

---

### 3. 🟢 **Export** (Icon Hijau)

```
Warna: Hijau outline (border-green-600)
Icon: Download ⬇️
Posisi: Pojok kanan, setelah icon Printer
Fungsi: Export data siswa ke Excel
```

**Klik → Download File:**

```
📥 data_siswa_2025-11-04.xlsx
✅ Data siswa berhasil diexport
```

---

## 🔄 Cara Menggunakan

### Method 1: Import Manual (Per Siswa)

```
1. Klik "🟠 Tambah Siswa"
2. Isi form manual
3. Klik "Simpan"
```

**Best for:** 1-5 siswa

---

### Method 2: Import Excel (Bulk)

```
1. Klik "🔵 Download Template"
   → Download template.xlsx

2. Buka Excel, isi data:
   nama | email | nis | password | kelas | jurusan | status

3. Save file

4. Klik "🟢 Import Excel"

5. Pilih file → Klik "Import Sekarang"

6. Tunggu proses (loading...)

7. Lihat hasil:
   ✅ Berhasil: 50 siswa
   ✗ Gagal: 0 siswa

8. Selesai! Data otomatis muncul di tabel
```

**Best for:** 10+ siswa

---

### Method 3: Export Data (Backup/Laporan)

```
1. (Optional) Pilih filter kelas

2. Klik icon "🟢⬇️" (Download hijau)

3. File otomatis download

4. Buka Excel untuk lihat data
```

**Best for:** Backup, laporan, atau edit bulk

---

## 📊 Format Template Excel

### Kolom Wajib:

- ✅ **nama** - Nama lengkap siswa
- ✅ **email** - Email unique

### Kolom Optional:

- ⚪ **nis** - Nomor Induk (unique)
- ⚪ **password** - Password (default: password123)
- ⚪ **kelas** - X MIPA 1, XI IPS 2, dst
- ⚪ **jurusan** - IPA, IPS, Bahasa
- ⚪ **status** - aktif/nonaktif

### Contoh Data:

```
| nama           | email              | nis     | password    | kelas    | jurusan | status |
|----------------|--------------------|---------|-------------|----------|---------|--------|
| Ahmad Rizki    | ahmad@sekolah.com  | 2024001 | pass123     | X MIPA 1 | IPA     | aktif  |
| Siti Nur       | siti@sekolah.com   | 2024002 | pass123     | X MIPA 2 | IPA     | aktif  |
```

---

## ⚡ Quick Tips

### ✅ DO's

- ✅ Download template dulu sebelum import
- ✅ Isi minimal **nama** dan **email**
- ✅ Pastikan email & NIS tidak duplikat
- ✅ Test dengan 5-10 data dulu
- ✅ Backup data sebelum import besar

### ❌ DON'Ts

- ❌ Jangan kosongkan kolom nama & email
- ❌ Jangan pakai email yang sudah ada
- ❌ Jangan upload file > 2MB
- ❌ Jangan lupa save Excel sebelum upload

---

## 🎯 Workflow Recommended

### Untuk Admin Baru:

```
1️⃣ Download Template
2️⃣ Isi 3-5 siswa sebagai test
3️⃣ Import test data
4️⃣ Cek hasilnya di tabel
5️⃣ Kalau OK, isi data lengkap
6️⃣ Import data lengkap
7️⃣ Export sebagai backup
```

### Untuk Import Rutin:

```
1️⃣ Export data existing (backup)
2️⃣ Buka template baru
3️⃣ Isi data siswa baru
4️⃣ Import data baru
5️⃣ Verifikasi di tabel
```

---

## 📱 Responsive Design

### Desktop View:

```
[Tambah] [Import] [Template] [Kelas▼] [Status▼]     [Search] 🖨️ ⬇️
```

### Mobile View (Stack):

```
[Tambah Siswa]
[Import Excel]
[Download Template]
[Kelas ▼]
[Status ▼]
[Search Box]
[🖨️] [⬇️]
```

---

## 🔔 Notifications (Toast)

### Success Messages:

- ✅ "Template berhasil didownload"
- ✅ "50 siswa berhasil diimport"
- ✅ "Data siswa berhasil diexport"

### Error Messages:

- ❌ "Gagal download template"
- ❌ "Silakan pilih file terlebih dahulu"
- ❌ "Email sudah terdaftar" (dari backend)

---

## 🎨 Visual Guide

### Tombol States:

**Normal:**

```
┌──────────────┐
│ 🟢 Import    │  ← Hijau solid
│   Excel      │
└──────────────┘
```

**Hover:**

```
┌──────────────┐
│ 🟢 Import    │  ← Hijau lebih gelap
│   Excel      │
└──────────────┘
```

**Loading:**

```
┌──────────────┐
│ ⏳ Import    │  ← Disabled + spinner
│   Excel      │
└──────────────┘
```

---

## 📞 Support

Jika ada masalah:

1. Cek console browser (F12)
2. Cek network tab untuk API error
3. Lihat toast notification
4. Baca error message di dialog
5. Cek file `storage/logs/laravel.log` di backend

---

**Ready to use! 🚀**

Silakan coba:

1. Klik **Download Template** → Test download
2. Klik **Import Excel** → Test dialog
3. Klik **Export** → Test export

_Happy Importing! 🎉_
