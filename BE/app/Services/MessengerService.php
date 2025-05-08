<?php

namespace App\Services;

use App\Models\Messenger;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class MessengerService
{
    public function sendMessage(array $data): Messenger
    {
        $sender_id = Auth::id();
        $message = new Messenger();
        $message->id = Str::uuid();
        $message->sender_id = $sender_id;
        $message->receiver_id = $data['receiver_id'] ?? null;
        $message->group_id = $data['group_id'] ?? null;
        $message->content = $data['content'] ?? null;
        $message->type = $data['type'];
        $message->file_paths = $data['file_paths'] ?? null;
        $message->is_read = false;
        $message->save();

        return $message;
    }

    public function getPrivateMessages($userId1, $userId2)
    {
        return Messenger::where(function ($query) use ($userId1, $userId2) {
            $query->where('sender_id', $userId1)->where('receiver_id', $userId2);
        })->orWhere(function ($query) use ($userId1, $userId2) {
            $query->where('sender_id', $userId2)->where('receiver_id', $userId1);
        })->orderBy('created_at', 'asc')->get();
    }

    public function getGroupMessages($groupId)
    {
        return Messenger::where('group_id', $groupId)->orderBy('created_at', 'asc')->get();
    }


}
