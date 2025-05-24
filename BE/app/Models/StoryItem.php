<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Facades\DB;

class StoryItem extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'story_id',
        'type',
        'file_url',
        'text',
        'text_position',
        'text_style',
        'background',
        'duration',
    ];

    protected $casts = [
        'text_position' => 'array',
        'text_style' => 'array',
    ];

    public function story()
    {
        return $this->belongsTo(Story::class);
    }

    public function views()
    {
        return $this->hasMany(DB::table('story_item_views')->getQuery(), 'story_item_id', 'id');
    }
}
