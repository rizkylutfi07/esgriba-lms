<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'test_id',
        'question_text',
        'question_type',
        'expected_answer',
        'points',
        'order',
        'image_url',
    ];

    protected $casts = [
        'points' => 'integer',
        'order' => 'integer',
    ];

    /**
     * Relationship: Parent test
     */
    public function test()
    {
        return $this->belongsTo(Test::class);
    }

    /**
     * Relationship: Answer options
     */
    public function options()
    {
        return $this->hasMany(QuestionOption::class);
    }

    /**
     * Relationship: User answers
     */
    public function answers()
    {
        return $this->hasMany(UserAnswer::class);
    }
}
