<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SubjectsTemplateExport implements FromCollection, WithHeadings, WithStyles, WithColumnWidths
{
    public function collection()
    {
        return collect([
            [
                'Matematika',
                'MAT',
                'Mata pelajaran matematika untuk semua tingkat',
            ],
            [
                'Bahasa Indonesia',
                'BIND',
                'Mata pelajaran bahasa Indonesia',
            ],
            [
                'Bahasa Inggris',
                'BING',
                'Mata pelajaran bahasa Inggris',
            ],
            [
                'Fisika',
                'FIS',
                'Mata pelajaran fisika',
            ],
            [
                'Kimia',
                'KIM',
                'Mata pelajaran kimia',
            ],
        ]);
    }

    public function headings(): array
    {
        return [
            'nama',
            'kode',
            'deskripsi',
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 30, // nama
            'B' => 15, // kode
            'C' => 50, // deskripsi
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Note untuk kode
        $sheet->getComment('B1')->getText()->createTextRun('Kode mata pelajaran (uppercase, unique). Contoh: MAT, BIND, FIS');
        $sheet->getComment('B1')->setWidth('250pt');
        $sheet->getComment('B1')->setHeight('50pt');

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
            4 => [
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E7E6E6'],
                ],
            ],
            5 => [
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E7E6E6'],
                ],
            ],
            6 => [
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E7E6E6'],
                ],
            ],
        ];
    }
}
