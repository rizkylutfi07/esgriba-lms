<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Classes;
use App\Models\Major;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\Importable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

class StudentsImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnError, SkipsEmptyRows, WithBatchInserts
{
    use SkipsErrors, Importable;

    private $imported = 0;
    private $failed = 0;
    private $importErrors = [];  // Renamed to avoid conflict with SkipsErrors trait

    /**
     * Prepare data for validation - convert types to match validation rules
     */
    public function prepareForValidation($data, $index)
    {
        // Convert numeric values to strings for fields that expect strings
        return [
            'nama' => isset($data['nama']) ? trim($data['nama']) : '',
            'email' => isset($data['email']) ? trim($data['email']) : '',
            'nisn' => isset($data['nisn']) && $data['nisn'] !== '' ? (string) $data['nisn'] : null,
            'nis' => isset($data['nis']) && $data['nis'] !== '' ? (string) $data['nis'] : null,
            'jenis_kelamin' => isset($data['jenis_kelamin']) && $data['jenis_kelamin'] !== '' ? strtoupper(trim($data['jenis_kelamin'])) : null,
            'password' => isset($data['password']) && $data['password'] !== '' ? (string) $data['password'] : null,
            'kelas' => isset($data['kelas']) && $data['kelas'] !== '' ? trim((string) $data['kelas']) : null,
            'jurusan' => isset($data['jurusan']) && $data['jurusan'] !== '' ? trim((string) $data['jurusan']) : null,
            'status' => isset($data['status']) && $data['status'] !== '' ? strtolower(trim((string) $data['status'])) : 'aktif',
            // Optional extended fields (support ID and EN headers)
            'agama' => isset($data['agama']) && $data['agama'] !== '' ? trim((string) $data['agama']) : (isset($data['religion']) && $data['religion'] !== '' ? trim((string) $data['religion']) : null),
            'tempat_lahir' => isset($data['tempat_lahir']) && $data['tempat_lahir'] !== '' ? trim((string) $data['tempat_lahir']) : (isset($data['birth_place']) && $data['birth_place'] !== '' ? trim((string) $data['birth_place']) : null),
            'tanggal_lahir' => isset($data['tanggal_lahir']) && $data['tanggal_lahir'] !== '' ? $data['tanggal_lahir'] : (isset($data['birth_date']) && $data['birth_date'] !== '' ? $data['birth_date'] : null),
            'alamat' => isset($data['alamat']) && $data['alamat'] !== '' ? trim((string) $data['alamat']) : (isset($data['address']) && $data['address'] !== '' ? trim((string) $data['address']) : null),
        ];
    }

    /**
     * Transform each row into a User model
     */
    public function model(array $row)
    {
        try {
            // Normalize data - convert numbers to strings where needed
            $nisn = isset($row['nisn']) && $row['nisn'] !== '' ? (string) $row['nisn'] : null;
            $nis = isset($row['nis']) && $row['nis'] !== '' ? (string) $row['nis'] : null;
            $nama = trim($row['nama'] ?? '');

            // Skip empty rows (no name provided)
            if ($nama === '') {
                return null;
            }
            $email = trim($row['email'] ?? '');
            $jenisKelamin = isset($row['jenis_kelamin']) && $row['jenis_kelamin'] !== '' ? strtoupper(trim($row['jenis_kelamin'])) : null;
            $password = isset($row['password']) && $row['password'] !== '' ? $row['password'] : 'password123';
            $kelasName = isset($row['kelas']) && $row['kelas'] !== '' ? trim($row['kelas']) : null;
            $jurusanName = isset($row['jurusan']) && $row['jurusan'] !== '' ? trim($row['jurusan']) : null;

            // Extended optional fields mapping (accept ID/EN keys)
            $religion = $row['agama'] ?? ($row['religion'] ?? null);
            $birthPlace = $row['tempat_lahir'] ?? ($row['birth_place'] ?? null);
            $birthDateRaw = $row['tanggal_lahir'] ?? ($row['birth_date'] ?? null);
            $address = $row['alamat'] ?? ($row['address'] ?? null);

            // Parse birth date to Y-m-d if provided (supports Excel serial or string)
            $birthDate = null;
            if (!empty($birthDateRaw)) {
                try {
                    if (is_numeric($birthDateRaw)) {
                        $birthDate = ExcelDate::excelToDateTimeObject($birthDateRaw)->format('Y-m-d');
                    } else {
                        $normalized = str_replace(['.', '\\'], ['/', '/'], (string)$birthDateRaw);
                        $ts = strtotime($normalized);
                        if ($ts !== false) {
                            $birthDate = date('Y-m-d', $ts);
                        }
                    }
                } catch (\Throwable $e) {
                    // if parsing fails, leave as null
                    $birthDate = null;
                }
            }

            // Cari atau buat major (jurusan) DULU sebelum class
            $major = null;
            if ($jurusanName) {
                // Cari berdasarkan nama dulu (case insensitive)
                $major = Major::whereRaw('LOWER(name) = ?', [strtolower($jurusanName)])->first();

                // Jika tidak ada, buat baru dengan kode unik
                if (!$major) {
                    try {
                        // Generate unique code
                        $baseCode = strtoupper(substr($jurusanName, 0, 3));
                        $code = $baseCode;
                        $counter = 1;

                        // Loop sampai dapat kode yang unik (max 10 attempts)
                        while (Major::where('code', $code)->exists() && $counter < 10) {
                            $code = $baseCode . $counter;
                            $counter++;
                        }

                        // Jika masih conflict setelah 10 attempts, gunakan random suffix
                        if (Major::where('code', $code)->exists()) {
                            $code = $baseCode . rand(10, 99);
                        }

                        $major = Major::create([
                            'name' => $jurusanName,
                            'code' => $code
                        ]);
                    } catch (\Illuminate\Database\QueryException $e) {
                        // Jika tetap error (race condition), cari lagi
                        $major = Major::whereRaw('LOWER(name) = ?', [strtolower($jurusanName)])->first();

                        // Jika masih null, throw error
                        if (!$major) {
                            throw $e;
                        }
                    }
                }
            }

            // Cari atau buat class (setelah major dibuat)
            $class = null;
            if ($kelasName) {
                // Cari class berdasarkan class_name
                $class = Classes::where('class_name', $kelasName)->first();

                if (!$class) {
                    // Extract level dari nama kelas
                    // Contoh: "X TEKNIK KOMPUTER JARINGAN" -> level: "X"
                    $parts = explode(' ', $kelasName, 2);
                    $level = $parts[0]; // X, XI, XII

                    // Cari atau buat class dengan data minimal
                    $class = Classes::create([
                        'name' => $level,
                        'class_name' => $kelasName,
                        'major_id' => $major ? $major->id : 1, // Gunakan major yang baru dibuat atau default 1
                    ]);
                }
            }

            // Buat user siswa
            $user = new User([
                'name' => $nama,
                'email' => $email,
                'password' => Hash::make($password),
                'role' => 'siswa',
                'nisn' => $nisn,
                'nis' => $nis,
                'gender' => $jenisKelamin,
                'birth_place' => $birthPlace,
                'birth_date' => $birthDate,
                'religion' => $religion,
                'address' => $address,
                'class_id' => $class ? $class->id : null,
                'major_id' => $major ? $major->id : null,
                'is_active' => isset($row['status']) ? (in_array(strtolower($row['status']), ['aktif', '1', 'active', 'true'])) : true,
            ]);

            $this->imported++;
            return $user;
        } catch (\Exception $e) {
            $this->failed++;
            $this->importErrors[] = [
                'row' => $row,
                'error' => $e->getMessage()
            ];
            Log::error('Import error: ' . $e->getMessage(), ['row' => $row]);
            return null;
        }
    }

