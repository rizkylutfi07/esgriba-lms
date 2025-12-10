# 📥 Import Data Siswa - Frontend UI Guide

## 🎨 UI Components yang Ditambahkan

### 1. **Tombol "Import Excel"** (Hijau)

- Lokasi: Di sebelah tombol "Tambah Siswa"
- Warna: Hijau (`bg-green-600`)
- Icon: Upload
- Fungsi: Membuka dialog import

### 2. **Tombol "Download Template"** (Biru outline)

- Lokasi: Di sebelah tombol "Import Excel"
- Warna: Biru outline
- Icon: FileSpreadsheet
- Fungsi: Download template Excel langsung

### 3. **Tombol Export** (Icon Download - Hijau)

- Lokasi: Di pojok kanan atas, sebelah icon Printer
- Warna: Hijau outline
- Icon: Download
- Fungsi: Export data siswa ke Excel (dengan filter jika ada)

---

## 🪟 Import Dialog

### Fitur Dialog:

✅ File picker untuk .xlsx dan .xls
✅ Tombol quick download template
✅ Instruksi format data Excel
✅ Progress indicator saat importing
✅ Hasil import dengan statistik
✅ Detail error jika ada yang gagal
✅ Auto-close setelah 3 detik jika sukses semua

### Layout Dialog:

```
┌─────────────────────────────────────────────┐
│ 📤 Import Data Siswa dari Excel            │
├─────────────────────────────────────────────┤
│                                             │
│ Pilih File Excel                            │
│ [File Input] [Template]                     │
│ ✓ File dipilih: data.xlsx                   │
│                                             │
│ ┌───────────────────────────────────────┐  │
│ │ 📋 Format Data Excel:                  │  │
│ │ • nama - Wajib diisi                   │  │
│ │ • email - Wajib, unique                │  │
│ │ • nis - Optional, unique               │  │
│ │ • password - Optional (default)        │  │
│ │ • kelas - Optional, auto-create        │  │
│ │ • jurusan - Optional, auto-create      │  │
│ │ • status - Optional (aktif/nonaktif)   │  │
│ └───────────────────────────────────────┘  │
│                                             │
│ ┌───────────────────────────────────────┐  │
│ │ ✅ Import Berhasil!                    │  │
│ │ ✓ Berhasil: 50 siswa                   │  │
│ │ ✗ Gagal: 0 siswa                       │  │
│ └───────────────────────────────────────┘  │
│                                             │
│                         [Batal] [Import]   │
└─────────────────────────────────────────────┘
```

---

## 📊 Response Handling

### Success (All Imported)

```tsx
{
  "stats": {
    "success": 50,
    "failed": 0
  }
}
```

- Background: Hijau
- Auto-close: 3 detik
- Toast: Success message

### Partial Success (Some Errors)

```tsx
{
  "stats": {
    "success": 45,
    "failed": 5
  },
  "errors": [
    {
      "row": { "nama": "Ahmad", "email": "test@mail.com" },
      "error": "Email sudah terdaftar"
    }
  ]
}
```

- Background: Kuning (warning)
- Tampilkan detail error (max 5 pertama)
- Dialog tetap terbuka untuk review error

### Failed (Validation Error)

```tsx
{
  "message": "Validation errors in Excel file",
  "errors": [...]
}
```

- Background: Merah
- Tampilkan error message
- Toast: Error variant

---

## 🎯 User Flow

### Flow Import:

```
1. User klik "Import Excel"
   ↓
2. Dialog terbuka
   ↓
3. User klik "Template" (optional)
   → Download template.xlsx
   ↓
4. User isi data di Excel
   ↓
5. User pilih file
   → File name ditampilkan dengan ✓
   ↓
6. User klik "Import Sekarang"
   → Loading spinner muncul
   → Button disabled
   ↓
7. Import process
   → Backend API call
   ↓
8. Show Result:
   ├─ Semua sukses → Green box, auto close 3s
   ├─ Sebagian gagal → Yellow box, show errors
   └─ Semua gagal → Red box, show errors
   ↓
9. Data siswa di-refresh otomatis
   ↓
10. User tutup dialog atau auto-close
```

