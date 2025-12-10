# Fitur Ujian untuk Siswa

Dokumentasi lengkap untuk fitur siswa mengerjakan ujian di CBT Esgriba.

## 📋 Fitur yang Tersedia

### 1. **Daftar Ujian** (`/tests`)

- Menampilkan semua ujian yang tersedia
- Filter berdasarkan status (Active/Inactive)
- Informasi lengkap setiap ujian:
  - Judul dan deskripsi
  - Mata pelajaran dan kelas
  - Durasi dan passing score
  - Status ujian
  - Waktu mulai dan berakhir

### 2. **Detail Ujian** (`/tests/:id`)

- Informasi lengkap ujian sebelum memulai
- Status waktu ujian (upcoming, active, finished)
- Petunjuk pengerjaan yang jelas
- Tombol untuk memulai ujian
- Peringatan jika sudah pernah mengerjakan

### 3. **Mengerjakan Ujian** (`/tests/:id/take`)

Fitur lengkap untuk siswa mengerjakan ujian:

#### **Timer & Auto-Submit**

- Timer countdown real-time
- Peringatan saat waktu < 5 menit
- Auto-submit ketika waktu habis
- Indikator warna timer (hijau, kuning, merah)

#### **Navigasi Soal**

- Panel navigasi dengan semua nomor soal
- Indikator visual:
  - Soal aktif (biru)
  - Sudah dijawab (dengan ✓)
  - Belum dijawab (abu-abu)
- Klik nomor untuk pindah soal
- Progress bar jawaban

#### **Tipe Soal yang Didukung**

1. **Multiple Choice** (Pilihan Ganda)
   - Radio button untuk memilih jawaban
   - Visual feedback untuk jawaban terpilih
2. **True/False** (Benar/Salah)

   - Pilihan Benar atau Salah
   - Interface sederhana dan jelas

3. **Essay** (Uraian)
   - Text area dengan counter karakter
   - Auto-resize sesuai konten

#### **Auto-Save**

- Jawaban tersimpan otomatis setiap 1 detik setelah perubahan
- Indikator "Menyimpan..." saat auto-save aktif
- Tidak perlu klik tombol save manual

#### **Submit Ujian**

- Dialog konfirmasi sebelum submit
- Informasi jumlah soal yang sudah dijawab
- Peringatan jika ada soal yang belum dijawab
- Tombol "Selesai & Kirim" di soal terakhir

### 4. **Hasil Ujian** (`/results/:attemptId`)

Halaman hasil yang komprehensif:

#### **Ringkasan Nilai**

- Nilai dalam angka dan persentase
- Status lulus/tidak lulus
- Visualisasi progress bar dengan KKM marker
- Statistik lengkap:
  - Jumlah benar/salah
  - Waktu pengerjaan
  - Tingkat kebenaran

#### **Detail Jawaban**

- Pembahasan setiap soal
- Perbandingan jawaban siswa vs jawaban benar
- Poin yang didapat per soal
- Indikator visual (hijau/merah) untuk setiap soal
- Tampil/sembunyikan detail pembahasan

#### **Informasi Tambional**

- Mata pelajaran dan kelas
- Timestamp kapan selesai
- Tombol kembali ke dashboard
- Tombol lihat ujian lain

## 🎨 UI/UX Features

### **Desain Responsif**

- Layout adaptif untuk desktop dan mobile
- Grid system yang fleksibel
- Scroll area untuk navigasi soal

### **Visual Feedback**

- Loading states untuk semua aksi
- Toast notifications untuk feedback
- Animasi smooth untuk transisi
- Warna konsisten (green=sukses, red=error, blue=info)

### **Accessibility**

- Label yang jelas untuk semua input
- Keyboard navigation support
- Screen reader friendly
- High contrast colors

### **User Experience**

- Konfirmasi untuk aksi penting (mulai, submit)
- Peringatan waktu hampir habis
- Auto-save untuk mencegah kehilangan data
- Progress indicator yang jelas
- Petunjuk pengerjaan yang mudah dipahami

## 📱 Komponen UI yang Digunakan

Menggunakan shadcn/ui components:

- **Button** - Tombol interaktif
- **Card** - Container konten
- **Badge** - Label status
- **Alert** - Notifikasi penting
- **AlertDialog** - Dialog konfirmasi
- **RadioGroup** - Pilihan ganda
- **Textarea** - Input essay
- **ScrollArea** - Scroll area dengan styling
- **Toast** - Notifikasi toast

## 🔧 State Management

### **Local State**

- `loading` - Status loading data
- `submitting` - Status submit jawaban
- `answers` - Object jawaban siswa
- `currentQuestionIndex` - Index soal aktif
- `timeRemaining` - Sisa waktu dalam detik
- `autoSaving` - Status auto-save

### **API Integration**

- `POST /tests/:id/start` - Mulai ujian
- `POST /attempts/:id/answer` - Simpan jawaban
- `POST /attempts/:id/finish` - Selesaikan ujian
- `GET /reports/attempt/:id/analysis` - Hasil ujian

## 🚀 Cara Menggunakan (Siswa)

### **Melihat Daftar Ujian**

1. Login sebagai siswa
2. Klik menu "Ujian" atau navigasi ke `/tests`
3. Lihat semua ujian yang tersedia

### **Melihat Detail Ujian**

1. Klik salah satu ujian dari daftar
2. Baca informasi dan petunjuk pengerjaan
3. Pastikan waktu ujian sedang aktif
4. Klik tombol "Mulai Ujian"

### **Mengerjakan Ujian**

1. Klik "Ya, Mulai Sekarang" pada dialog konfirmasi
2. Timer akan mulai otomatis
3. Jawab soal satu per satu
4. Gunakan navigasi untuk berpindah soal
5. Jawaban tersimpan otomatis
6. Klik "Selesai & Kirim" setelah selesai
7. Konfirmasi pengiriman jawaban

### **Melihat Hasil**

1. Setelah submit, akan otomatis redirect ke halaman hasil
2. Lihat nilai dan status kelulusan
3. Klik "Tampilkan Detail" untuk melihat pembahasan
4. Review jawaban benar dan salah
5. Klik "Kembali ke Dashboard" atau "Lihat Ujian Lain"

## ⚠️ Catatan Penting

### **Untuk Siswa**

- Pastikan koneksi internet stabil
- Jangan refresh atau tutup browser saat ujian
- Perhatikan timer yang berjalan
- Submit sebelum waktu habis
- Baca petunjuk dengan teliti

### **Untuk Pengembang**

- Timer menggunakan client-side countdown
- Auto-save dengan debounce 1 detik
- Validasi waktu dilakukan di server
- Handle edge cases (network error, timeout)
- Optimasi untuk mobile devices

## 🔜 Pengembangan Selanjutnya

Fitur yang bisa ditambahkan:

- [ ] Review soal sebelum submit
- [ ] Bookmark soal untuk review nanti
- [ ] Kalkulator/tools bantuan
- [ ] Upload gambar untuk jawaban essay
- [ ] Riwayat semua ujian yang pernah dikerjakan
- [ ] Perbandingan nilai dengan siswa lain
- [ ] Export hasil ke PDF
- [ ] Notifikasi email hasil ujian
- [ ] Analytics performa siswa
- [ ] Mode practice (latihan tanpa nilai)

## 📞 Support

Jika menemukan bug atau memiliki saran:

1. Buat issue di repository
2. Hubungi developer team
3. Check dokumentasi API

---

**Versi:** 1.0.0  
**Last Updated:** Oktober 2025  
**Developer:** CBT Esgriba Team
