<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'capacity',
        'floor',
        'building',
        'facilities',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function tests()
    {
        return $this->hasMany(Test::class);
    }
}
