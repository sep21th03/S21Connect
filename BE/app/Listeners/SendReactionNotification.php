<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Events\PostReacted;
use App\Models\Notification;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;

class SendReactionNotification
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(PostReacted  $event): void
    {
        $postOwner = $event->post->user;

        // Không tự gửi thông báo cho chính mình
        if ($postOwner->id === $event->reactor->id) {
            return;
        }
        $notificationId = (string) Str::uuid();
        $notification = Notification::create([
            'id' => $notificationId,
            'user_id' => $postOwner->id,
            'type' => 'reaction',
            'from_user_id' => $event->reactor->id,
            'content' => "{$event->reactor->name} thả cảm xúc {$event->reactionType} vào bài viết của bạn",
            'link' => "{$postOwner->username}/posts/{$event->post->id}?modal=true&reaction_id={$event->reaction->id}&notification_id={$notificationId}",
            'is_read' => false,
            'post_id' => $event->post->id,
        ]);



        Http::post("https://node-s21.codetifytech.io.vn/notification", [
            'id' => $notification->id,
            'userId' => $postOwner->id,
            'type' => 'reaction',
            'content' => $notification->content,
            'link' => $notification->link,
            'is_read' => $notification->is_read,
            'created_at' => $notification->created_at,
            'from_user' => [
                'id' => $event->reactor->id,
                'name' => $event->reactor->first_name . ' ' . $event->reactor->last_name,
                'avatar' => $event->reactor->avatar, 
            ],
            'post_id' => $event->post->id,
        ]);
    }
}
