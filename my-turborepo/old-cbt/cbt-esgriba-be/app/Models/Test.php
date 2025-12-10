<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Test extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'duration',
        'total_questions',
        'passing_score',
        'is_active',
        'cheat_detection_enabled',
        'start_time',
        'end_time',
        'created_by',
        'subject',
        'kelas',
        'session',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'cheat_detection_enabled' => 'boolean',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'duration' => 'integer',
        'total_questions' => 'integer',
        'passing_score' => 'integer',
        'session' => 'integer',
    ];

    /**
     * Relationship: Test creator (guru)
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship: Questions
     */
    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    /**
     * Relationship: Test attempts
     */
    public function attempts()
    {
        return $this->hasMany(TestAttempt::class);
    }

    /**
     * Relationship: Allowed students (Remedial assignment list)
     */
    public function allowedStudents()
    {
        return $this->belongsToMany(User::class, 'test_allowed_students', 'test_id', 'student_id')
            ->withTimestamps();
    }

    /**
     * Scope: Auto-deactivate tests that have passed their end_time
     */
    public function scopeAutoDeactivateExpired($query)
    {
        // Update expired tests to inactive using static method
        self::where('is_active', true)
            ->where('end_time', '<', now())
            ->update(['is_active' => false]);

        return $query;
    }

    /**
     * Scope: Only active and within time window
     */
    public function scopeCurrentlyActive($query)
    {
        return $query->where('is_active', true)
            ->where('start_time', '<=', now())
            ->where('end_time', '>=', now());
    }
}
