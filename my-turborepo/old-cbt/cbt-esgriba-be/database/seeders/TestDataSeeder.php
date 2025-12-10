<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Subject;
use App\Models\Major;
use App\Models\Classes;
use App\Models\AcademicYear;
use App\Models\Test;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\QuestionBank;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@esgriba.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        $guru1 = User::firstOrCreate(
            ['email' => 'guru.matematika@esgriba.com'],
            [
                'name' => 'Budi Santoso, S.Pd',
                'password' => Hash::make('guru123'),
                'role' => 'guru',
                'nip' => '198501012010011001',
                'is_active' => true,
            ]
        );

        $guru2 = User::firstOrCreate(
            ['email' => 'guru.fisika@esgriba.com'],
            [
                'name' => 'Siti Rahayu, S.Pd',
                'password' => Hash::make('guru123'),
                'role' => 'guru',
                'nip' => '198703152011012002',
                'is_active' => true,
            ]
        );

        // Create Students
        $students = [];
        for ($i = 1; $i <= 10; $i++) {
            $students[] = User::firstOrCreate(
                ['email' => "siswa{$i}@esgriba.com"],
                [
                    'name' => "Siswa " . $i,
                    'password' => Hash::make('siswa123'),
                    'role' => 'siswa',
                    'nisn' => '000000000' . str_pad($i, 4, '0', STR_PAD_LEFT),
                    'nis' => '2024' . str_pad($i, 4, '0', STR_PAD_LEFT),
                    'is_active' => true,
                ]
            );
        }

        // 2. Create Academic Year
        $academicYear = AcademicYear::firstOrCreate(
            ['name' => '2024/2025'],
            [
                'start_date' => '2024-07-01',
                'end_date' => '2024-12-31',
                'is_active' => true,
            ]
        );

        // 3. Create Majors
        $mipa = Major::firstOrCreate(
            ['code' => 'MIPA'],
            ['name' => 'MIPA (Matematika dan Ilmu Pengetahuan Alam)']
        );

        $ips = Major::firstOrCreate(
            ['code' => 'IPS'],
            ['name' => 'IPS (Ilmu Pengetahuan Sosial)']
        );

        // 4. Create Classes
        $class10Mipa1 = Classes::firstOrCreate(
            ['class_name' => 'X MIPA 1'],
            [
                'name' => 'X',
                'major_id' => $mipa->id,
                'capacity' => 30,
            ]
        );

        $class10Mipa2 = Classes::firstOrCreate(
            ['class_name' => 'X MIPA 2'],
            [
                'name' => 'X',
                'major_id' => $mipa->id,
                'capacity' => 30,
            ]
        );

        // 5. Create Subjects
        $matematika = Subject::firstOrCreate(
            ['code' => 'MTK'],
            ['name' => 'Matematika']
        );

        $fisika = Subject::firstOrCreate(
            ['code' => 'FIS'],
            ['name' => 'Fisika']
        );

        $kimia = Subject::firstOrCreate(
            ['code' => 'KIM'],
            ['name' => 'Kimia']
        );

        // 6. Create Question Banks
        $this->createQuestionBanks($guru1->id, $matematika->id);

        // 7. Create Tests
        $this->createTests($guru1->id, $guru2->id, $matematika->id, $fisika->id);

        $this->command->info('✅ Sample data created successfully!');
        $this->command->info('');
        $this->command->info('🔑 Login Credentials:');
        $this->command->info('Admin: admin@esgriba.com / admin123');
        $this->command->info('Guru Matematika: guru.matematika@esgriba.com / guru123');
        $this->command->info('Guru Fisika: guru.fisika@esgriba.com / guru123');
        $this->command->info('Siswa: siswa1@esgriba.com s/d siswa10@esgriba.com / siswa123');
    }

    private function createQuestionBanks($guruId, $subjectId)
    {
        $questions = [
            [
                'category' => 'Trigonometri',
                'question_text' => 'Berapakah nilai sin 30°?',
                'difficulty_level' => 1,
                'explanation' => 'Nilai sin 30° = 1/2 berdasarkan tabel trigonometri dasar',
                'options' => [
                    ['text' => '1/2', 'is_correct' => true],
                    ['text' => '1/3', 'is_correct' => false],
                    ['text' => '√2/2', 'is_correct' => false],
                    ['text' => '√3/2', 'is_correct' => false],
                ],
            ],
            [
                'category' => 'Trigonometri',
                'question_text' => 'Berapakah nilai cos 60°?',
                'difficulty_level' => 1,
                'explanation' => 'Nilai cos 60° = 1/2',
                'options' => [
                    ['text' => '1/2', 'is_correct' => true],
                    ['text' => '1', 'is_correct' => false],
                    ['text' => '√3/2', 'is_correct' => false],
                    ['text' => '0', 'is_correct' => false],
                ],
            ],
            [
                'category' => 'Aljabar',
                'question_text' => 'Hasil dari 2x + 3x adalah...',
                'difficulty_level' => 1,
                'explanation' => '2x + 3x = (2+3)x = 5x',
                'options' => [
                    ['text' => '5x', 'is_correct' => true],
                    ['text' => '6x', 'is_correct' => false],
                    ['text' => '5', 'is_correct' => false],
                    ['text' => 'x', 'is_correct' => false],
                ],
            ],
            [
                'category' => 'Geometri',
                'question_text' => 'Luas segitiga dengan alas 10 cm dan tinggi 6 cm adalah...',
                'difficulty_level' => 2,
                'explanation' => 'Luas = 1/2 × alas × tinggi = 1/2 × 10 × 6 = 30 cm²',
                'options' => [
                    ['text' => '30 cm²', 'is_correct' => true],
                    ['text' => '60 cm²', 'is_correct' => false],
                    ['text' => '15 cm²', 'is_correct' => false],
                    ['text' => '20 cm²', 'is_correct' => false],
                ],
            ],
            [
                'category' => 'Logaritma',
                'question_text' => 'Hasil dari log 100 adalah...',
                'difficulty_level' => 2,
                'explanation' => 'log 100 = log 10² = 2',
                'options' => [
                    ['text' => '2', 'is_correct' => true],
                    ['text' => '10', 'is_correct' => false],
                    ['text' => '100', 'is_correct' => false],
                    ['text' => '1', 'is_correct' => false],
                ],
            ],
        ];

        foreach ($questions as $q) {
            QuestionBank::create([
                'created_by' => $guruId,
                'subject_id' => $subjectId,
                'category' => $q['category'],
                'question_text' => $q['question_text'],
                'question_type' => 'multiple_choice',
                'difficulty_level' => $q['difficulty_level'],
                'points' => 10,
                'explanation' => $q['explanation'],
                'options' => $q['options'],
                'usage_count' => 0,
            ]);
        }
    }

    private function createTests($guru1Id, $guru2Id, $matematikaId, $fisikaId)
    {
        // Test 1: Active Test (Matematika)
        $test1 = Test::create([
            'title' => 'Ujian Tengah Semester Matematika',
            'description' => 'Materi: Trigonometri, Aljabar, dan Geometri',
            'duration' => 90,
            'passing_score' => 70,
            'start_time' => now()->subDays(1),
            'end_time' => now()->addDays(7),
            'created_by' => $guru1Id,
            'subject' => 'Matematika',
            'kelas' => 'X MIPA 1, X MIPA 2',
            'is_active' => true,
        ]);

        // Add questions to test1
        $this->addQuestionsToTest($test1->id, [
            [
                'question_text' => 'Berapakah nilai sin 30°?',
                'options' => [
                    ['text' => '1/2', 'is_correct' => true],
                    ['text' => '1/3', 'is_correct' => false],
                    ['text' => '√2/2', 'is_correct' => false],
                    ['text' => '√3/2', 'is_correct' => false],
                ],
            ],
            [
                'question_text' => 'Berapakah nilai cos 60°?',
                'options' => [
                    ['text' => '1/2', 'is_correct' => true],
                    ['text' => '1', 'is_correct' => false],
                    ['text' => '√3/2', 'is_correct' => false],
                    ['text' => '0', 'is_correct' => false],
                ],
            ],
            [
                'question_text' => 'Hasil dari 2x + 3x adalah...',
                'options' => [
                    ['text' => '5x', 'is_correct' => true],
                    ['text' => '6x', 'is_correct' => false],
                    ['text' => '5', 'is_correct' => false],
                    ['text' => 'x', 'is_correct' => false],
                ],
            ],
        ]);

        // Test 2: Upcoming Test
        $test2 = Test::create([
            'title' => 'Ulangan Harian Matematika - Logaritma',
            'description' => 'Materi: Sifat-sifat logaritma dan penerapannya',
            'duration' => 60,
            'passing_score' => 75,
            'start_time' => now()->addDays(3),
            'end_time' => now()->addDays(5),
            'created_by' => $guru1Id,
            'subject' => 'Matematika',
            'kelas' => 'X MIPA 1',
            'is_active' => true,
        ]);

        $this->addQuestionsToTest($test2->id, [
            [
                'question_text' => 'Hasil dari log 100 adalah...',
                'options' => [
                    ['text' => '2', 'is_correct' => true],
                    ['text' => '10', 'is_correct' => false],
                    ['text' => '100', 'is_correct' => false],
                    ['text' => '1', 'is_correct' => false],
                ],
            ],
        ]);

        // Test 3: Draft Test
        $test3 = Test::create([
            'title' => 'Ujian Akhir Semester Matematika',
            'description' => 'Materi: Semua bab semester 1',
            'duration' => 120,
            'passing_score' => 70,
            'start_time' => now()->addDays(30),
            'end_time' => now()->addDays(32),
            'created_by' => $guru1Id,
            'subject' => 'Matematika',
            'kelas' => 'X MIPA 1, X MIPA 2',
            'is_active' => false, // Draft
        ]);

        // Test 4: Fisika Test
        $test4 = Test::create([
            'title' => 'Ulangan Harian Fisika - Gerak Lurus',
            'description' => 'Materi: GLB dan GLBB',
            'duration' => 60,
            'passing_score' => 70,
            'start_time' => now()->subDays(2),
            'end_time' => now()->addDays(5),
            'created_by' => $guru2Id,
            'subject' => 'Fisika',
            'kelas' => 'X MIPA 1',
            'is_active' => true,
        ]);

        $this->addQuestionsToTest($test4->id, [
            [
                'question_text' => 'Rumus GLB adalah...',
                'options' => [
                    ['text' => 's = v × t', 'is_correct' => true],
                    ['text' => 's = v × t²', 'is_correct' => false],
                    ['text' => 's = 1/2 × v × t', 'is_correct' => false],
                    ['text' => 's = v + t', 'is_correct' => false],
                ],
            ],
        ]);
    }

    private function addQuestionsToTest($testId, $questions)
    {
        foreach ($questions as $index => $q) {
            $question = Question::create([
                'test_id' => $testId,
                'question_text' => $q['question_text'],
                'question_type' => 'multiple_choice',
                'points' => 10,
                'order' => $index + 1,
            ]);

            foreach ($q['options'] as $optIndex => $option) {
                QuestionOption::create([
                    'question_id' => $question->id,
                    'option_text' => $option['text'],
                    'is_correct' => $option['is_correct'],
                    'order' => $optIndex + 1,
                ]);
            }
        }

        // Update total questions
        Test::where('id', $testId)->update([
            'total_questions' => count($questions)
        ]);
    }
}
