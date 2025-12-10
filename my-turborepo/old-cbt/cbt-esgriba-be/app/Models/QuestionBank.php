<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class QuestionBank extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'created_by',
        'subject_id',
        'category',
        'question_text',
        'question_type',
        'expected_answer',
        'difficulty_level',
        'points',
        'explanation',
        'options',
        'correct_answer',
        'usage_count',
    ];

    protected $casts = [
        'options' => 'array',
        'correct_answer' => 'array',
        'difficulty_level' => 'integer',
        'points' => 'integer',
        'usage_count' => 'integer',
    ];

    /**
     * Relationship: Creator (guru)
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship: Subject
     */
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Increment usage count
     */
    public function incrementUsage()
    {
        $this->increment('usage_count');
    }
}