    /**
     * Validation rules for each row
     */
    public function rules(): array
    {
        return [
            'nama' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')
            ],
            'nisn' => [
                'nullable',
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    if ($value && User::where('nisn', $value)->exists()) {
                        $fail("NISN {$value} sudah terdaftar.");
                    }
                },
            ],
            'nis' => [
                'nullable',
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    if ($value && User::where('nis', $value)->exists()) {
                        $fail("NIS {$value} sudah terdaftar.");
                    }
                },
            ],
            'jenis_kelamin' => 'nullable|in:L,P,l,p',
            'password' => 'nullable|string|min:6',
            'kelas' => 'nullable|string|max:255',
            'jurusan' => 'nullable|string|max:255',
            'status' => 'nullable|in:aktif,nonaktif,1,0,active',
            // Extended optional fields
            'agama' => 'nullable|string|max:100',
            'religion' => 'nullable|string|max:100',
            'tempat_lahir' => 'nullable|string|max:255',
            'birth_place' => 'nullable|string|max:255',
            'tanggal_lahir' => 'nullable',
            'birth_date' => 'nullable',
            'alamat' => 'nullable|string',
            'address' => 'nullable|string',
        ];
    }

    /**
     * Custom validation messages
     */
    public function customValidationMessages()
    {
        return [
            'nama.required' => 'Nama siswa wajib diisi',
            'nama.string' => 'Nama harus berupa teks',
            'email.required' => 'Email wajib diisi',
            'email.email' => 'Format email tidak valid',
            'email.unique' => 'Email sudah terdaftar',
            'nisn.string' => 'NISN harus berupa teks',
            'nis.string' => 'NIS harus berupa teks',
            'jenis_kelamin.in' => 'Jenis kelamin harus L (Laki-laki) atau P (Perempuan)',
            'password.min' => 'Password minimal 6 karakter',
            'kelas.string' => 'Kelas harus berupa teks',
            'jurusan.string' => 'Jurusan harus berupa teks',
            'agama.string' => 'Agama harus berupa teks',
            'religion.string' => 'Religion harus berupa teks',
            'tempat_lahir.string' => 'Tempat lahir harus berupa teks',
            'birth_place.string' => 'Birth place harus berupa teks',
            'alamat.string' => 'Alamat harus berupa teks',
            'address.string' => 'Address harus berupa teks',
        ];
    }

    /**
     * Batch insert size
     */
    public function batchSize(): int
    {
        return 100;
    }

    /**
     * Get import statistics
     */
    public function getStats()
    {
        return [
            'imported' => $this->imported,
            'failed' => $this->failed,
            'errors' => $this->importErrors
        ];
    }

    /**
     * Handle errors
     */
    public function onError(\Throwable $e)
    {
        $this->failed++;
        $this->importErrors[] = [
            'error' => $e->getMessage()
        ];
    }
}
