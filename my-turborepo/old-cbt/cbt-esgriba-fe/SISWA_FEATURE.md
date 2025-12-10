# Frontend Siswa - Mengerjakan Ujian

## Fitur yang Telah Dibuat

### 1. **Dashboard Siswa** (`/pages/siswa/SiswaDashboard.tsx`)

Dashboard utama untuk siswa yang menampilkan:

- **Statistik Siswa:**

  - Jumlah ujian tersedia
  - Total ujian yang telah dikerjakan
  - Nilai rata-rata
  - Tingkat kelulusan (pass rate)

- **Ujian Tersedia:**

  - Daftar ujian yang dapat dikerjakan
  - Informasi mata pelajaran, durasi, dan jadwal
  - Tombol untuk langsung mengerjakan ujian

- **Riwayat Ujian:**
  - Hasil ujian terakhir
  - Status lulus/tidak lulus
  - Link ke detail hasil

### 2. **Detail Ujian Siswa** (`/pages/siswa/TestDetailStudent.tsx`)

Halaman informasi ujian sebelum dikerjakan:

- **Informasi Lengkap:**

  - Judul, deskripsi, mata pelajaran, dan kelas
  - Durasi ujian dan jumlah soal
  - KKM (passing score) dan total poin
  - Waktu mulai dan selesai ujian
  - Nama guru pembuat ujian

- **Status Ujian:**

  - Badge status ujian (Aktif/Tidak Aktif)
  - Badge waktu (Akan Dimulai/Sedang Berlangsung/Telah Berakhir)
  - Alert jika siswa sudah pernah mengerjakan (menampilkan nilai sebelumnya)

- **Petunjuk Pengerjaan:**

  - Checklist petunjuk yang harus diperhatikan
  - Peringatan tentang koneksi internet, waktu, dan aturan ujian

- **Konfirmasi Mulai:**
  - Dialog konfirmasi sebelum memulai ujian
  - Peringatan bahwa timer akan langsung dimulai

### 3. **Halaman Mengerjakan Ujian** (`/pages/siswa/TakeTest.tsx`)

Interface interaktif untuk mengerjakan ujian:

#### Fitur Utama:

- **Header Ujian:**

  - Judul ujian, mata pelajaran, dan kelas
  - Timer countdown dengan perubahan warna:
    - Hijau: Waktu masih banyak
    - Kuning: Tersisa < 10 menit
    - Merah: Tersisa < 5 menit
  - Progress bar pengerjaan soal
  - Indikator auto-saving

- **Navigasi Soal:**

  - Sidebar dengan grid nomor soal (1-N)
  - Visual indicator:
    - Biru: Soal yang sedang dikerjakan
    - Abu-abu: Belum dijawab
    - Abu-abu dengan checklist hijau: Sudah dijawab
  - Klik nomor untuk pindah ke soal tertentu
  - Scroll area untuk daftar soal panjang

- **Area Soal:**

  - Badge nomor soal dan poin
  - Badge tipe soal (untuk Essay)
  - Teks pertanyaan

- **Tipe Jawaban yang Didukung:**

  - **Multiple Choice:** Radio button dengan highlight pilihan
  - **True/False:** Radio button Benar/Salah
  - **Essay:** Text area dengan counter karakter

- **Auto-Save:**

  - Jawaban tersimpan otomatis setiap 1 detik setelah perubahan
  - Indikator "Menyimpan..." saat proses save

- **Navigasi Soal:**

  - Tombol "Sebelumnya" dan "Selanjutnya"
  - Tombol "Selesai & Kirim" di soal terakhir

- **Auto-Submit:**

  - Ujian otomatis tersubmit saat waktu habis

- **Dialog Konfirmasi Submit:**

  - Menampilkan jumlah soal yang sudah dijawab
  - Peringatan jika ada soal yang belum dijawab
  - Konfirmasi sebelum mengirim jawaban

- **Peringatan Waktu:**
  - Alert merah jika waktu tersisa < 5 menit

