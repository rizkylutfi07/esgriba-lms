<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestAttemptEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'attempt_id',
        'event_type',
        'triggered_by',
        'description',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function attempt()
    {
        return $this->belongsTo(TestAttempt::class, 'attempt_id');
    }
}
