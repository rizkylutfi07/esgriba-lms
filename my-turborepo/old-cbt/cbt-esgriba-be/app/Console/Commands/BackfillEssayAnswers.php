<?php

namespace App\Console\Commands;

use App\Models\Question;
use App\Models\QuestionBank;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BackfillEssayAnswers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backfill:essay-answers';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backfill expected_answer for existing essay questions from question banks';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to backfill essay answers...');

        // Get all essay questions without expected_answer
        $essayQuestions = Question::where('question_type', 'essay')
            ->whereNull('expected_answer')
            ->orWhere('expected_answer', '')
            ->get();

        $this->info("Found {$essayQuestions->count()} essay questions without expected_answer");

        if ($essayQuestions->isEmpty()) {
            $this->info('No questions to backfill. All essay questions already have expected_answer.');
            return 0;
        }

        $updated = 0;
        $notFound = 0;

        $progressBar = $this->output->createProgressBar($essayQuestions->count());
        $progressBar->start();

        foreach ($essayQuestions as $question) {
            // Try to find matching question in question_banks by question_text
            $bankQuestion = QuestionBank::where('question_text', $question->question_text)
                ->where('question_type', 'essay')
                ->first();

            if ($bankQuestion) {
                // Get expected_answer from bank question
                $expectedAnswer = $bankQuestion->expected_answer;

                // If still empty, try to get from correct_answer field
                if (empty($expectedAnswer) && !empty($bankQuestion->correct_answer)) {
                    $correctAnswer = $bankQuestion->correct_answer;
                    if (is_array($correctAnswer)) {
                        $expectedAnswer = implode(', ', array_filter($correctAnswer, fn($item) => $item !== null && $item !== ''));
                    } elseif (is_string($correctAnswer)) {
                        $expectedAnswer = $correctAnswer;
                    }
                }

                if (!empty($expectedAnswer)) {
                    $question->update(['expected_answer' => $expectedAnswer]);
                    $updated++;
                }
            } else {
                $notFound++;
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        $this->info("✓ Updated {$updated} questions with expected_answer");
        
        if ($notFound > 0) {
            $this->warn("⚠ Could not find matching question bank entries for {$notFound} questions");
            $this->warn("  These questions may need to be manually updated or re-imported from question bank");
        }

        $this->newLine();
        $this->info('Backfill completed successfully!');

        return 0;
    }
}
