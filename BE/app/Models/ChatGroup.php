<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ChatGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'owner_id',
    ];

    // Người sở hữu nhóm
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    // Thành viên trong nhóm
    public function users()
    {
        return $this->belongsToMany(User::class, 'chat_group_user', 'group_id', 'user_id');
    }

    // Tin nhắn trong nhóm
    public function messages()
    {
        return $this->hasMany(Messenger::class, 'group_id');
    }
}
