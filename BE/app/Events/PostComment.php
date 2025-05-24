<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Comment;
use App\Models\User;

class PostComment
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $comment;
    public $commenter;
    /**
     * Create a new event instance.
     */

    public function __construct(Comment $comment, User $commenter)
    {
        $this->comment = $comment;
        $this->commenter = $commenter;
    }
}
