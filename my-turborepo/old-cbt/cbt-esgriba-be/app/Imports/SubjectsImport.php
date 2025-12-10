<?php

namespace App\Imports;

use App\Models\Subject;
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

class SubjectsImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnError, SkipsEmptyRows, WithBatchInserts
{
    use SkipsErrors, Importable;

    private $imported = 0;
    private $failed = 0;
    private $importErrors = [];

    /**
     * Helper: get first non-empty value from possible keys
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
        // Map common header variations
        $nama = $this->first($data, ['nama', 'name', 'mata_pelajaran', 'mapel', 'subject_name', 'nama_mapel']);
        $kode = $this->first($data, ['kode', 'code', 'kode_mapel', 'subject_code']);
        $deskripsi = $this->first($data, ['deskripsi', 'description', 'desc', 'keterangan']);

        return [
            'nama' => isset($nama) && $nama !== '' ? trim((string) $nama) : '',
            'kode' => isset($kode) && $kode !== '' ? strtoupper(trim((string) $kode)) : '',
            'deskripsi' => isset($deskripsi) && $deskripsi !== '' ? trim((string) $deskripsi) : null,
        ];
    }

    /**
     * Build model for each row
     */
    public function model(array $row)
    {
        try {
            $nama = trim((string) ($row['nama'] ?? ''));
            $kode = trim((string) ($row['kode'] ?? ''));

            // Skip if both name and code are empty
            if ($nama === '' && $kode === '') {
                return null;
            }

            // Auto-generate code from name if missing
            if ($kode === '' && $nama !== '') {
                // Generate code from name: "Matematika" -> "MAT", "Bahasa Indonesia" -> "BIND"
                $words = explode(' ', $nama);
                if (count($words) > 1) {
                    $kode = strtoupper(substr($words[0], 0, 2) . substr($words[1], 0, 2));
                } else {
                    $kode = strtoupper(substr($nama, 0, 3));
                }

                // Ensure uniqueness by adding number if needed
                $baseCode = $kode;
                $counter = 1;
                while (Subject::where('code', $kode)->exists() && $counter < 100) {
                    $kode = $baseCode . $counter;
                    $counter++;
                }
            }

            $deskripsi = isset($row['deskripsi']) && $row['deskripsi'] !== '' ? trim((string) $row['deskripsi']) : null;

            $subject = new Subject([
                'name' => $nama,
                'code' => $kode,
                'description' => $deskripsi,
            ]);

            $this->imported++;
            return $subject;
        } catch (\Exception $e) {
            $this->failed++;
            $this->importErrors[] = [
                'row' => $row,
                'error' => $e->getMessage(),
            ];
            Log::error('Subject import error: ' . $e->getMessage(), ['row' => $row]);
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
            'kode' => [
                'required',
                'string',
                'max:50',
                Rule::unique('subjects', 'code')
            ],
            'deskripsi' => 'nullable|string',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'nama.required' => 'Nama mata pelajaran wajib diisi',
            'nama.string' => 'Nama harus berupa teks',
            'kode.required' => 'Kode mata pelajaran wajib diisi',
            'kode.unique' => 'Kode mata pelajaran sudah terdaftar',
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
