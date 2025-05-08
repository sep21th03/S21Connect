<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
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
}
