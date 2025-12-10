<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuestionPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'subject_id',
        'created_by',
        'difficulty_level',
        'total_questions',
        'total_points',
    ];

    protected $casts = [
        'total_questions' => 'integer',
        'total_points' => 'integer',
    ];

    /**
     * Get the subject that owns the package
     */
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the creator of the package
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the questions in this package
     */
    public function questions()
    {
        return $this->belongsToMany(QuestionBank::class, 'package_questions', 'package_id', 'question_id')
            ->withPivot('order')
            ->withTimestamps()
            ->orderBy('package_questions.order');
    }

    /**
     * Update package statistics
     */
    public function updateStatistics()
    {
        $questions = $this->questions;
        $this->total_questions = $questions->count();
        $this->total_points = $questions->sum('points');
        $this->save();
    }
}
