# 🖼️ Panduan Gambar di DOCX Soal

## ✅ Fitur Support Gambar

Parser DOCX sekarang mendukung gambar di:

- ✅ **SOAL** - Gambar di pertanyaan
- ✅ **JAWABAN** - Gambar di pilihan jawaban (A, B, C, D, E)
- ✅ **KUNCI JAWABAN** - Gambar di jawaban essay

## 📝 Cara Menggunakan

### 1. Insert Gambar di Word

1. Buka file DOCX Anda di Microsoft Word
2. Letakkan cursor di bagian yang ingin diberi gambar
3. **Insert → Pictures → This Device**
4. Pilih gambar dari komputer Anda
5. (Opsional) Resize gambar agar tidak terlalu besar

### 2. Format yang Benar

```
[NOMOR 1]
JENIS SOAL: PG
NILAI: 10
SOAL: Perhatikan gambar di bawah ini:
[GAMBAR AKAN MUNCUL DI SINI SAAT DI WORD]
Apakah nama bangun tersebut?
JAWABAN:
A. Segitiga
B. Persegi
C. Lingkaran
D. Trapesium
KUNCI JAWABAN: B
```

### 3. Contoh dengan Gambar di Pilihan Jawaban

```
[NOMOR 2]
JENIS SOAL: PG
NILAI: 15
SOAL: Manakah yang merupakan lambang negara Indonesia?
JAWABAN:
A. [GAMBAR BENDERA MERAH PUTIH]
B. [GAMBAR GARUDA PANCASILA]
C. [GAMBAR BENDERA USA]
D. [GAMBAR LAMBANG LAIN]
KUNCI JAWABAN: B
```

### 4. Contoh Essay dengan Gambar

```
[NOMOR 3]
JENIS SOAL: ESSAY
NILAI: 25
SOAL: Analisislah diagram berikut:
[GAMBAR DIAGRAM]
Jelaskan kesimpulan yang dapat Anda ambil.
KUNCI JAWABAN: Berdasarkan diagram, dapat disimpulkan bahwa...
[GAMBAR PENJELASAN JIKA PERLU]
```

## ⚙️ Teknis

### Format Gambar yang Didukung

- ✅ PNG
- ✅ JPEG/JPG
- ✅ GIF
- ✅ BMP

### Konversi Otomatis

Gambar akan otomatis dikonversi ke **base64 data URL** sehingga:

- ✅ Tidak perlu upload gambar terpisah
- ✅ Gambar embedded langsung di database
- ✅ Bisa ditampilkan di frontend tanpa server file

### Batasan

- ⚠️ **Ukuran file total** DOCX maksimal **10MB**
- ⚠️ Gambar terlalu besar akan memperlambat parsing
- 💡 **Rekomendasi**: Resize gambar ke ukuran wajar (max 800px width)

## 🔍 Troubleshooting

### Gambar Tidak Muncul?

1. ✅ Pastikan gambar di-**Insert** (bukan copy-paste)
2. ✅ Cek format gambar (PNG/JPG lebih aman)
3. ✅ Ukuran file total tidak melebihi 10MB
4. ✅ Gambar tidak rusak/corrupt

### Gambar Muncul di Posisi Salah?

- Pastikan gambar berada **di antara marker yang benar**:
  - Setelah `SOAL:` → gambar masuk ke soal
  - Setelah `A.` → gambar masuk ke pilihan A
  - Setelah `KUNCI JAWABAN:` → gambar masuk ke kunci jawaban

### Performance Issues?

Jika terlalu banyak gambar:

1. 📉 **Kompres gambar** terlebih dahulu (TinyPNG, etc)
2. 📦 **Batch upload** - pisah jadi beberapa file
3. 🎯 **Optimasi size** - gunakan resolusi yang cukup (tidak perlu HD)

## 📊 Best Practices

### 1. Prepare Gambar

```bash
# Resize gambar ke lebar maksimal 800px
# Kompres dengan quality 80-90%
# Format: PNG untuk diagram, JPG untuk foto
```

### 2. Struktur File

```
✅ GOOD:
[NOMOR 1]
JENIS SOAL: PG
NILAI: 10
SOAL: Lihat gambar:
[INSERT GAMBAR HERE]
Apa nama alat ini?
JAWABAN:
A. Palu
...

❌ BAD:
[NOMOR 1]
[INSERT GAMBAR BEFORE JENIS SOAL] ← Salah posisi!
JENIS SOAL: PG
...
```

### 3. Testing

1. ✅ Upload file dengan 1-2 soal dulu
2. ✅ Cek apakah gambar muncul dengan benar
3. ✅ Baru upload file lengkap

## 🚀 Update Log

**v2.0** (2025-11-06)

- ✅ Support gambar di SOAL
- ✅ Support gambar di JAWABAN (A-F)
- ✅ Support gambar di KUNCI JAWABAN
- ✅ Auto konversi ke base64
- ✅ Support PNG, JPG, GIF, BMP

---

**Happy Testing!** 🎉
