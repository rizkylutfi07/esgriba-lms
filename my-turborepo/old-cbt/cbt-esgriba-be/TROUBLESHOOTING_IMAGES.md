# 🔧 Troubleshooting: Gambar Tidak Muncul

## Diagnosa Problem

### Step 1: Check Console Browser

Upload file DOCX dan check console untuk:

```
=== IMAGE CHECK ===
Question 1: {
  hasImageInQuestion: true/false,
  hasImageInOptions: true/false,
  questionPreview: "..."
}
```

### Step 2: Check Debug Info

```
=== SERVER DEBUG INFO ===
Element types found: { ... }
images_extracted: 0 or > 0
```

## Kemungkinan Penyebab

### 1. ❌ Gambar Tidak Ter-Extract di Backend

**Gejala:**

- `images_extracted: 0` di console
- `hasImageInQuestion: false` dan `hasImageInOptions: false`

**Penyebab:**

- Gambar tidak di-insert dengan benar di Word
- Format gambar tidak didukung
- Gambar corrupt/rusak

**Solusi:**

1. **Verifikasi Insert:**

   - Jangan copy-paste gambar
   - Gunakan **Insert → Pictures → This Device**
   - Pastikan gambar ter-embed (bukan link)

2. **Test dengan gambar simple:**

   - Gunakan PNG atau JPG
   - Ukuran < 500KB
   - Resolusi wajar (< 800px width)

3. **Check Laravel log:**
   ```bash
   tail -f storage/logs/laravel.log
   ```
   Cari pesan: "Image found and extracted" atau error message

### 2. ❌ Gambar Ter-Extract tapi Tidak Render di Frontend

**Gejala:**

- `images_extracted: > 0` di console
- `hasImageInQuestion: true`
- Tapi gambar tidak tampil di preview

**Penyebab:**

- Base64 string terlalu panjang di-truncate
- Browser security policy
- MathContent component issue

**Solusi:**

1. **Check question_text di console:**

   ```javascript
   console.log("Question preview:", sampleQ.question_text.substring(0, 500));
   ```

   Lihat apakah ada `<img src="data:image/...`

2. **Check browser console untuk error:**

   - Open DevTools → Console
   - Lihat ada error CSP (Content Security Policy)?

3. **Test render manual:**
   ```javascript
   // Di console browser
   const q = parsedImportQuestions[0];
   console.log(q.question_text);
   ```

### 3. ❌ Gambar Terlalu Besar

**Gejala:**

- Parsing sangat lambat
- Browser hang/freeze
- Memory error

**Solusi:**

1. **Resize gambar sebelum insert:**
   - Max width: 800px
   - Target size: < 200KB per image
2. **Kompres gambar:**

   - Gunakan TinyPNG, ImageOptim, dll
   - Quality: 80-90%

3. **Batch upload:**
   - Pisah file jadi beberapa bagian
   - Max 10 soal per file

## Fix Manual

### Fix 1: Re-create DOCX dengan Proper Insert

1. **Buat file baru di Word**
2. **Copy text dari template**
3. **Insert gambar dengan benar:**
   ```
   [NOMOR 1]
   JENIS SOAL: PG
   NILAI: 10
   SOAL: Lihat gambar:
   [Cursor di sini → Insert → Pictures → pilih file]
   Apa nama ini?
   JAWABAN:
   A. Pilihan A
   ...
   ```
4. **Save as .docx** (bukan .doc)
5. **Upload lagi**

### Fix 2: Test dengan Gambar Placeholder

Gunakan gambar test sederhana:

- Download icon/logo kecil dari internet
- Resize ke 400x400px
- Save as PNG
- Insert ke DOCX

### Fix 3: Verify Image dalam DOCX

1. **Open file DOCX sebagai ZIP:**

   ```bash
   # Rename .docx to .zip
   mv test.docx test.zip

   # Extract
   unzip test.zip

   # Check images folder
   ls word/media/
   ```

2. **Pastikan gambar ada di folder** `word/media/`

## Debug Advanced

### Test di Backend Langsung

```php
// In Laravel Tinker
php artisan tinker

$file = '/path/to/test.docx';
$phpWord = \PhpOffice\PhpWord\IOFactory::load($file);

foreach ($phpWord->getSections() as $section) {
    foreach ($section->getElements() as $element) {
        echo get_class($element) . "\n";

        if ($element instanceof \PhpOffice\PhpWord\Element\TextRun) {
            foreach ($element->getElements() as $child) {
                echo "  - " . get_class($child) . "\n";
            }
        }
    }
}
```

### Expected Output

```
PhpOffice\PhpWord\Element\TextRun
  - PhpOffice\PhpWord\Element\Text
  - PhpOffice\PhpWord\Element\Image  ← Should see this!
```

## Alternatif Solusi

### Jika Gambar Tetap Tidak Muncul

**Option 1: Upload gambar terpisah**

- Upload gambar ke folder `storage/app/public/questions/`
- Reference di question_text: `<img src="/storage/questions/img1.png" />`

**Option 2: Gunakan URL gambar**

- Host gambar di Imgur, Cloudinary, dll
- Paste URL di DOCX: `<img src="https://i.imgur.com/xxx.png" />`

**Option 3: Manual input**

- Tambah soal manual via form
- Upload gambar via file input terpisah

## Check List

Sebelum upload, pastikan:

- [ ] Gambar di-insert (bukan copy-paste)
- [ ] Format PNG atau JPG
- [ ] Ukuran < 500KB per gambar
- [ ] Total file < 5MB
- [ ] Gambar tidak corrupt
- [ ] Format [NOMOR] benar
- [ ] Section marker lengkap

## Contact & Support

Jika masih gagal setelah semua step:

1. Share console output (screenshot)
2. Share Laravel log (last 50 lines)
3. Share sample DOCX file untuk testing
4. Specify error message yang muncul

---

**Last Updated:** 2025-11-06
