<?php

namespace App\Console\Commands;

use App\Models\Question;
use App\Models\QuestionBank;
use Illuminate\Console\Command;

class CheckMissingEssayAnswers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:missing-essay-answers';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check essay questions missing expected_answer';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for essay questions without expected_answer...');
        $this->newLine();

        // Check Question Banks
        $bankCount = QuestionBank::where('question_type', 'essay')
            ->where(function($q) {
                $q->whereNull('expected_answer')
                  ->orWhere('expected_answer', '');
            })
            ->count();

        $this->warn("📚 Question Bank: {$bankCount} essay questions WITHOUT expected_answer");

        // Check Questions in Tests
        $testCount = Question::where('question_type', 'essay')
            ->where(function($q) {
                $q->whereNull('expected_answer')
                  ->orWhere('expected_answer', '');
            })
            ->count();

        $this->warn("📝 Test Questions: {$testCount} essay questions WITHOUT expected_answer");

        $this->newLine();
        
        if ($bankCount > 0 || $testCount > 0) {
            $this->error('⚠ MASALAH DITEMUKAN!');
            $this->info('Solusi yang dapat dilakukan:');
            $this->info('1. Re-import soal dari file DOCX (setelah memastikan format benar)');
            $this->info('2. Edit manual kunci jawaban di Question Bank untuk setiap soal');
            $this->info('3. Untuk soal yang sudah ada di test, akan otomatis ter-update saat import ulang dari Question Bank');
        } else {
            $this->info('✓ Semua soal essay memiliki kunci jawaban!');
        }

        $this->newLine();
        
        return 0;
    }
}
