<?php

namespace App\Listeners;

use App\Events\PostComment;
use App\Models\Notification;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use App\Models\Comment;
use Illuminate\Support\Facades\Log;

class SendCommentNotification
{
    public function handle(PostComment  $event): void
    {
        $comment = $event->comment;
        $commenter = $event->commenter;

        $notifiedUser = null;

        if ($comment->parent_id) {
            $parentComment = Comment::select('user_id')->with('user:id,username')->find($comment->parent_id);
            $notifiedUser = $parentComment?->user;
        } else {
            $notifiedUser = $comment->post->user;
        }


        if (!$notifiedUser || $notifiedUser->id === $commenter->id) {
            return;
        }
        $notificationId = (string) Str::uuid();

        $isReply = !is_null($comment->parent_id);

        $notificationContent = $isReply
            ? "{$commenter->first_name} {$commenter->last_name} đã trả lời bình luận của bạn"
            : "{$commenter->first_name} {$commenter->last_name} đã bình luận bài viết của bạn";

        $notificationLink = $isReply
            ? "{$notifiedUser->username}/posts/{$comment->post_id}?modal=true&comment_id={$comment->parent_id}&reply_comment_id={$comment->id}&notification_id={$notificationId}"
            : "{$notifiedUser->username}/posts/{$comment->post_id}?modal=true&comment_id={$comment->id}&notification_id={$notificationId}";


        $notification = Notification::create([
            'id' => $notificationId,
            'user_id' => $notifiedUser->id,
            'type' => 'comment',
            'from_user_id' => $commenter->id,
            'content' => $notificationContent,
            'link' => $notificationLink,
            'is_read' => false,
            'post_id' => $comment->post_id,
        ]);



        try {
            $response = Http::post("http://localhost:3001/notification", [
                'id' => $notification->id,
                'userId' => $notifiedUser->id,
                'type' => 'comment',
                'content' => $notification->content,
                'link' => $notification->link,
                'is_read' => $notification->is_read,
                'created_at' => $notification->created_at,
                'from_user' => [
                    'id' => $commenter->id,
                    'name' => $commenter->first_name . ' ' . $commenter->last_name,
                    'avatar' => $commenter->avatar,
                ],
                'post_id' => $comment->post_id,
            ]);

            Log::info('Notification sent to Node.js server.', ['response' => $response->body()]);
        } catch (\Exception $e) {
            Log::error('Failed to send notification to Node.js server.', ['error' => $e->getMessage()]);
        }
    }
}
