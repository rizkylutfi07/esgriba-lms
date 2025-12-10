# 🎓 CBT E-Sgriba - Alur Sistem

Diagram dan flowchart untuk memahami sistem dengan mudah.

---

## 👥 Role & Permissions

```
┌─────────────────────────────────────────────────────┐
│                    ADMIN                            │
│  • Full access ke semua fitur                       │
│  • Manage users (CRUD)                              │
│  • Manage master data                               │
│  • Override semua permissions                       │
└─────────────────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
┌──────────────────┐            ┌──────────────────┐
│      GURU        │            │      SISWA       │
├──────────────────┤            ├──────────────────┤
│ • Bank Soal      │            │ • Lihat Test     │
│   - Create       │            │ • Start Test     │
│   - Read         │            │ • Submit Answer  │
│   - Update       │            │ • Finish Test    │
│   - Delete       │            │ • Lihat Hasil    │
│                  │            │ • Dashboard      │
│ • Test           │            │                  │
│   - Create       │            └──────────────────┘
│   - Read (own)   │
│   - Update (own) │
│   - Delete (own) │
│   - Duplicate    │
│   - Publish      │
│                  │
│ • Statistik      │
│   - Dashboard    │
│   - Per Test     │
│   - Per Siswa    │
│   - Export       │
└──────────────────┘
```

---

## 🔄 Workflow Guru

```
┌───────────────────────────────────────────────────────────────┐
│                    ALUR KERJA GURU                            │
└───────────────────────────────────────────────────────────────┘

1. LOGIN
   │
   ▼
2. KELOLA BANK SOAL (Optional)
   │
   ├─► Tambah Soal Baru
   │   ├─ Set kategori (Trigonometri, Aljabar, dll)
   │   ├─ Set difficulty (1=Mudah, 2=Sedang, 3=Sulit)
   │   ├─ Tambah opsi jawaban
   │   └─ Tulis penjelasan
   │
   ├─► Duplicate Soal yang Mirip
   │
   └─► Edit/Delete Soal Lama
   │
   ▼
3. BUAT TEST
   │
   ├─► Isi Info Dasar
   │   ├─ Judul test
   │   ├─ Deskripsi
   │   ├─ Mata pelajaran
   │   ├─ Kelas
   │   ├─ Durasi (menit)
   │   ├─ Passing score (%)
   │   ├─ Waktu mulai
   │   └─ Waktu selesai
   │
   ▼
4. TAMBAH SOAL
   │
   ├─► OPSI A: Bulk Add dari Bank Soal ⚡ (RECOMMENDED)
   │   └─ Pilih multiple soal sekaligus
   │
   ├─► OPSI B: Buat Soal Baru Langsung
   │   └─ Input soal one-by-one
   │
   └─► OPSI C: Mix Keduanya
   │
   ▼
5. PREVIEW & CHECK
   │
   ├─ Review semua soal
   ├─ Check scoring total
   └─ Test durasi cukup?
   │
   ▼
6. PUBLISH TEST 🚀
   │
   └─ Test jadi visible untuk siswa
   │
   ▼
7. MONITOR (Saat Test Berlangsung)
   │
   ├─ Dashboard real-time
   ├─ Berapa siswa yang start?
   ├─ Berapa yang sudah finish?
   └─ Ada kendala?
   │
   ▼
8. ANALISIS HASIL 📊
   │
   ├─► Statistik Test
   │   ├─ Average score
   │   ├─ Pass rate
   │   ├─ Distribusi nilai
   │   └─ Top performers
   │
   ├─► Analisis Per Soal
   │   ├─ Soal mana yang paling sulit?
   │   ├─ % siswa yang benar
   │   └─ Evaluasi difficulty
   │
   └─► Review Jawaban Siswa
       ├─ Lihat jawaban detail
       ├─ Identifikasi yang perlu bantuan
       └─ Feedback individual
   │
   ▼
9. EXPORT & LAPORAN 📥
   │
   └─ Export untuk input rapor/dokumentasi
```

---

## 🎯 Workflow Siswa

