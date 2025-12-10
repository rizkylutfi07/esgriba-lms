<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'test_id',
        'user_id',
        'started_at',
        'finished_at',
        'score',
        'is_passed',
        'status',
        'is_blocked',
        'blocked_at',
        'blocked_reason',
        'cheat_count',
        'last_activity_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'score' => 'float',
        'is_passed' => 'boolean',
        'is_blocked' => 'boolean',
        'blocked_at' => 'datetime',
        'last_activity_at' => 'datetime',
    ];

    /**
     * Relationship: Test
     */
    public function test()
    {
        return $this->belongsTo(Test::class);
    }

    /**
     * Relationship: User (student)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship: User answers
     */
    public function answers()
    {
        return $this->hasMany(UserAnswer::class, 'attempt_id');
    }

    public function events()
    {
        return $this->hasMany(TestAttemptEvent::class, 'attempt_id');
    }
}
