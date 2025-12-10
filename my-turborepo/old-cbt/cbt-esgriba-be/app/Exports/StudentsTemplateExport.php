<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Collection;

class StudentsTemplateExport implements FromCollection, WithHeadings, WithStyles, WithColumnWidths
{
    /**
     * Return empty collection with sample data
     */
    public function collection()
    {
        // Return sample data untuk contoh
        return collect([
            [
                'Ahmad Rizki',
                'ahmad.rizki@example.com',
                '0012024001',  // NISN sebagai TEXT dengan prefix 00
                '0012024001',  // NIS sebagai TEXT dengan prefix 00
                'L',           // Jenis kelamin: L/P
                'password123',
                'Islam',       // Agama (opsional)
                'Jakarta',     // Tempat lahir (opsional)
                '2007-03-14',  // Tanggal lahir (opsional, YYYY-MM-DD)
                'Jl. Merdeka No. 1, Jakarta', // Alamat (opsional)
                'X TEKNIK KOMPUTER JARINGAN',
                'Teknik Komputer Jaringan',
                'aktif'
            ],
            [
                'Siti Nurhaliza',
                'siti.nur@example.com',
                '0012024002',  // NISN sebagai TEXT dengan prefix 00
                '0012024002',  // NIS sebagai TEXT dengan prefix 00
                'P',           // Jenis kelamin: L/P
                'password123',
                '',            // Agama (opsional)
                '',            // Tempat lahir (opsional)
                '',            // Tanggal lahir (opsional)
                '',            // Alamat (opsional)
                'X TEKNIK KENDARAAN RINGAN',
                'Teknik Kendaraan Ringan',
                'aktif'
            ],
            [
                'Budi Santoso',
                'budi.santoso@example.com',
                '0012024003',  // NISN sebagai TEXT dengan prefix 00
                '0012024003',  // NIS sebagai TEXT dengan prefix 00
                'L',           // Jenis kelamin: L/P
                'password123',
                'Kristen',
                'Bandung',
                '2006-11-02',
                'Jl. Melati No. 10, Bandung',
                'XI AKUNTANSI',
                'Akuntansi',
                'aktif'
            ],
        ]);
    }

    /**
     * Header columns
     */
    public function headings(): array
    {
        return [
            'nama',
            'email',
            'nisn',
            'nis',
            'jenis_kelamin',
            'password',
            'agama',
            'tempat_lahir',
            'tanggal_lahir',
            'alamat',
            'kelas',
            'jurusan',
            'status'
        ];
    }

    /**
     * Column widths
     */
    public function columnWidths(): array
    {
        return [
            'A' => 25,  // nama
            'B' => 30,  // email
            'C' => 18,  // nisn
            'D' => 18,  // nis
            'E' => 15,  // jenis_kelamin
            'F' => 15,  // password
            'G' => 18,  // agama
            'H' => 20,  // tempat_lahir
            'I' => 18,  // tanggal_lahir
            'J' => 40,  // alamat
            'K' => 30,  // kelas
            'L' => 30,  // jurusan
            'M' => 12,  // status
        ];
    }

    /**
     * Styling
     */
    public function styles(Worksheet $sheet)
    {
        // Format kolom NISN (kolom C) sebagai TEXT agar tidak dikonversi ke number
        $sheet->getStyle('C2:C1000')->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);

        // Format kolom NIS (kolom D) sebagai TEXT agar tidak dikonversi ke number
        $sheet->getStyle('D2:D1000')->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);

        // Set validation note untuk kolom NISN
        $sheet->getComment('C1')->getText()->createTextRun('PENTING: NISN harus berformat TEXT. Awali dengan 00. Contoh: 0012024001');
        $sheet->getComment('C1')->setWidth('250pt');
        $sheet->getComment('C1')->setHeight('60pt');

        // Set validation note untuk kolom NIS
        $sheet->getComment('D1')->getText()->createTextRun('PENTING: NIS harus berformat TEXT. Awali dengan 00. Contoh: 0012024001');
        $sheet->getComment('D1')->setWidth('250pt');
        $sheet->getComment('D1')->setHeight('60pt');

        // Set validation note untuk jenis kelamin
        $sheet->getComment('E1')->getText()->createTextRun('Isi dengan: L (Laki-laki) atau P (Perempuan)');
        $sheet->getComment('E1')->setWidth('220pt');
        $sheet->getComment('E1')->setHeight('50pt');

        // Optional fields notes (informational)
        $sheet->getComment('G1')->getText()->createTextRun('Opsional: contoh Islam/Kristen/Hindu/Budha/Konghucu');
        $sheet->getComment('H1')->getText()->createTextRun('Opsional: tempat lahir, misal Jakarta');
        $sheet->getComment('I1')->getText()->createTextRun('Opsional: format disarankan YYYY-MM-DD atau tanggal Excel');
        $sheet->getComment('J1')->getText()->createTextRun('Opsional: alamat lengkap');

        return [
            // Style header row
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 12,
                ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4472C4'],
                ],
                'alignment' => [
                    'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                    'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
                ],
            ],
            // Style untuk data rows
            2 => [
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E7E6E6'],
                ],
            ],
            3 => [
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E7E6E6'],
                ],
            ],
            4 => [
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E7E6E6'],
                ],
            ],
        ];
    }
}
