<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Reaction extends Model {
    use HasFactory;

    protected $fillable = ['user_id', 'post_id', 'type'];

    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function post() {
        return $this->belongsTo(Post::class, 'post_id');
    }
    
    public function createReactionNotification($receiverId, $senderName, $postId)
    {
        Notification::create([
            'id' => (string) Str::uuid(),
            'user_id' => $receiverId, 
            'type' => 'reaction',
            'content' => "{$senderName} thả cảm xúc vào bài viết của bạn",
            'link' => "{$postId}",
            'is_read' => false,
        ]);
    }
}
