<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Post;
use App\Models\User;
use App\Models\Reaction;

class PostReacted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $post;
    public $reactor;
    public $reactionType;
    public $reaction;
    /**
     * Create a new event instance.
     */

    public function __construct(Post $post, User $reactor, string $reactionType, Reaction $reaction)
    {
        $this->post = $post;
        $this->reactor = $reactor;
        $this->reactionType = $reactionType;
        $this->reaction = $reaction;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('channel-name'),
        ];
    }
}
