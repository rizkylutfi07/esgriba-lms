<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== CLEANING UP INVALID ATTEMPTS ===\n\n";

// Find attempts where user has both completed and in_progress for same test
$invalidAttempts = DB::select("
    SELECT ta1.id, ta1.test_id, ta1.user_id, ta1.status, ta1.started_at
    FROM test_attempts ta1
    WHERE ta1.status = 'in_progress'
    AND EXISTS (
        SELECT 1 FROM test_attempts ta2
        WHERE ta2.test_id = ta1.test_id
        AND ta2.user_id = ta1.user_id
        AND ta2.status = 'completed'
        AND ta2.id < ta1.id
    )
");

if (empty($invalidAttempts)) {
    echo "No invalid attempts found.\n";
} else {
    echo "Found " . count($invalidAttempts) . " invalid attempts:\n\n";
    
    foreach ($invalidAttempts as $attempt) {
        $user = App\Models\User::find($attempt->user_id);
        $test = App\Models\Test::find($attempt->test_id);
        
        echo "Attempt ID: " . $attempt->id . "\n";
        echo "User: " . ($user ? $user->name : 'Unknown') . "\n";
        echo "Test: " . ($test ? $test->title : 'Unknown') . "\n";
        echo "Started: " . $attempt->started_at . "\n";
        
        // Delete the invalid attempt
        $deleted = App\Models\TestAttempt::where('id', $attempt->id)->delete();
        
        if ($deleted) {
            echo "✓ DELETED\n\n";
        } else {
            echo "✗ FAILED TO DELETE\n\n";
        }
    }
    
    echo "\n=== CLEANUP COMPLETE ===\n";
}
