# 📚 Panduan Import Data Siswa

## 📋 Format Template Excel

Template import siswa memiliki 7 kolom berikut:

| Kolom        | Wajib    | Tipe Data | Contoh            | Keterangan                              |
| ------------ | -------- | --------- | ----------------- | --------------------------------------- |
| **nama**     | ✅ Ya    | Text      | Ahmad Rizki       | Nama lengkap siswa                      |
| **email**    | ✅ Ya    | Email     | ahmad@example.com | Email unik (tidak boleh duplikat)       |
| **nis**      | ❌ Tidak | Text      | 0012024001        | NIS siswa (harus TEXT, lihat catatan)   |
| **password** | ❌ Tidak | Text      | password123       | Password login (default: password123)   |
| **kelas**    | ❌ Tidak | Text      | X MIPA 1          | Nama kelas                              |
| **jurusan**  | ❌ Tidak | Text      | IPA               | Nama jurusan                            |
| **status**   | ❌ Tidak | Text      | aktif             | Status: aktif/nonaktif (default: aktif) |

---

## ⚠️ PENTING: Format Kolom NIS

### Masalah Umum

Excel sering mengkonversi angka NIS menjadi tipe NUMBER, yang menyebabkan error validasi: **"nis must be a string"**

### ✅ Solusi (Pilih salah satu):

#### **Cara 1: Prefix dengan 00 (Recommended)**

```
0012024001
0012024002
0012024003
```

- Awali NIS dengan `00` sehingga Excel memperlakukannya sebagai TEXT
- Sistem akan otomatis menyimpan sebagai string

#### **Cara 2: Gunakan Tanda Petik (apostrophe)**

```
'2024001
'2024002
'2024003
```

- Ketik tanda petik `'` sebelum angka NIS
- Tanda petik tidak akan tersimpan, hanya memaksa Excel menyimpan sebagai TEXT

#### **Cara 3: Format Kolom sebagai TEXT**

1. Select seluruh kolom NIS (kolom C)
2. Klik kanan → Format Cells
3. Pilih kategori **Text**
4. Klik OK
5. Ketik ulang data NIS

---

## 📝 Contoh Data yang Benar

| nama           | email                    | nis        | password    | kelas    | jurusan | status |
| -------------- | ------------------------ | ---------- | ----------- | -------- | ------- | ------ |
| Ahmad Rizki    | ahmad.rizki@example.com  | 0012024001 | password123 | X MIPA 1 | IPA     | aktif  |
| Siti Nurhaliza | siti.nur@example.com     | 0012024002 | password123 | X MIPA 2 | IPA     | aktif  |
| Budi Santoso   | budi.santoso@example.com | 0012024003 | password123 | X IPS 1  | IPS     | aktif  |

---

## ❌ Contoh Data yang SALAH

### Salah 1: NIS sebagai Number

```
❌ 2024001  (Excel akan simpan sebagai number, error validasi)
✅ 0012024001  (Disimpan sebagai text, berhasil)
```

### Salah 2: Email Duplikat

```
❌ Baris 1: ahmad@example.com
   Baris 5: ahmad@example.com  (Error: Email sudah terdaftar)
```

### Salah 3: NIS Duplikat

```
❌ Baris 1: 0012024001
   Baris 3: 0012024001  (Error: NIS sudah terdaftar)
```

### Salah 4: Email Tidak Valid

```
❌ ahmad.com  (Error: Format email tidak valid)
✅ ahmad@example.com
```

---

## 🔄 Langkah-langkah Import

1. **Download Template**

   - Klik tombol "Template Import" di halaman Manajemen Siswa
   - Template sudah berisi contoh data dan formatting yang benar

2. **Isi Data**

   - Buka template di Excel/LibreOffice
   - Hapus baris contoh (baris 2-4)
   - Isi data siswa baru
   - **Pastikan NIS diawali dengan 00 atau tanda petik**

3. **Simpan File**

   - Save as Excel (.xlsx atau .xls)
   - Jangan ubah nama atau urutan kolom header

4. **Upload File**

   - Klik tombol "Import Siswa"
   - Pilih file Excel yang sudah diisi
   - Klik "Import Sekarang"

5. **Cek Hasil**
   - Lihat statistik import (Berhasil/Gagal)
   - Jika ada error, perbaiki file Excel sesuai pesan error
   - Import ulang file yang sudah diperbaiki

---

## 🐛 Troubleshooting

### Error: "nis must be a string"

**Penyebab:** Excel menyimpan NIS sebagai NUMBER bukan TEXT

**Solusi:**

- Gunakan Cara 1, 2, atau 3 di atas
- Re-download template baru (sudah ada formatting TEXT otomatis)
- Copy-paste data, pastikan format kolom NIS adalah TEXT

### Error: "Email sudah terdaftar"

**Penyebab:** Email duplikat dalam database atau dalam file Excel

**Solusi:**

- Gunakan email yang berbeda untuk setiap siswa
- Cek database existing students
- Hapus baris duplikat di Excel

### Error: "NIS sudah terdaftar"

**Penyebab:** NIS duplikat dalam database atau dalam file Excel

**Solusi:**

- Gunakan NIS unik untuk setiap siswa
- Cek database existing students
- Hapus atau ubah NIS yang duplikat

### Error: "Nama siswa wajib diisi"

**Penyebab:** Kolom nama kosong

**Solusi:**

- Pastikan setiap baris memiliki nama siswa
- Hapus baris kosong di tengah data

---

## 💡 Tips

1. **Selalu gunakan template terbaru** - Template sudah diformat dengan benar
2. **Jangan ubah header kolom** - Sistem membaca berdasarkan nama kolom
3. **Cek data sebelum import** - Pastikan tidak ada duplikat email/NIS
4. **Import bertahap** - Untuk data banyak, import per kelas untuk mudah tracking error
5. **Backup data** - Simpan file Excel sebagai backup sebelum import
6. **Test dengan 2-3 baris** - Test dulu dengan data kecil sebelum import massal

---

## 📞 Bantuan

Jika masih mengalami kendala:

1. Cek kembali format data sesuai panduan di atas
2. Download ulang template dan coba lagi
3. Hubungi administrator sistem

---

**Last Updated:** November 4, 2025
