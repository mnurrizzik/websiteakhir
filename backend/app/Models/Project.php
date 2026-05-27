<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Project extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'category',
        'client',
        'client_id',
        'admin_id',
        'status',
        'progress',
        'deadline',
        'description',
    ];

    // FIX: cast deadline sebagai date supaya Laravel otomatis konversi ke Carbon object
    protected $casts = [
        'deadline' => 'date',
    ];

    protected static function booted(): void
    {
        static::creating(function (Project $project) {
            if (empty($project->id)) {
                $project->id = Str::uuid()->toString();
            }
        });
    }
}