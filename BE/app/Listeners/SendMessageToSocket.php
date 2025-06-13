<?php

namespace App\Listeners;

use App\Events\MessageSent;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendMessageToSocket
{
    public function handle(MessageSent $event)
    {
        try {
            $message = $event->message->load('sender');

            $response = Http::timeout(5)->post('https://node.codetifytech.io.vn/notification-message', [
                'event' => 'new-message',
                'data' => [
                    'message' => [
                        'id' => $message->conversation_id,
                        'type' => $message->type,
                        'created_at' => $message->created_at->toISOString(),
                        'updated_at' => $message->updated_at->toISOString(),
                        'unread_count' => 0,
                        'other_user' => [
                            'id' => $message->sender->id,
                            'username' => $message->sender->username,
                            'name' => $message->sender->first_name . ' ' . $message->sender->last_name,
                            'last_active' => $message->sender->last_active,
                            'avatar' => $message->sender->avatar_url, 
                        ],
                        'latest_message' => [
                            'id' => $message->id,
                            'content' => $message->content,
                            'type' => $message->type,
                            'created_at' => $message->created_at->toISOString(),
                            'sender_id' => $message->sender_id,
                            'sender_name' => $message->sender->first_name . ' ' . $message->sender->last_name,
                        ],
                    ],
                    'receiver_id' => $message->receiver_id,
                ],
            ]);

            if ($response->successful()) {
                Log::info('Message sent to socket server successfully', [
                    'message_id' => $message->id,
                    'receiver_id' => $message->receiver_id
                ]);
            } else {
                Log::error('Failed to send message to socket server', [
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error sending message to socket server: ' . $e->getMessage(), [
                'message_id' => $event->message->id,
                'exception' => $e
            ]);
        }
    }
}
