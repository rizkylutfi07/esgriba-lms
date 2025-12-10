<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StudentsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths
{
    /**
     * Ambil semua data siswa
     */
    public function collection()
    {
        return User::where('role', 'siswa')
            ->with(['class', 'major'])
            ->orderBy('name')
            ->get();
    }

    /**
     * Map data untuk export
     */
    public function map($student): array
    {
        return [
            $student->name,
            $student->email,
            $student->nisn ?? '',
            $student->nis ?? '',
            $student->gender ?? '',
            '', // password dikosongkan untuk keamanan
            $student->class ? $student->class->class_name : '',
            $student->major ? $student->major->name : '',
            $student->is_active ? 'aktif' : 'nonaktif',
        ];
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
            'G' => 30,  // kelas
            'H' => 30,  // jurusan
            'I' => 12,  // status
        ];
    }

    /**
     * Styling
     */
    public function styles(Worksheet $sheet)
    {
        // Format kolom NISN dan NIS sebagai TEXT
        $sheet->getStyle('C2:C10000')->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);
        $sheet->getStyle('D2:D10000')->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);

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
        ];
    }
}