```
┌───────────────────────────────────────────────────────────────┐
│                   ALUR KERJA SISWA                            │
└───────────────────────────────────────────────────────────────┘

1. LOGIN
   │
   ▼
2. DASHBOARD
   │
   ├─ Lihat test available
   ├─ Check deadline
   └─ Review history
   │
   ▼
3. PILIH TEST
   │
   └─ Baca instruksi & info test
   │
   ▼
4. START TEST
   │
   └─ Timer mulai berjalan ⏱️
   │
   ▼
5. KERJAKAN SOAL
   │
   ├─ Jawab soal satu per satu
   ├─ Submit jawaban (auto-save)
   └─ Bisa ubah jawaban sebelum finish
   │
   ▼
6. FINISH TEST
   │
   ├─ Submit all answers
   └─ Konfirmasi finish
   │
   ▼
7. LIHAT HASIL 🎉
   │
   ├─ Score tampil langsung
   ├─ Pass/Fail status
   ├─ Duration pengerjaan
   └─ Breakdown per soal
   │
   ▼
8. REVIEW JAWABAN
   │
   ├─ Lihat jawaban benar/salah
   ├─ Baca penjelasan (jika ada)
   └─ Belajar dari kesalahan
```

---

## 🏦 Bank Soal Flow

```
┌─────────────────────────────────────────────┐
│          BANK SOAL WORKFLOW                 │
└─────────────────────────────────────────────┘

GURU MENAMBAH SOAL
│
├─ Input soal
├─ Set kategori: "Trigonometri"
├─ Set difficulty: 2 (Sedang)
├─ Tambah 4 opsi jawaban
├─ Mark 1 opsi sebagai benar
├─ Tulis penjelasan
└─ Save
   │
   ▼
SOAL TERSIMPAN DI BANK
│
│  Usage Count: 0
│  Status: Available
│
▼
SAAT MEMBUAT TEST
│
GURU → "Bulk Add from Bank"
│
├─ Filter by kategori: "Trigonometri"
├─ Filter by difficulty: 2
│
▼
PILIH 10 SOAL
│
└─ Klik "Add to Test"
   │
   ▼
SOAL DITAMBAHKAN KE TEST
│
└─ Usage Count bertambah menjadi 1
   │
   ▼
SOAL BISA DIGUNAKAN LAGI
│
└─ Untuk test lain tanpa re-type!
```

---

## 📊 Statistik & Analisis Flow

```
┌──────────────────────────────────────────────┐
│      ANALISIS & LAPORAN WORKFLOW             │
└──────────────────────────────────────────────┘

SISWA SELESAI MENGERJAKAN TEST
│
▼
AUTO-GRADING (Multiple Choice)
│
├─ Hitung jawaban benar
├─ Calculate score
└─ Determine pass/fail
│
▼
DATA MASUK KE SISTEM
│
▼
GURU BUKA DASHBOARD
│
├─► DASHBOARD VIEW
│   ├─ Total tests: 15
│   ├─ Active: 3
│   ├─ Total attempts: 450
│   ├─ Average score: 78.5%
│   └─ Pass rate: 85.2%
│
├─► STATISTIK PER TEST
│   ├─ Completed: 28/30 siswa
│   ├─ Average: 76.5
│   ├─ Highest: 95
│   ├─ Lowest: 45
│   │
│   ├─ DISTRIBUSI NILAI
│   │   ├─ 90-100: 5 siswa ████
│   │   ├─ 80-89:  8 siswa ███████
│   │   ├─ 70-79:  9 siswa ████████
│   │   ├─ 60-69:  4 siswa ███
│   │   └─ 0-59:   2 siswa █
│   │
│   └─ ANALISIS PER SOAL
│       ├─ Soal #1: 89% benar ✅ (Mudah)
│       ├─ Soal #2: 45% benar ⚠️ (Sulit)
│       └─ Soal #3: 72% benar ✅ (OK)
│
├─► ANALISIS JAWABAN SISWA
│   ├─ Ahmad: 85/100
│   │   ├─ Soal 1: ✅ Benar
│   │   ├─ Soal 2: ❌ Salah
│   │   └─ Soal 3: ✅ Benar
│   │
│   └─ Identifikasi yang perlu remedial
│
└─► EXPORT
    └─ Download JSON untuk Excel/Rapor
```

