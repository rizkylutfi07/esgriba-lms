<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'attempt_id',
        'question_id',
        'option_id',
        'answer_text',
        'is_correct',
        'points_earned',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'points_earned' => 'integer',
    ];

    /**
     * Relationship: Test attempt
     */
    public function attempt()
    {
        return $this->belongsTo(TestAttempt::class, 'attempt_id');
    }

    /**
     * Relationship: Question
     */
    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * Relationship: Selected option
     */
    public function option()
    {
        return $this->belongsTo(QuestionOption::class, 'option_id');
    }
}
