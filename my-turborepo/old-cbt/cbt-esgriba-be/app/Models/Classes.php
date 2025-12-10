<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Classes extends Model
{
    use HasFactory;

    protected $fillable = [
        'major_id',
        'class_name',
        'homeroom_teacher',
        'capacity',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function major()
    {
        return $this->belongsTo(Major::class);
    }

    public function users()
    {
        return $this->hasMany(User::class, 'class_id');
    }

    public function tests()
    {
        return $this->hasMany(Test::class, 'class_id');
    }
}
