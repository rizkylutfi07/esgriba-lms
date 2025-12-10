<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\Importable;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;
use Carbon\Carbon;

class TeachersImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnError, SkipsEmptyRows, WithBatchInserts
{
    use SkipsErrors, Importable;

    private $imported = 0;
    private $failed = 0;
    private $importErrors = [];

    /**
     * Helper: get first non-empty value from possible keys (heading row is snake_cased by library)
     */
    private function first(array $data, array $keys)
    {
        foreach ($keys as $k) {
            if (array_key_exists($k, $data) && $data[$k] !== '' && $data[$k] !== null) {
                return $data[$k];
            }
        }
        return null;
    }

    /**
     * Normalize data before validation
     */
    public function prepareForValidation($data, $index)
    {
        // Map common header variations to expected keys (WithHeadingRow converts headers to snake_case)
        $nama = $this->first($data, ['nama', 'nama_guru', 'name', 'nama_lengkap', 'teacher_name']);
        $email = $this->first($data, ['email', 'username', 'usernameemail', 'e_mail']);
        $nip = $this->first($data, ['nip', 'no_induk_pegawai', 'no_pegawai', 'nomor_induk']);
        $jk = $this->first($data, ['jenis_kelamin', 'jk', 'gender', 'kelamin']);
        $tgl = $this->first($data, ['tanggal_lahir', 'tgl_lahir', 'tanggal', 'birth_date', 'lahir']);
        $phone = $this->first($data, ['phone', 'no_hp', 'hp', 'telp', 'telepon', 'no_telepon', 'nomor_hp', 'nomor_telepon']);
        $address = $this->first($data, ['address', 'alamat']);
        $status = $this->first($data, ['status']);
        $password = $this->first($data, ['password', 'pass', 'kata_sandi']);

        // Auto-generate email if missing
        $emailValue = isset($email) && $email !== '' ? trim((string) $email) : null;
        if (!$emailValue && $nama) {
            // Generate from name: "John Doe" -> "john.doe@guru.local"
            $emailValue = strtolower(str_replace(' ', '.', trim((string) $nama))) . '@guru.local';
        }

        return [
            'nama' => isset($nama) && $nama !== '' ? trim((string) $nama) : '',
            'email' => $emailValue,
            'nip' => isset($nip) && $nip !== '' ? (string) $nip : null,
            'jenis_kelamin' => isset($jk) && $jk !== '' ? strtoupper(trim((string) $jk)) : null,
            'password' => isset($password) && $password !== '' ? (string) $password : null,
            'tanggal_lahir' => $tgl,
            'phone' => isset($phone) && $phone !== '' ? trim((string) $phone) : null,
            'address' => isset($address) && $address !== '' ? trim((string) $address) : null,
            'status' => isset($status) && $status !== '' ? strtolower(trim((string) $status)) : 'aktif',
        ];
    }

    /**
     * Build model for each row
     */
    public function model(array $row)
    {
        try {
            // Use normalized keys prepared earlier
            $nama = trim((string) ($row['nama'] ?? ''));

            // Skip if name is empty (empty row)
            if ($nama === '') {
                return null;
            }

            $email = isset($row['email']) && $row['email'] !== '' ? trim((string) $row['email']) : null;
            $nip = isset($row['nip']) && $row['nip'] !== '' ? (string) $row['nip'] : null;
            $jenisKelamin = isset($row['jenis_kelamin']) && $row['jenis_kelamin'] !== '' ? strtoupper(trim((string) $row['jenis_kelamin'])) : null;
            $password = isset($row['password']) && $row['password'] !== '' ? (string) $row['password'] : 'password123';
            $phone = isset($row['phone']) && $row['phone'] !== '' ? trim((string) $row['phone']) : null;
            $address = isset($row['address']) && $row['address'] !== '' ? trim((string) $row['address']) : null;

            // Parse tanggal_lahir into Y-m-d if provided (handle Excel serial or string)
            $birthDate = null;
            $tglRaw = $row['tanggal_lahir'] ?? null;
            if (isset($tglRaw) && $tglRaw !== '' && $tglRaw !== null) {
                $raw = $tglRaw;
                try {
                    if (is_numeric($raw)) {
                        $dt = ExcelDate::excelToDateTimeObject($raw);
                        $birthDate = Carbon::instance($dt)->format('Y-m-d');
                    } else {
                        $birthDate = Carbon::parse($raw)->format('Y-m-d');
                    }
                } catch (\Throwable $e) {
                    // Fallback: leave null if cannot parse
                    $birthDate = null;
                }
            }

            $user = new User([
                'name' => $nama,
                'email' => $email,
                'password' => Hash::make($password),
                'role' => 'guru',
                'nip' => $nip,
                'gender' => $jenisKelamin,
                'birth_date' => $birthDate,
                'phone' => $phone,
                'address' => $address,
                'is_active' => isset($row['status']) ? in_array(strtolower($row['status']), ['aktif', '1', 'active', 'true']) : true,
            ]);

            $this->imported++;
            return $user;
        } catch (\Exception $e) {
            $this->failed++;
            $this->importErrors[] = [
                'row' => $row,
                'error' => $e->getMessage(),
            ];
            Log::error('Teacher import error: ' . $e->getMessage(), ['row' => $row]);
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
                'nullable',
                'email',
                'max:255',
                Rule::unique('users', 'email')
            ],
            'nip' => [
                'nullable',
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    if ($value && User::where('nip', $value)->exists()) {
                        $fail("NIP {$value} sudah terdaftar.");
                    }
                },
            ],
            'jenis_kelamin' => 'nullable|in:L,P,l,p',
            'password' => 'nullable|string|min:6',
            'tanggal_lahir' => 'nullable', // handled in code for parsing
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'status' => 'nullable|in:aktif,nonaktif,1,0,active',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'nama.required' => 'Nama guru wajib diisi',
            'email.email' => 'Format email tidak valid',
            'email.unique' => 'Email sudah terdaftar',
            'nip.string' => 'NIP harus berupa teks',
            'jenis_kelamin.in' => 'Jenis kelamin harus L (Laki-laki) atau P (Perempuan)',
            'password.min' => 'Password minimal 6 karakter',
        ];
    }

    public function batchSize(): int
    {
        return 100;
    }

    public function getStats()
    {
        return [
            'imported' => $this->imported,
            'failed' => $this->failed,
            'errors' => $this->importErrors,
        ];
    }

    public function onError(\Throwable $e)
    {
        $this->failed++;
        $this->importErrors[] = [
            'error' => $e->getMessage(),
        ];
    }
}
