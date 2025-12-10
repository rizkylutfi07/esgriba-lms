<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Cari AGUS WIRA ADI PURNOMO
echo "=== CHECKING AGUS WIRA ADI PURNOMO ===\n";
$agus = App\Models\User::where('name', 'LIKE', '%AGUS WIRA%')->first();

if ($agus) {
    echo "User ID: " . $agus->id . "\n";
    echo "Name: " . $agus->name . "\n";
    echo "NIS: " . ($agus->nisn ?? 'N/A') . "\n\n";
    
    // Cek attempts untuk test 55
    echo "=== ATTEMPTS FOR TEST 55 (SIMULASI SAS) ===\n";
    $attempts = App\Models\TestAttempt::where('user_id', $agus->id)
        ->where('test_id', 55)
        ->orderBy('id', 'desc')
        ->get();
    
    if ($attempts->count() > 0) {
        foreach ($attempts as $attempt) {
            echo "\nAttempt ID: " . $attempt->id . "\n";
            echo "Status: " . $attempt->status . "\n";
            echo "Is Blocked: " . ($attempt->is_blocked ? 'YES' : 'NO') . "\n";
            echo "Started: " . $attempt->started_at . "\n";
            echo "Finished: " . ($attempt->finished_at ?? 'NULL') . "\n";
            echo "Score: " . ($attempt->score ?? 'NULL') . "\n";
            
            // Count answers
            $answerCount = App\Models\UserAnswer::where('attempt_id', $attempt->id)->count();
            echo "Answers: " . $answerCount . "\n";
        }
        
        echo "\n=== LATEST ATTEMPT (MAX ID) ===\n";
        $latestId = $attempts->max('id');
        echo "Latest Attempt ID: " . $latestId . "\n";
        $latest = $attempts->firstWhere('id', $latestId);
        if ($latest) {
            echo "Status: " . $latest->status . "\n";
            echo "Finished: " . ($latest->finished_at ?? 'NULL') . "\n";
        }
    } else {
        echo "No attempts found for test 55\n";
    }
} else {
    echo "AGUS not found!\n";
}
