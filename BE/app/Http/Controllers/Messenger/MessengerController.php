<?php

namespace App\Http\Controllers\Messenger;

use App\Http\Controllers\Controller;
use App\Models\Messenger;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\Image;
use App\Events\MessageSent;

class MessengerController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'content' => 'required_without:file_paths',
            'receiver_id' => 'required_without:conversation_id|uuid|exists:users,id',
            'conversation_id' => 'required_without:receiver_id|uuid|exists:conversations,id',
            'type' => 'sometimes|in:text,image,video,sticker,file,share_post',
            'file_paths' => 'sometimes|array',
            'metadata' => 'sometimes|array',
            'metadata.post_id' => 'nullable|numeric|exists:posts,id',
            'metadata.image' => 'nullable|string',
            'metadata.url' => 'nullable|string',
            'metadata.content' => 'nullable|string',
        ]);

        if ($request->receiver_id) {
            $receiver = User::find($request->receiver_id);
            if ($receiver && $receiver->status === 'banned') {
                return response()->json(['message' => 'Người nhận không khả dụng'], 403);
            }
        }

        if ($request->filled('conversation_id')) {
            $conversation = Conversation::findOrFail($request->conversation_id);
            $isParticipant = $conversation->users()->where('user_id', Auth::id())->exists();
            if (!$isParticipant) {
                return response()->json(['error' => 'không phải của bạn'], 403);
            }
        } else {
            $receiver = User::findOrFail($request->receiver_id);
            $conversation = Conversation::firstOrCreatePrivateConversation(Auth::user(), $receiver);
        }

        $conversation->users()->updateExistingPivot(Auth::id(), ['is_archived' => false]);


        $message = new Messenger();
        $message->sender_id = Auth::id();
        $message->conversation_id = $conversation->id;
        $message->content = $request->content;
        $message->type = $request->type ?? 'text';
        $message->metadata = json_encode($request->metadata ?? []);

        if ($conversation->type === 'private') {
            $otherUser = $conversation->users()->where('user_id', '!=', Auth::id())->first();
            if ($otherUser) {
                $message->receiver_id = $otherUser->id;
            }
        }

        if ($request->has('file_paths')) {
            $message->file_paths = json_encode($request->file_paths);
        }

        $message->save();
        $conversation->update([
            'last_message_id' => $message->id,
            'updated_at' => now()
        ]);

        event(new MessageSent($message));

        Auth::user()->markConversationAsRead($conversation);

        $messageWithSender = $message->toArray();
        $messageWithSender['sender'] = Auth::user()->only(['id', 'username', 'first_name', 'last_name']);
        $messageWithSender['url'] = $message->getUrl();

        return response()->json($messageWithSender, 201);
    }

    public function markAsRead(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|uuid|exists:conversations,id',
        ]);

        $conversationId = $request->conversation_id;
        $now = now();

        $conversation = Conversation::findOrFail($conversationId);
        $isParticipant = $conversation->users()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'You are not a participant in this conversation'], 403);
        }

        if ($conversation->type === 'private') {
            $updatedRows = Messenger::where('conversation_id', $conversationId)
                ->where('sender_id', '!=', Auth::id())
                ->where('receiver_id', Auth::id())
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => $now
                ]);
        } else {

            $updatedRows = 0;
        }

        Auth::user()->markConversationAsRead($conversation);

        return response()->json([
            'success' => true,
            'updated_rows' => $updatedRows,
            'read_at' => $now
        ]);
    }

    public function getMessages(Request $request, $conversationId)
    {
        $conversation = Conversation::findOrFail($conversationId);

        $isParticipant = $conversation->users()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'Bạn không thuộc về cuộc trò chuyện này'], 403);
        }

        $perPage = $request->query('per_page', 20);
        $page = $request->query('page', 1);

        $messages = Messenger::where('conversation_id', $conversationId)
            ->orderBy('created_at', 'desc')
            ->with(['sender:id,username,first_name,last_name,last_active'])
            ->paginate($perPage, ['*'], 'page', $page);

        if ($conversation->type === 'private') {
            Messenger::where('conversation_id', $conversationId)
                ->where('sender_id', '!=', Auth::id())
                ->where('receiver_id', Auth::id())
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now()
                ]);
        }

        Auth::user()->markConversationAsRead($conversation);


        return response()->json($messages);
    }

    public function searchMessages(Request $request, $conversationId)
    {
        $conversation = Conversation::findOrFail($conversationId);

        $isParticipant = $conversation->users()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'Bạn không thuộc về cuộc trò chuyện này'], 403);
        }

        $query = $request->query('query');
        if (!$query) {
            return response()->json(['error' => 'Yêu cầu từ khóa tìm kiếm'], 400);
        }

        $perPage = $request->query('per_page', 20);
        $page = $request->query('page', 1);

        $messages = Messenger::where('conversation_id', $conversationId)
            ->where('content', 'LIKE', '%' . $query . '%')
            ->orderBy('created_at', 'desc')
            ->with(['sender:id,username,first_name,last_name,last_active'])
            ->paginate($perPage, ['*'], 'page', $page);


        return response()->json($messages);
    }

    public function getMessage($id)
    {
        $message = Messenger::with('sender:id,username,first_name,last_name')->findOrFail($id);

        $conversation = $message->conversation;
        $isParticipant = $conversation->users()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'Bạn không thể xem'], 403);
        }

        $message->url = $message->getUrl();

        return response()->json($message);
    }

    public function getRecentConversations()
    {
        $user = Auth::user();

        $conversations = $user->conversations()
            ->with([
                'users:id,username,first_name,last_name,last_active',
                'latestMessage.sender:id,username,first_name,last_name,last_active'
            ])
            ->withCount([
                'messages as unread_count' => function ($query) use ($user) {
                    $query->where('receiver_id', $user->id)
                        ->where('is_read', false);
                }
            ])
            ->orderByDesc(
                Messenger::select('created_at')
                    ->whereColumn('conversation_id', 'conversations.id')
                    ->latest()
                    ->take(1)
            )
            ->get()
            ->map(function ($conversation) use ($user) {
                $latestMessage = $conversation->latestMessage;

                if ($conversation->type === 'private') {
                    $otherUser = $conversation->users->firstWhere('id', '!=', $user->id);
                    $name = trim($otherUser->first_name . ' ' . $otherUser->last_name);
                    $username = $otherUser->username;
                    $lastActive = $otherUser->last_active;
                } else {
                    $name = $conversation->name;
                    $username = null;
                    $lastActive = null;
                }

                return [
                    'id' => $conversation->id,
                    'name' => $name,
                    'username' => $username,
                    'conversation_type' => $conversation->type,
                    'latest_message' => $latestMessage ? [
                        'id' => $latestMessage->id,
                        'content' => $latestMessage->content,
                        'type' => $latestMessage->type,
                        'created_at' => $latestMessage->created_at,
                        'sender_id' => $latestMessage->sender_id,
                        'sender' => $latestMessage->sender
                    ] : null,
                    'unread_count' => $conversation->unread_count,
                    'last_active' => $lastActive,
                    'url' => $conversation->getUrl()
                ];
            });

        return response()->json($conversations);
    }


    public function delete($id)
    {
        $message = Messenger::findOrFail($id);

        if ($message->sender_id !== Auth::id()) {
            return response()->json(['error' => 'You can only delete your own messages'], 403);
        }

        if (!empty($message->file_paths)) {
            $files = json_decode($message->file_paths, true);
            foreach ($files as $file) {
                if (isset($file['path'])) {
                    Storage::disk('public')->delete($file['path']);
                }
            }
        }

        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'Message deleted successfully'
        ]);
    }


    public function uploadFiles(Request $request)
    {
        $request->validate([
            'files.*' => 'required|file|max:10240',
            'conversation_id' => 'required|uuid|exists:conversations,id'
        ]);

        $conversation = Conversation::findOrFail($request->conversation_id);
        $isParticipant = $conversation->users()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'You are not a participant in this conversation'], 403);
        }

        $uploadedFiles = [];

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('message_files/' . Auth::id(), 'public');

                $mimeType = $file->getMimeType();
                $type = 'file';

                if (strpos($mimeType, 'image') !== false) {
                    $type = 'image';
                } elseif (strpos($mimeType, 'video') !== false) {
                    $type = 'video';
                }

                if ($type === 'image' || $type === 'video') {
                    $url = Storage::disk('public')->url($path);

                    $image = new Image();
                    $image->id = Str::uuid();
                    $image->user_id = Auth::id();
                    $image->url = $url;
                    $image->public_id = basename($path);
                    $image->folder = 'message';
                    $image->type = $type;

                    if ($type === 'image') {
                        $dimensions = getimagesize(Storage::disk('public')->path($path));
                        if ($dimensions) {
                            $image->width = $dimensions[0];
                            $image->height = $dimensions[1];
                        }
                    }

                    $image->save();

                    $uploadedFiles[] = [
                        'path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $mimeType,
                        'size' => $file->getSize(),
                        'type' => $type,
                        'image_id' => $image->id,
                        'url' => $url
                    ];
                } else {
                    $uploadedFiles[] = [
                        'path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $mimeType,
                        'size' => $file->getSize(),
                        'type' => $type,
                        'url' => Storage::disk('public')->url($path)
                    ];
                }
            }
        }

        return response()->json($uploadedFiles);
    }

    /**
     * search cuộc hội thoại
     */
    public function search(Request $request, $conversationId)
    {
        $request->validate([
            'query' => 'required|string|min:2',
        ]);

        $conversation = Conversation::findOrFail($conversationId);

        $isParticipant = $conversation->users()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'Bạn không phải thành viên'], 403);
        }

        $query = $request->query;

        $messages = Messenger::where('conversation_id', $conversationId)
            ->where('content', 'LIKE', "%{$query}%")
            ->orderBy('created_at', 'desc')
            ->with(['sender:id,username,first_name,last_name'])
            ->paginate(20);

        $messages->through(function ($message) {
            $message->url = $message->getUrl();
            return $message;
        });

        return response()->json($messages);
    }


    //lưu trữ 
    public function archive(Request $request, $conversationId)
    {
        $request->validate([
            'is_archived' => 'required|boolean',
        ]);

        $user = Auth::user();

        $conversation = Conversation::findOrFail($conversationId);

        $isParticipant = $conversation->users()->where('user_id', $user->id)->exists();
        if (!$isParticipant) {
            return response()->json(['error' => 'Bạn không tham gia cuộc hội thoại này'], 403);
        }

        $conversation->users()->updateExistingPivot($user->id, [
            'is_archived' => $request->input('is_archived')
        ]);

        return response()->json([
            'message' => $request->input('is_archived') ? 'Cuộc hội thoại đã được lưu trữ' : 'Cuộc hội thoại đã được mở lại',
            'is_archived' => $request->input('is_archived'),
        ]);
    }
}