### Flow Export:

```
1. User (optional) pilih filter kelas
   ↓
2. User klik icon Download (hijau)
   ↓
3. File otomatis download
   → Filename: data_siswa_YYYY-MM-DD.xlsx
   ↓
4. Toast: Success message
```

### Flow Download Template:

```
1. User klik "Download Template" (biru)
   ↓
2. File otomatis download
   → Filename: template_import_siswa.xlsx
   ↓
3. Toast: Success message
```

---

## 🎨 Styling

### Colors Used:

- **Import Button**: `bg-green-600 hover:bg-green-700` (Hijau)
- **Template Button**: `border-blue-500 text-blue-600 hover:bg-blue-50` (Biru outline)
- **Export Icon**: `text-green-600 border-green-600 hover:bg-green-50` (Hijau outline)
- **Success Box**: `bg-green-50 border-green-200` (Hijau muda)
- **Warning Box**: `bg-yellow-50 border-yellow-200` (Kuning muda)
- **Error Box**: `bg-red-50 border-red-200` (Merah muda)
- **Info Box**: `bg-blue-50 border-blue-200` (Biru muda)

### Icons Used:

- **Upload**: Import action
- **FileSpreadsheet**: Template download
- **Download**: Export action
- **Spinner**: Loading state

---

## 📱 Responsive Design

Dialog menggunakan `sm:max-w-[600px]` untuk:

- Mobile: Full width dengan padding
- Desktop: Max 600px centered

---

## 🔒 Security & Validation

### Frontend Validation:

- ✅ File type check: `.xlsx`, `.xls` only
- ✅ File required before submit
- ✅ Disable buttons saat loading
- ✅ Clear state on close

### Backend Validation:

- ✅ File size max 2MB
- ✅ Email format & uniqueness
- ✅ NIS uniqueness
- ✅ Required fields check

---

## 🐛 Error Handling

### File Not Selected:

```tsx
toast({
  title: "Error",
  description: "Silakan pilih file Excel terlebih dahulu",
  variant: "destructive",
});
```

### Import Error:

```tsx
toast({
  title: "Error",
  description: errorData?.message || "Gagal mengimport data",
  variant: "destructive",
});
```

### Network Error:

Auto-handled oleh try-catch dengan generic error message

---

## ✨ Features Summary

### Import Features:

✅ Drag & drop file (native HTML input)
✅ File validation (.xlsx, .xls)
✅ Progress indicator
✅ Detailed result statistics
✅ Error reporting (first 5 shown)
✅ Auto-refresh data after import
✅ Auto-close on full success

### Export Features:

✅ Filter by class support
✅ Auto-generate filename with date
✅ Instant download
✅ Toast notification

### Template Features:

✅ One-click download
✅ Pre-formatted Excel
✅ Sample data included
✅ Ready to use

---

## 📸 Screenshots Locations

Tombol-tombol terletak di:

```
[Tambah Siswa] [Import Excel] [Download Template] [Filter Kelas ▼] [Status ▼] ... [🔍 Search] [🖨️] [⬇️]
```

---

## 🚀 Next Steps (Optional Enhancements)

Future improvements:

- [ ] Drag & drop file upload
- [ ] Preview data before import
- [ ] Progress bar (percentage)
- [ ] Import history log
- [ ] Undo import functionality
- [ ] Bulk edit imported data
- [ ] Email notification after import
- [ ] Schedule imports

---

**Status: ✅ COMPLETE & READY TO USE**

UI sudah lengkap dengan 3 tombol baru:

1. **Import Excel** - Upload & import data siswa
2. **Download Template** - Download template kosong
3. **Export** (icon) - Export data siswa existing

Semua terintegrasi dengan backend API yang sudah dibuat!

_Last Updated: 4 November 2025_
