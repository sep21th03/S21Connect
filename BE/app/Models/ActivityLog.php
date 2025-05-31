<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'id', 'user_id', 'action', 'target_type', 'target_id', 'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'id' => 'string',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function target()
    {
        return $this->morphTo();
    }
}