### 4. **Hasil Ujian** (`/pages/siswa/TestResult.tsx`)

Halaman menampilkan hasil setelah ujian selesai:

#### Komponen:

- **Header Hasil:**

  - Icon dan pesan lulus/tidak lulus
  - Judul ujian

- **Card Nilai:**

  - Nilai utama (besar dan prominent)
  - Persentase nilai
  - Grid statistik:
    - Jumlah jawaban benar
    - Jumlah jawaban salah
    - Durasi pengerjaan
    - KKM

- **Progress Bar:**

  - Visual perbandingan nilai dengan KKM
  - Line kuning menandai batas KKM

- **Card Statistik:**

  - Mata pelajaran dan kelas
  - Waktu pengerjaan vs durasi total
  - Tingkat kebenaran (persentase)

- **Alert Message:**

  - Hijau: Pesan selamat jika lulus
  - Merah: Motivasi jika belum lulus

- **Detail Jawaban (Toggle):**

  - Tombol untuk show/hide pembahasan
  - Untuk setiap soal:
    - Nomor soal, poin, dan status (Benar/Salah)
    - Teks pertanyaan
    - Poin yang didapat
    - Untuk Multiple Choice:
      - Semua opsi dengan visual indicator:
        - Hijau: Jawaban yang benar
        - Merah: Jawaban salah (jika dipilih siswa)
        - Abu-abu: Opsi lainnya
      - Badge "Jawaban Benar" dan "Jawaban Anda"

- **Action Buttons:**

  - Kembali ke Dashboard
  - Lihat Ujian Lain

- **Timestamp:**
  - Relative time sejak ujian selesai (menggunakan date-fns)

### 5. **Daftar Ujian** (`/pages/TestList.tsx`)

Halaman daftar semua ujian (untuk siswa dan guru):

#### Untuk Siswa:

- Filter ujian berdasarkan:

  - Pencarian (judul/deskripsi)
  - Mata pelajaran
  - Kelas
  - Status (Aktif/Akan Datang/Selesai)

- Card ujian dengan info:
  - Judul dan status
  - Mata pelajaran, kelas, durasi
  - Tanggal pelaksanaan
  - Jumlah soal
  - Tombol "Lihat Detail"

## Routing

```typescript
// Siswa Routes di App.tsx
<Route path="/tests" element={<TestList />} />
<Route path="/tests/:id" element={
  user?.role === 'siswa'
    ? <TestDetailStudent />
    : <TestDetail />  // Guru/Admin
} />
<Route path="/tests/:id/take" element={<TakeTest />} />
<Route path="/results/:attemptId" element={<TestResult />} />
```

## API Endpoints yang Digunakan

### Mengerjakan Ujian:

1. `POST /tests/{id}/start` - Mulai ujian (membuat attempt)
2. `POST /attempts/{id}/answer` - Submit jawaban per soal
3. `POST /attempts/{id}/finish` - Selesaikan ujian

### Melihat Hasil:

1. `GET /reports/attempt/{attemptId}/analysis` - Detail hasil dan pembahasan
2. `GET /attempts?test_id={id}` - Check attempt sebelumnya
3. `GET /dashboard/student` - Dashboard siswa
4. `GET /tests` - Daftar ujian dengan filter
5. `GET /tests/{id}` - Detail ujian

## UI Components yang Digunakan

### Shadcn/UI Components:

- `Button`
- `Card` (dengan Header, Content, Title, Description)
- `Badge`
- `Alert` (dengan AlertDescription)
- `RadioGroup` & `RadioGroupItem`
- `Textarea`
- `Label`
- `ScrollArea`
- `AlertDialog` (untuk konfirmasi)
- `Input`, `Select` (untuk filter)

### Icons (Lucide React):

