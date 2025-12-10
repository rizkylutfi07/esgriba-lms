# Fitur Remote Cheat Detection Toggle

## Overview

Fitur ini memungkinkan guru untuk mengaktifkan atau menonaktifkan sistem deteksi kecurangan otomatis pada setiap ujian secara real-time dari halaman monitoring.

## Cara Kerja

### Backend

1. **Database**: Menambahkan kolom `cheat_detection_enabled` (boolean, default: true) pada tabel `tests`
2. **Model**: Field ini sudah di-cast sebagai boolean di model `Test`
3. **Controller Logic**:
   - `TestAttemptController::logEvent()` sekarang memeriksa flag `cheat_detection_enabled` sebelum:
     - Menambah counter `cheat_count`
     - Melakukan auto-block setelah 3 pelanggaran
   - Event logging tetap berjalan meskipun deteksi dinonaktifkan (untuk tracking)
4. **API**:
   - Endpoint `POST /tests` dan `PUT /tests/{id}` menerima parameter `cheat_detection_enabled`
   - Response monitoring mencantumkan status flag ini

### Frontend

1. **UI Component**: Toggle switch dengan badge status di halaman Monitoring
2. **Visual Feedback**:
   - **AKTIF** (hijau): Sistem akan memblokir otomatis setelah 3 pelanggaran
   - **NONAKTIF** (abu-abu): Pemblokiran hanya dilakukan manual oleh pengawas
3. **Real-time Update**: Perubahan langsung tercermin di UI tanpa refresh

## Penggunaan

### Mengaktifkan/Menonaktifkan

1. Buka halaman **Monitoring Ujian**
2. Pilih ujian yang ingin diatur
3. Di bagian atas (card info ujian), klik toggle **Sistem Deteksi Kecurangan**
4. Konfirmasi perubahan melalui toast notification

### Behavior

#### Ketika AKTIF (default):

- Setiap kali siswa melakukan pelanggaran (tab switch, blur, dll), `cheat_count` bertambah
- Setelah mencapai 3 pelanggaran, attempt akan di-block otomatis oleh sistem
- Status block: `blocked_reason: "Sistem mendeteksi aktivitas mencurigakan berulang"`
- Guru tetap dapat melakukan block/unblock manual

#### Ketika NONAKTIF:

- Event pelanggaran tetap tercatat di tabel `test_attempt_events`
- `cheat_count` **tidak** bertambah
- **Tidak ada** auto-block setelah 3 pelanggaran
- Guru harus melakukan block **manual** dari halaman monitoring jika diperlukan
- Siswa dapat terus mengerjakan tanpa hambatan dari sistem

## Use Case

### Kapan Mengaktifkan:

- Ujian resmi/formal dengan pengawasan ketat
- Ujian berbasis sertifikasi
- Ujian dengan bobot nilai tinggi

### Kapan Menonaktifkan:

- Latihan soal atau try-out
- Ujian dengan toleransi fleksibilitas tinggi
- Kondisi teknis siswa yang tidak stabil (koneksi internet)
- Guru ingin melakukan penilaian manual berdasarkan event log saja

## Technical Details

### Database Migration

```sql
ALTER TABLE tests
ADD COLUMN cheat_detection_enabled BOOLEAN DEFAULT true
COMMENT 'Enable/disable automatic cheat detection and blocking';
```

### API Payload

```typescript
// Create Test
POST /api/tests
{
  ...existing fields,
  "cheat_detection_enabled": true // optional, default true
}

// Update Test
PUT /api/tests/{id}
{
  "cheat_detection_enabled": false
}

// Monitor Response
GET /api/test-attempts/{testId}/monitor
{
  "test": {
    ...,
    "cheat_detection_enabled": true
  },
  ...
}
```

### Frontend Types

```typescript
interface Test {
  ...
  cheat_detection_enabled?: boolean;
}

interface TestMonitorResponse {
  test: {
    ...
    cheat_detection_enabled?: boolean;
  };
  ...
}
```

## Keamanan

- Flag ini **hanya** dapat diubah oleh:
  - Guru pemilik ujian
  - Admin
- Siswa tidak dapat mengakses atau mengubah flag ini
- Perubahan tercatat di audit log (future: tambahkan logging jika diperlukan)

## Catatan Penting

- Event pelanggaran **selalu tercatat** di database meskipun deteksi nonaktif
- Guru tetap dapat melihat semua event log di halaman monitoring
- Block manual tetap berfungsi 100% terlepas dari status flag ini
- Flag ini per-ujian, bukan global untuk semua ujian

## Files Modified

**Backend:**

- `database/migrations/2025_11_07_000001_add_cheat_detection_enabled_to_tests_table.php` (new)
- `app/Models/Test.php`
- `app/Http/Controllers/Api/TestController.php`
- `app/Http/Controllers/Api/TestAttemptController.php`

**Frontend:**

- `src/components/ui/switch.tsx` (new)
- `src/lib/services/testService.ts`
- `src/pages/guru/TestMonitoring.tsx`

**Dependencies:**

- `@radix-ui/react-switch` (npm package)
