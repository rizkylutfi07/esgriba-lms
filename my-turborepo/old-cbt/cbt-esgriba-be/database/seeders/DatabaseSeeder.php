<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Major;
use App\Models\Classes;
use App\Models\Subject;
use App\Models\Room;
use App\Models\AcademicYear;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Users
        User::updateOrCreate(
            ['email' => 'admin@cbt.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'guru@cbt.com'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'nip' => '198501012010011001',
                'phone' => '081234567890',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'siswa@cbt.com'],
            [
                'name' => 'Ahmad Rizki',
                'password' => Hash::make('password'),
                'role' => 'siswa',
                'nisn' => '2024001',
                'kelas' => '12 IPA 1',
                'jurusan' => 'IPA',
                'phone' => '081234567891',
                'is_active' => true,
            ]
        );

        // Create Teachers (Guru) - Wali Kelas
        User::updateOrCreate(
            ['email' => 'imtiana@cbt.com'],
            [
                'name' => 'Imtiana, S.Pd',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'nip' => '198601012010012001',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'frances@cbt.com'],
            [
                'name' => 'Frances Laurence Setyo Budi, S.Pd.',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'nip' => '198702012011012001',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'udayani@cbt.com'],
            [
                'name' => 'Udayani, S.Pd.',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'nip' => '198803012012012001',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'siska@cbt.com'],
            [
                'name' => 'Siska Purwanti, S.E.',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'nip' => '198904012013012001',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'erlin@cbt.com'],
            [
                'name' => 'Erlin Novia Diana, S.E.',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'nip' => '199005012014012001',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'sulastri@cbt.com'],
            [
                'name' => 'Sulastri, S.Kom.',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'nip' => '199106012015012001',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'mulyono@cbt.com'],
            [
                'name' => 'Mulyono, S.Th.',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'nip' => '199207012016012001',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'wahyu@cbt.com'],
            [
                'name' => 'Wahyu Mirnawati, S.Ak.',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'nip' => '199308012017012001',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'nurmala@cbt.com'],
            [
                'name' => 'Nurmala Evayanti S.Pd.',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'nip' => '199409012018012001',
                'is_active' => true,
            ]
        );

        // Additional teachers
        User::updateOrCreate(
            ['email' => 'aini@cbt.com'],
            [
                'name' => 'Aini Abdul Cholis S.Pd.',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'nip' => '199510012019012001',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'subur@cbt.com'],
            [
                'name' => 'Dra. Subur Hindartin',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'nip' => '199611012020012001',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'dwi@cbt.com'],
            [
                'name' => 'Dwi Wahyudi, S.T,',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'nip' => '199712012021012001',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'fera@cbt.com'],
            [
                'name' => 'Fera Mega Haristina, S.Tr.Kom.',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'nip' => '199801012022012001',
                'is_active' => true,
            ]
        );

        // Create Majors (Jurusan)
        $tkr = Major::updateOrCreate(
            ['code' => 'TKR'],
            [
                'name' => 'Teknik Kendaraan Ringan',
                'description' => 'Program keahlian yang mempelajari tentang perawatan dan perbaikan kendaraan ringan'
            ]
        );

        $tkj = Major::updateOrCreate(
            ['code' => 'TKJ'],
            [
                'name' => 'Teknik Komputer dan Jaringan',
                'description' => 'Program keahlian yang mempelajari tentang instalasi, konfigurasi dan troubleshooting komputer dan jaringan'
            ]
        );

        $akt = Major::updateOrCreate(
            ['code' => 'AKT'],
            [
                'name' => 'Akuntansi',
                'description' => 'Program keahlian yang mempelajari tentang pencatatan dan pelaporan keuangan'
            ]
        );

        // Create Classes (Kelas)
        Classes::updateOrCreate(
            ['class_name' => 'X AKUNTANSI'],
            [
                'name' => 'X', 
                'major_id' => $akt->id, 
                'homeroom_teacher' => 'Imtiana, S.Pd',
                'capacity' => 36
            ]
        );
        Classes::updateOrCreate(
            ['class_name' => 'X TEKNIK KENDARAAN RINGAN'],
            [
                'name' => 'X', 
                'major_id' => $tkr->id, 
                'homeroom_teacher' => 'Frances Laurence Setyo Budi, S.Pd.',
                'capacity' => 32
            ]
        );
        Classes::updateOrCreate(
            ['class_name' => 'X TEKNIK KOMPUTER JARINGAN'],
            [
                'name' => 'X', 
                'major_id' => $tkj->id, 
                'homeroom_teacher' => 'Udayani, S.Pd.',
                'capacity' => 34
            ]
        );
        
        Classes::updateOrCreate(
            ['class_name' => 'XI AKUNTANSI'],
            [
                'name' => 'XI', 
                'major_id' => $akt->id, 
                'homeroom_teacher' => 'Siska Purwanti, S.E.',
                'capacity' => 34
            ]
        );
        Classes::updateOrCreate(
            ['class_name' => 'XI TEKNIK KENDARAAN RINGAN'],
            [
                'name' => 'XI', 
                'major_id' => $tkr->id, 
                'homeroom_teacher' => 'Erlin Novia Diana, S.E.',
                'capacity' => 32
            ]
        );
        Classes::updateOrCreate(
            ['class_name' => 'XI TEKNIK KOMPUTER JARINGAN'],
            [
                'name' => 'XI', 
                'major_id' => $tkj->id, 
                'homeroom_teacher' => 'Sulastri, S.Kom.',
                'capacity' => 34
            ]
        );
        
        Classes::updateOrCreate(
            ['class_name' => 'XII AKUNTANSI'],
            [
                'name' => 'XII', 
                'major_id' => $akt->id, 
                'homeroom_teacher' => 'Mulyono, S.Th.',
                'capacity' => 32
            ]
        );
        Classes::updateOrCreate(
            ['class_name' => 'XII TEKNIK KENDARAAN RINGAN'],
            [
                'name' => 'XII', 
                'major_id' => $tkr->id, 
                'homeroom_teacher' => 'Wahyu Mirnawati, S.Ak.',
                'capacity' => 30
            ]
        );
        Classes::updateOrCreate(
            ['class_name' => 'XII TEKNIK KOMPUTER JARINGAN'],
            [
                'name' => 'XII', 
                'major_id' => $tkj->id, 
                'homeroom_teacher' => 'Nurmala Evayanti S.Pd.',
                'capacity' => 30
            ]
        );

        // Create Subjects (Mata Pelajaran)
        // General subjects
        Subject::updateOrCreate(
            ['code' => 'MTK'],
            ['name' => 'Matematika', 'major_id' => null]
        );
        Subject::updateOrCreate(
            ['code' => 'BIN'],
            ['name' => 'Bahasa Indonesia', 'major_id' => null]
        );
        Subject::updateOrCreate(
            ['code' => 'BING'],
            ['name' => 'Bahasa Inggris', 'major_id' => null]
        );

        // TKR subjects
        Subject::updateOrCreate(
            ['code' => 'PDTO'],
            ['name' => 'Pemeliharaan Dasar Teknik Otomotif', 'major_id' => $tkr->id]
        );
        Subject::updateOrCreate(
            ['code' => 'TLDO'],
            ['name' => 'Teknologi dan Layanan Dasar Otomotif', 'major_id' => $tkr->id]
        );

        // TKJ subjects
        Subject::updateOrCreate(
            ['code' => 'TJKT'],
            ['name' => 'Teknologi Jaringan Komputer dan Telekomunikasi', 'major_id' => $tkj->id]
        );
        Subject::updateOrCreate(
            ['code' => 'KKPI'],
            ['name' => 'Keterampilan Komputer dan Pengelolaan Informasi', 'major_id' => $tkj->id]
        );

        // AKT subjects
        Subject::updateOrCreate(
            ['code' => 'AKD'],
            ['name' => 'Akuntansi Dasar', 'major_id' => $akt->id]
        );
        Subject::updateOrCreate(
            ['code' => 'PKK'],
            ['name' => 'Praktikum Akuntansi Keuangan', 'major_id' => $akt->id]
        );

        // Create Rooms (Ruangan)
        Room::updateOrCreate(
            ['code' => 'LAB-1'],
            [
                'name' => 'Lab Komputer 1',
                'capacity' => 40,
                'building' => 'Gedung A',
                'floor' => 2
            ]
        );
        Room::updateOrCreate(
            ['code' => 'LAB-2'],
            [
                'name' => 'Lab Komputer 2',
                'capacity' => 40,
                'building' => 'Gedung A',
                'floor' => 2
            ]
        );
        Room::updateOrCreate(
            ['code' => 'R-101'],
            [
                'name' => 'Ruang Kelas 101',
                'capacity' => 36,
                'building' => 'Gedung B',
                'floor' => 1
            ]
        );
        Room::updateOrCreate(
            ['code' => 'R-102'],
            [
                'name' => 'Ruang Kelas 102',
                'capacity' => 36,
                'building' => 'Gedung B',
                'floor' => 1
            ]
        );
        Room::updateOrCreate(
            ['code' => 'R-201'],
            [
                'name' => 'Ruang Kelas 201',
                'capacity' => 36,
                'building' => 'Gedung B',
                'floor' => 2
            ]
        );

        // Create Academic Year (Tahun Pelajaran)
        AcademicYear::updateOrCreate(
            ['name' => '2024/2025'],
            [
                'start_date' => '2024-07-15',
                'end_date' => '2025-06-30',
                'is_active' => true
            ]
        );

        // Create Students (Siswa) for all classes
        $allClasses = Classes::all();
        
        // Sample student names
        $maleNames = [
            'Ahmad Rizki', 'Budi Santoso', 'Doni Pratama', 'Eko Saputra', 'Fajar Nugroho',
            'Galih Permana', 'Hendra Wijaya', 'Indra Kusuma', 'Joko Susilo', 'Kurnia Adi'
        ];
        
        $femaleNames = [
            'Siti Nurhaliza', 'Dewi Lestari', 'Fitri Handayani', 'Gita Savitri', 'Hani Puspita',
            'Intan Permata', 'Kartika Sari', 'Laila Maharani', 'Maya Sinta', 'Novi Amelia'
        ];

        $counter = 1;
        foreach ($allClasses as $class) {
            // Add 3-5 students per class
            $numStudents = rand(3, 5);
            
            for ($i = 1; $i <= $numStudents; $i++) {
                $gender = rand(0, 1) ? 'L' : 'P';
                $names = $gender === 'L' ? $maleNames : $femaleNames;
                $randomName = $names[array_rand($names)];
                
                $nisn = '202400' . str_pad($counter, 3, '0', STR_PAD_LEFT);
                $nis = '2764/00' . str_pad($counter, 2, '0', STR_PAD_LEFT) . '/' . date('y');
                $email = strtolower(str_replace(' ', '.', $randomName)) . $counter . '@siswa.cbt.com';
                
                User::updateOrCreate(
                    ['email' => $email],
                    [
                        'name' => $randomName . ' ' . $counter,
                        'password' => Hash::make('password'),
                        'role' => 'siswa',
                        'nisn' => $nisn,
                        'nis' => $nis,
                        'gender' => $gender,
                        'birth_date' => date('Y-m-d', strtotime('-' . rand(15, 18) . ' years')),
                        'birth_place' => 'Banyuwangi',
                        'religion' => 'Islam',
                        'address' => 'Jl. Raya No. ' . rand(1, 100) . ' Banyuwangi',
                        'class_id' => $class->id,
                        'major_id' => $class->major_id,
                        'phone' => '0812345' . str_pad($counter, 5, '0', STR_PAD_LEFT),
                        'is_active' => true,
                    ]
                );
                
                $counter++;
            }
        }
    }
}

