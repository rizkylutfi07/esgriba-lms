# 🧪 Testing Guide: DOCX dengan Gambar

## Quick Test

### 1. Buat File Test Sederhana

1. **Buka Microsoft Word**
2. **Copy text berikut:**

```
[NOMOR 1]
JENIS SOAL: PG
NILAI: 10
SOAL: Berapakah hasil 2 + 2?
JAWABAN:
A. 3
B. 4
C. 5
D. 6
KUNCI JAWABAN: B

[NOMOR 2]
JENIS SOAL: PG
NILAI: 15
SOAL: Perhatikan gambar berikut:

Apa warna logo di atas?
JAWABAN:
A. Merah
B. Biru
C. Hijau
D. Kuning
KUNCI JAWABAN: B
```

3. **Di baris kosong setelah "gambar berikut:"**

   - Klik **Insert → Pictures → This Device**
   - Pilih gambar sederhana (logo, icon, dll)
   - Resize jika terlalu besar

4. **Save as** `test_dengan_gambar.docx`

### 2. Upload & Parse

1. Login ke sistem sebagai **Guru**
2. Buka **Paket Soal** → pilih salah satu paket
3. Klik **Import Soal**
4. Upload file `test_dengan_gambar.docx`
5. Klik **Parse File**

### 3. Expected Result

✅ **Console Browser akan menampilkan:**

```
=== SERVER PARSING COMPLETE ===
Total questions: 2
Valid: 2, Invalid: 0
```

✅ **Preview akan menunjukkan:**

- Soal 1: Text biasa
- Soal 2: Text + gambar (thumbnail kecil)

✅ **Data struktur:**

```json
{
  "question_text": "Perhatikan gambar berikut: <img src=\"data:image/png;base64,...\" /> Apa warna logo di atas?",
  "option_a": "Merah",
  "option_b": "Biru",
  ...
}
```

## Advanced Test: Multiple Images

### Test Case 1: Gambar di Setiap Pilihan Jawaban

```
[NOMOR 1]
JENIS SOAL: PG
NILAI: 20
SOAL: Manakah yang merupakan segitiga?
JAWABAN:
A. [Insert gambar lingkaran]
B. [Insert gambar segitiga]
C. [Insert gambar persegi]
D. [Insert gambar trapesium]
KUNCI JAWABAN: B
```

### Test Case 2: Essay dengan Gambar di Soal dan Jawaban

```
[NOMOR 2]
JENIS SOAL: ESSAY
NILAI: 30
SOAL: Analisislah diagram berikut:
[Insert diagram/chart]
Apa kesimpulan yang dapat Anda ambil?
KUNCI JAWABAN: Berdasarkan diagram di atas, terlihat bahwa...
[Insert gambar penjelasan]
Sehingga dapat disimpulkan...
```

## Troubleshooting

### ❌ "Tidak ditemukan soal pada file DOCX"

**Penyebab:**

- Format `[NOMOR x]` salah atau tidak ada
- File kosong atau rusak

**Solusi:**

- Cek marker `[NOMOR 1]`, `[NOMOR 2]`, dll harus ada
- Pastikan ada `JENIS SOAL:`, `NILAI:`, dll

### ❌ Gambar tidak muncul di preview

**Penyebab:**

- Gambar tidak ter-embed dengan benar
- Format gambar tidak didukung

**Solusi:**

- Jangan copy-paste gambar, gunakan **Insert → Pictures**
- Gunakan format PNG atau JPG
- Cek size gambar tidak terlalu besar (>2MB per image)

### ❌ Parsing sangat lambat

**Penyebab:**

- File terlalu besar
- Terlalu banyak gambar beresolusi tinggi

**Solusi:**

- Kompres gambar sebelum insert
- Batch upload (pisah jadi beberapa file)
- Resize gambar ke max 800px width

### ❌ Error 500 di server

**Penyebab:**

- File corrupt
- Memory limit exceeded
- Permission issue

**Solusi:**

```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Increase PHP memory limit if needed
# In .env or php.ini
memory_limit = 256M
```

## Verification Checklist

Setelah upload, pastikan:

- [ ] Total soal sesuai (misal: 2 soal)
- [ ] Valid count benar (semua valid jika format benar)
- [ ] Preview menampilkan gambar (thumbnail kecil)
- [ ] Saat import berhasil, tidak ada error
- [ ] Soal muncul di list paket soal
- [ ] Gambar muncul saat siswa preview soal

## Performance Benchmark

**Test dengan:**

- 10 soal tanpa gambar: ~1 detik
- 10 soal dengan 1 gambar/soal (100KB): ~2-3 detik
- 10 soal dengan 1 gambar/soal (500KB): ~5-7 detik
- 25 soal dengan mixed images: ~10-15 detik

**Rekomendasi:**

- Keep images < 200KB per image
- Max 20 soal per file untuk optimal UX
- Use batch upload untuk file besar

---

**Ready to test?** Go ahead and create your first DOCX with images! 🚀
