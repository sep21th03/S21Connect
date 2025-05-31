<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Messenger extends Model
{
    use HasFactory;

    protected $table = 'messages';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'group_id',
        'content',
        'type',
        'file_paths',
        'is_read',
        'read_at',
        'conversation_id',
        'metadata',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'metadata' => 'array',
    ];

    // Người gửi
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    // Người nhận (nếu là tin nhắn cá nhân)
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    // Nhóm (nếu là tin nhắn nhóm)
    public function group()
    {
        return $this->belongsTo(ChatGroup::class, 'group_id');
    }

    protected static function booted()
    {
        static::creating(function ($message) {
            $message->id = Str::uuid();
        });
    }

    public function getFilesAttribute()
    {
        if (empty($this->file_paths)) {
            return [];
        }

        return json_decode($this->file_paths, true);
    }

    /**
     * Get URL for accessing this specific message
     */
    public function getUrl()
    {
        return url("/chat/{$this->conversation_id}?message={$this->id}");
    }
}
