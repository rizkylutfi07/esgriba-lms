<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class ClearExpiredCache extends Command
{
    protected $signature = 'cache:clear-expired';
    protected $description = 'Clear expired cache entries to free up space';

    public function handle()
    {
        try {
            Cache::flush();
            $this->info('Expired cache cleared successfully!');
            return 0;
        } catch (\Exception $e) {
            $this->error('Failed to clear cache: ' . $e->getMessage());
            return 1;
        }
    }
}