- `Clock`, `CheckCircle`, `XCircle`
- `FileText`, `BookOpen`, `Award`
- `PlayCircle`, `Send`, `Home`
- `Calendar`, `TrendingUp`, `Info`
- `ChevronLeft`, `ChevronRight`
- `AlertCircle`, `Eye`

## Dependencies Tambahan yang Diinstall

```bash
npm install @radix-ui/react-radio-group @radix-ui/react-scroll-area
```

(Komponen lain sudah ada di project)

## Fitur Teknis

### 1. Timer Management

- `useState` untuk timeRemaining
- `useEffect` dengan `setInterval` untuk countdown
- Auto-submit saat waktu habis

### 2. Auto-Save dengan Debounce

- `useCallback` untuk fungsi saveAnswer
- `useEffect` dengan `setTimeout` untuk debounce
- Save setiap 1 detik setelah perubahan jawaban

### 3. State Management

- Local state dengan `useState`:
  - attempt data
  - answers (Record<questionId, Answer>)
  - currentQuestionIndex
  - timeRemaining
  - loading, submitting, autoSaving

### 4. Date Formatting

- `date-fns` untuk format tanggal
- Locale Indonesia (`id`)
- `formatDistanceToNow` untuk relative time

### 5. Responsive Design

- Grid layout dengan Tailwind CSS
- Sidebar navigasi soal (hide on mobile)
- Card-based design
- Mobile-friendly buttons dan spacing

## Flow Lengkap Siswa Mengerjakan Ujian

```
Dashboard Siswa
    ↓
Lihat Daftar Ujian (/tests)
    ↓
Klik "Lihat Detail" → Detail Ujian (/tests/:id)
    ↓
Baca Informasi & Petunjuk
    ↓
Klik "Mulai Ujian" → Dialog Konfirmasi
    ↓
Confirm → Mengerjakan Ujian (/tests/:id/take)
    ↓
- Jawab soal satu per satu
- Auto-save setiap jawaban
- Navigasi dengan sidebar atau tombol
- Monitor timer
    ↓
Klik "Selesai & Kirim" → Dialog Konfirmasi
    ↓
Confirm → Hasil Ujian (/results/:attemptId)
    ↓
- Lihat nilai dan status lulus/tidak
- Lihat pembahasan soal
- Kembali ke Dashboard atau Lihat Ujian Lain
```

## Keamanan & Validasi

1. **Protected Routes:** Hanya siswa yang bisa akses halaman-halaman ini
2. **Time Validation:** Check waktu mulai/selesai di frontend dan backend
3. **Auto-Save:** Mencegah kehilangan data jika koneksi terputus
4. **Konfirmasi Submit:** Mencegah submit tidak sengaja
5. **Timer Auto-Submit:** Pastikan tidak ada kecurangan dengan waktu

## Testing Checklist

- [ ] Siswa bisa melihat dashboard dengan statistik
- [ ] Siswa bisa melihat daftar ujian tersedia
- [ ] Siswa bisa melihat detail ujian sebelum mulai
- [ ] Timer countdown berjalan dengan benar
- [ ] Auto-save berfungsi untuk setiap jawaban
- [ ] Navigasi soal (tombol dan sidebar) bekerja
- [ ] Multiple choice, true/false, essay dapat dijawab
- [ ] Auto-submit saat waktu habis
- [ ] Konfirmasi submit menampilkan info yang benar
- [ ] Hasil ujian menampilkan nilai dan pembahasan
- [ ] Visual indicator (warna, badge, icon) sesuai
- [ ] Responsive di mobile dan desktop
- [ ] Handle error dengan graceful (loading, error state)

## Catatan Developer

- Semua component menggunakan TypeScript untuk type safety
- Menggunakan Tailwind CSS untuk styling
- Icon dari lucide-react
- Date formatting dengan date-fns
- API calls dengan axios (melalui lib/api.ts)
- Auth state dengan Zustand (store/authStore.ts)
- Toast notifications untuk feedback user

---

**Status:** ✅ Selesai dan siap digunakan
**Last Updated:** 2025-10-31
