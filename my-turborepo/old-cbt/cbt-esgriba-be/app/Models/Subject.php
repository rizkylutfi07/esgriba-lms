<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'major_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function major()
    {
        return $this->belongsTo(Major::class);
    }

    public function tests()
    {
        return $this->hasMany(Test::class);
    }

    /**
     * Relationship: Teachers who teach this subject (many-to-many)
     */
    public function teachers()
    {
        return $this->belongsToMany(User::class, 'subject_user')
            ->where('role', 'guru')
            ->withTimestamps();
    }
}
