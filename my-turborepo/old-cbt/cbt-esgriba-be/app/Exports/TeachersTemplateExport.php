<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TeachersTemplateExport implements FromCollection, WithHeadings, WithStyles, WithColumnWidths
{
    public function collection()
    {
        return collect([
            [
                'Agus Santoso',
                'agus.santoso@example.com',
                '0012024001', // NIP sebagai TEXT
                'L',
                'password123',
                '1980-05-12',
                '081234567890',
                'Jl. Merpati No. 10, Surabaya',
                'aktif',
            ],
            [
                'Siti Aminah',
                'siti.aminah@example.com',
                '0012024002', // NIP sebagai TEXT
                'P',
                'password123',
                '1985-09-20',
                '081298765432',
                'Jl. Kenanga No. 5, Malang',
                'aktif',
            ],
        ]);
    }

    public function headings(): array
    {
        return [
            'nama',
            'email',
            'nip',
            'jenis_kelamin',
            'password',
            'tanggal_lahir',
            'phone',
            'address',
            'status',
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 25,
            'B' => 30,
            'C' => 18, // nip
            'D' => 15,
            'E' => 15,
            'F' => 18,
            'G' => 18,
            'H' => 35,
            'I' => 12,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Format kolom NIP sebagai TEXT
        $sheet->getStyle('C2:C1000')->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);

        // Note jenis kelamin
        $sheet->getComment('D1')->getText()->createTextRun('Isi dengan: L (Laki-laki) atau P (Perempuan)');
        $sheet->getComment('D1')->setWidth('220pt');
        $sheet->getComment('D1')->setHeight('50pt');

        // Header styling
        return [
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
        ];
    }
}
