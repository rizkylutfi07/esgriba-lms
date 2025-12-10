<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Subject;
use App\Models\Major;
use App\Models\Classes;
use App\Models\Room;
use App\Models\AcademicYear;

class MasterDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Subjects (Mata Pelajaran)
        $subjects = [
            ['name' => 'Matematika', 'code' => 'MTK', 'description' => 'Mata pelajaran Matematika'],
            ['name' => 'Bahasa Indonesia', 'code' => 'BIND', 'description' => 'Mata pelajaran Bahasa Indonesia'],
            ['name' => 'Bahasa Inggris', 'code' => 'BING', 'description' => 'Mata pelajaran Bahasa Inggris'],
            ['name' => 'Fisika', 'code' => 'FIS', 'description' => 'Mata pelajaran Fisika'],
            ['name' => 'Kimia', 'code' => 'KIM', 'description' => 'Mata pelajaran Kimia'],
            ['name' => 'Biologi', 'code' => 'BIO', 'description' => 'Mata pelajaran Biologi'],
            ['name' => 'Sejarah', 'code' => 'SEJ', 'description' => 'Mata pelajaran Sejarah'],
            ['name' => 'Geografi', 'code' => 'GEO', 'description' => 'Mata pelajaran Geografi'],
            ['name' => 'Ekonomi', 'code' => 'EKO', 'description' => 'Mata pelajaran Ekonomi'],
            ['name' => 'Sosiologi', 'code' => 'SOS', 'description' => 'Mata pelajaran Sosiologi'],
            ['name' => 'PKN', 'code' => 'PKN', 'description' => 'Pendidikan Kewarganegaraan'],
            ['name' => 'Informatika', 'code' => 'INF', 'description' => 'Mata pelajaran Informatika'],
        ];

        foreach ($subjects as $subject) {
            Subject::firstOrCreate(
                ['code' => $subject['code']],
                $subject
            );
        }

        // Create Majors (Jurusan)
        $majors = [
            ['name' => 'IPA', 'code' => 'IPA', 'description' => 'Ilmu Pengetahuan Alam'],
            ['name' => 'IPS', 'code' => 'IPS', 'description' => 'Ilmu Pengetahuan Sosial'],
            ['name' => 'Bahasa', 'code' => 'BHS', 'description' => 'Bahasa'],
            ['name' => 'Teknik Komputer Jaringan', 'code' => 'TKJ', 'description' => 'Teknik Komputer dan Jaringan'],
            ['name' => 'Rekayasa Perangkat Lunak', 'code' => 'RPL', 'description' => 'Rekayasa Perangkat Lunak'],
            ['name' => 'Multimedia', 'code' => 'MM', 'description' => 'Multimedia'],
        ];

        foreach ($majors as $major) {
            Major::firstOrCreate(
                ['code' => $major['code']],
                $major
            );
        }

        // Create Academic Year
        $academicYear = AcademicYear::firstOrCreate(
            ['name' => '2024/2025'],
            [
                'start_date' => '2024-07-01',
                'end_date' => '2025-06-30',
                'is_active' => true,
            ]
        );

        // Create Classes (Kelas)
        $ipaMajor = Major::where('code', 'IPA')->first();
        $ipsMajor = Major::where('code', 'IPS')->first();
        $tkjMajor = Major::where('code', 'TKJ')->first();
        $rplMajor = Major::where('code', 'RPL')->first();

        $classes = [
            // SMA Classes
            ['name' => 'X MIPA 1', 'class_name' => 'X MIPA 1', 'major_id' => $ipaMajor->id, 'capacity' => 36, 'is_active' => true],
            ['name' => 'X MIPA 2', 'class_name' => 'X MIPA 2', 'major_id' => $ipaMajor->id, 'capacity' => 36, 'is_active' => true],
            ['name' => 'X IPS 1', 'class_name' => 'X IPS 1', 'major_id' => $ipsMajor->id, 'capacity' => 36, 'is_active' => true],
            ['name' => 'X IPS 2', 'class_name' => 'X IPS 2', 'major_id' => $ipsMajor->id, 'capacity' => 36, 'is_active' => true],
            ['name' => 'XI MIPA 1', 'class_name' => 'XI MIPA 1', 'major_id' => $ipaMajor->id, 'capacity' => 36, 'is_active' => true],
            ['name' => 'XI MIPA 2', 'class_name' => 'XI MIPA 2', 'major_id' => $ipaMajor->id, 'capacity' => 36, 'is_active' => true],
            ['name' => 'XI IPS 1', 'class_name' => 'XI IPS 1', 'major_id' => $ipsMajor->id, 'capacity' => 36, 'is_active' => true],
            ['name' => 'XI IPS 2', 'class_name' => 'XI IPS 2', 'major_id' => $ipsMajor->id, 'capacity' => 36, 'is_active' => true],
            ['name' => 'XII MIPA 1', 'class_name' => 'XII MIPA 1', 'major_id' => $ipaMajor->id, 'capacity' => 36, 'is_active' => true],
            ['name' => 'XII MIPA 2', 'class_name' => 'XII MIPA 2', 'major_id' => $ipaMajor->id, 'capacity' => 36, 'is_active' => true],
            ['name' => 'XII IPS 1', 'class_name' => 'XII IPS 1', 'major_id' => $ipsMajor->id, 'capacity' => 36, 'is_active' => true],
            ['name' => 'XII IPS 2', 'class_name' => 'XII IPS 2', 'major_id' => $ipsMajor->id, 'capacity' => 36, 'is_active' => true],
            
            // SMK Classes
            ['name' => 'X TKJ 1', 'class_name' => 'X TKJ 1', 'major_id' => $tkjMajor->id, 'capacity' => 36, 'is_active' => true],
            ['name' => 'X TKJ 2', 'class_name' => 'X TKJ 2', 'major_id' => $tkjMajor->id, 'capacity' => 36, 'is_active' => true],
            ['name' => 'X RPL 1', 'class_name' => 'X RPL 1', 'major_id' => $rplMajor->id, 'capacity' => 36, 'is_active' => true],
            ['name' => 'X RPL 2', 'class_name' => 'X RPL 2', 'major_id' => $rplMajor->id, 'capacity' => 36, 'is_active' => true],
            ['name' => 'XI TKJ 1', 'class_name' => 'XI TKJ 1', 'major_id' => $tkjMajor->id, 'capacity' => 36, 'is_active' => true],
            ['name' => 'XI RPL 1', 'class_name' => 'XI RPL 1', 'major_id' => $rplMajor->id, 'capacity' => 36, 'is_active' => true],
            ['name' => 'XII TKJ 1', 'class_name' => 'XII TKJ 1', 'major_id' => $tkjMajor->id, 'capacity' => 36, 'is_active' => true],
            ['name' => 'XII RPL 1', 'class_name' => 'XII RPL 1', 'major_id' => $rplMajor->id, 'capacity' => 36, 'is_active' => true],
        ];

        foreach ($classes as $class) {
            Classes::firstOrCreate(
                ['name' => $class['name']],
                $class
            );
        }

        // Create Rooms
        $rooms = [
            ['name' => 'Lab Komputer 1', 'code' => 'LAB-KOMP-1', 'capacity' => 40],
            ['name' => 'Lab Komputer 2', 'code' => 'LAB-KOMP-2', 'capacity' => 40],
            ['name' => 'Ruang Kelas A1', 'code' => 'KELAS-A1', 'capacity' => 36],
            ['name' => 'Ruang Kelas A2', 'code' => 'KELAS-A2', 'capacity' => 36],
            ['name' => 'Ruang Kelas B1', 'code' => 'KELAS-B1', 'capacity' => 36],
            ['name' => 'Ruang Kelas B2', 'code' => 'KELAS-B2', 'capacity' => 36],
            ['name' => 'Aula', 'code' => 'AULA', 'capacity' => 200],
        ];

        foreach ($rooms as $room) {
            Room::firstOrCreate(
                ['code' => $room['code']],
                $room
            );
        }

        $this->command->info('Master data seeded successfully!');
    }
}
