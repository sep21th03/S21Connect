<?php

namespace App\Events;

use App\Models\Messenger;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;

class MessageSent implements ShouldBroadcast
{
    use SerializesModels;

    public $message;

    public function __construct(Messenger $message)
    {
        $this->message = $message;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->message->receiver_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'message' => $this->message->load('sender')->toArray(),
            'receiver_id' => $this->message->receiver_id,
        ];
    }
}