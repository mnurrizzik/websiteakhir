<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class File extends Model
{
    protected $table = 'files';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'original_name',
        'mime_type',
        'type',
        'size',
        'path',
        'project_id',
        'uploaded_by',
    ];

    protected static function booted(): void
    {
        static::creating(function (File $file) {
            if (empty($file->id)) {
                $file->id = Str::uuid()->toString();
            }
        });
    }
}