---

## 🔄 Test Lifecycle

```
┌──────────────────────────────────────────────┐
│           TEST LIFECYCLE                     │
└──────────────────────────────────────────────┘

[CREATE]
   │
   ▼
[DRAFT] ◄─────────── (Edit bebas)
   │                      ▲
   │                      │
   │ Publish              │ Unpublish
   │                      │
   ▼                      │
[ACTIVE/PUBLISHED] ───────┘
   │
   │ (Waktu mulai tiba)
   │
   ▼
[AVAILABLE] ◄─── Siswa bisa start
   │
   │ (Siswa mengerjakan)
   │
   ▼
[IN PROGRESS]
   │
   │ (Waktu selesai tiba atau siswa finish)
   │
   ▼
[COMPLETED]
   │
   │ (Guru analisis)
   │
   ▼
[FINISHED]
   │
   │ (Optional)
   │
   └─► [ARCHIVED]
```

---

## 🎨 Data Relationship

```
┌─────────┐
│  USER   │
└────┬────┘
     │
     ├─── creates ──► ┌──────────────┐
     │                │     TEST     │
     │                └──────┬───────┘
     │                       │
     │                       ├─── has ──► ┌──────────┐
     │                       │            │ QUESTION │
     │                       │            └──────┬───┘
     │                       │                   │
     │                       │                   └─── has ──► ┌────────┐
     │                       │                                │ OPTION │
     │                       │                                └────────┘
     │                       │
     │               starts  │
     └─────────────────────► │
                             ▼
                    ┌────────────────┐
                    │  TEST ATTEMPT  │
                    └────────┬───────┘
                             │
                             └─── has ──► ┌──────────────┐
                                          │ USER ANSWER  │
                                          └──────────────┘

┌───────────────┐
│ QUESTION BANK │ ──── copied to ──► QUESTION (in TEST)
└───────────────┘

┌─────────┐
│ SUBJECT │ ──── linked to ──► TEST, QUESTION BANK
└─────────┘
```

---

## 🚀 Performance Tips

### Untuk Response Cepat:
```
1. Database Indexes ✅
   - created_by + subject_id
   - category
   - test_id
   - user_id

2. Eager Loading ✅
   - Load relationships sekaligus
   - Hindari N+1 queries

3. Pagination ✅
   - Default 10-15 items per page
   - Jangan load semua data

4. Caching (Future) 🔮
   - Cache dashboard stats
   - Cache question bank list
```

---

## 🔐 Security Measures

```
REQUEST from Frontend
│
├─ Check: Authorization Header present?
│  └─ No → 401 Unauthorized
│
├─ Check: JWT Token valid?
│  └─ No → 401 Unauthorized
│
├─ Check: User has correct role?
│  └─ No → 403 Forbidden
│
├─ Check: User is resource owner?
│  └─ No → 403 Forbidden (for owned resources)
│
├─ Validate Input
│  └─ Invalid → 422 Validation Error
│
└─ Process Request ✅
```

---

## 📱 Frontend Integration

### Recommended Flow:
```
1. LOGIN
   POST /api/login
   └─► Store token in localStorage/cookie

2. SET TOKEN
   axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

3. CALL PROTECTED ENDPOINTS
   GET /api/tests
   └─► With Authorization header

4. HANDLE ERRORS
   401 → Redirect to login
   403 → Show "Access Denied"
   422 → Show validation errors
```

---

## 🎯 Best Practices

### Untuk Guru:
✅ Buat bank soal dulu sebelum test
✅ Gunakan kategori yang konsisten
✅ Set difficulty level dengan tepat
✅ Tulis penjelasan untuk soal penting
✅ Preview test sebelum publish
✅ Monitor dashboard saat test
✅ Analisis hasil untuk improve teaching

### Untuk Developer:
✅ Gunakan Postman collection untuk testing
✅ Read API documentation sebelum coding
✅ Handle semua error responses
✅ Implement proper loading states
✅ Cache token dengan aman
✅ Validate input di frontend juga
✅ Implement pagination di UI

---

**Dibuat untuk kemudahan pemahaman sistem CBT E-Sgriba**

*Last Updated: 29 Oktober 2025*
