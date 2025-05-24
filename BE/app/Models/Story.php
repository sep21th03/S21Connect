<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Story extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'expires_at',
    ];

    protected $dates = [
        'expires_at',
        'created_at',
        'updated_at',
    ];

    public function items()
    {
        return $this->hasMany(StoryItem::class)->orderBy('created_at', 'asc');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
