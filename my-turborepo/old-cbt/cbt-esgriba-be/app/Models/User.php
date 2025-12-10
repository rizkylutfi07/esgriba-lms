<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'gender',
        'birth_date',
        'birth_place',
        'religion',
        'nip',
        'nisn',
        'nis',
        'kelas',
        'jurusan',
        'phone',
        'address',
        'avatar',
        'is_active',
        'class_id',
        'major_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role,
            'name' => $this->name,
        ];
    }

    /**
     * Check if user is admin
     */
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is guru (teacher)
     */
    public function isGuru()
    {
        return $this->role === 'guru';
    }

    /**
     * Check if user is siswa (student)
     */
    public function isSiswa()
    {
        return $this->role === 'siswa';
    }

    /**
     * Relationship: Tests created by guru
     */
    public function testsCreated()
    {
        return $this->hasMany(Test::class, 'created_by');
    }

    /**
     * Relationship: Test attempts by siswa
     */
    public function testAttempts()
    {
        return $this->hasMany(TestAttempt::class, 'user_id');
    }

    /**
     * Relationship: Subjects taught by guru (many-to-many)
     */
    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'subject_user')
            ->withTimestamps();
    }

    /**
     * Relationship: Class (for students)
     */
    public function class()
    {
        return $this->belongsTo(Classes::class, 'class_id');
    }

    /**
     * Relationship: Major (for students)
     */
    public function major()
    {
        return $this->belongsTo(Major::class, 'major_id');
    }

    /**
     * Relationship: Remedial / allowed tests (pivot from test_allowed_students)
     */
    public function remedialTests()
    {
        return $this->belongsToMany(Test::class, 'test_allowed_students', 'student_id', 'test_id')
            ->withTimestamps();
    }
}
