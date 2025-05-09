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

class MessengerController extends Controller
{
    /**
     * Send a new Message
     */
    public function send(Request $request)
    {
        $request->validate([
            'content' => 'required_without:file_paths',
            'receiver_id' => 'required_without:conversation_id|uuid|exists:users,id',
            'conversation_id' => 'required_without:receiver_id|uuid|exists:conversations,id',
            'type' => 'sometimes|in:text,image,video,sticker,file',
            'file_paths' => 'sometimes|array'
        ]);

        // Lấy hoặc tạo conversation
        if ($request->filled('conversation_id')) {
            $conversation = Conversation::findOrFail($request->conversation_id);
            $isParticipant = $conversation->users()->where('user_id', Auth::id())->exists();
            if (!$isParticipant) {
                return response()->json(['error' => 'You are not a participant in this conversation'], 403);
            }
        } else {
            // Tạo hoặc lấy cuộc trò chuyện riêng tư
            $receiver = User::findOrFail($request->receiver_id);
            $conversation = Conversation::firstOrCreatePrivateConversation(Auth::user(), $receiver);
        }

        // Tạo tin nhắn
        $message = new Messenger();
        $message->sender_id = Auth::id();
        $message->conversation_id = $conversation->id;
        $message->content = $request->content;
        $message->type = $request->type ?? 'text';

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
        Auth::user()->markConversationAsRead($conversation);

        // Trả về message
        $messageWithSender = $message->toArray();
        $messageWithSender['sender'] = Auth::user()->only(['id', 'username', 'first_name', 'last_name']);
        $messageWithSender['url'] = $message->getUrl();

        return response()->json($messageWithSender, 201);
    }

    /**
     * Mark Messages as read
     */
    public function markAsRead(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|uuid|exists:conversations,id',
        ]);

        $conversationId = $request->conversation_id;
        $now = now();

        // Check if user is in the conversation
        $conversation = Conversation::findOrFail($conversationId);
        $isParticipant = $conversation->users()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'You are not a participant in this conversation'], 403);
        }

        // If private conversation, mark messages from the other user as read
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
            // For group conversations, only mark as read
            $updatedRows = 0;
        }

        // Update the user's last_read_at for this conversation
        Auth::user()->markConversationAsRead($conversation);

        return response()->json([
            'success' => true,
            'updated_rows' => $updatedRows,
            'read_at' => $now
        ]);
    }

    /**
     * Get messages for a conversation with pagination
     */
    public function getMessages(Request $request, $conversationId)
    {
        $conversation = Conversation::findOrFail($conversationId);

        // Check if user is in the conversation
        $isParticipant = $conversation->users()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'You are not a participant in this conversation'], 403);
        }

        $perPage = $request->query('per_page', 20);
        $page = $request->query('page', 1);

        $messages = Messenger::where('conversation_id', $conversationId)
            ->orderBy('created_at', 'desc')
            ->with(['sender:id,username,first_name,last_name,last_active'])
            ->paginate($perPage, ['*'], 'page', $page);

        // Mark messages as read automatically
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

        // Update the user's last_read_at for this conversation
        Auth::user()->markConversationAsRead($conversation);

        // Add URL to each message
        // $messages->through(function ($message) {
        //     $message->url = $message->getUrl();
        //     return $message;
        // });

        return response()->json($messages);
    }

    /**
     * Get a specific message
     */
    public function getMessage($id)
    {
        $message = Messenger::with('sender:id,username,first_name,last_name')->findOrFail($id);

        // Check if user is in the conversation
        $conversation = $message->conversation;
        $isParticipant = $conversation->users()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'You are not authorized to view this message'], 403);
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

                // Với private conversation: lấy user còn lại
                if ($conversation->type === 'private') {
                    $otherUser = $conversation->users->firstWhere('id', '!=', $user->id);
                    $name = trim($otherUser->first_name . ' ' . $otherUser->last_name);
                    $username = $otherUser->username;
                    $lastActive = $otherUser->last_active;
                } else {
                    // group
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


    /**
     * Delete a message
     */
    public function delete($id)
    {
        $message = Messenger::findOrFail($id);

        // Check if user is the sender of the message
        if ($message->sender_id !== Auth::id()) {
            return response()->json(['error' => 'You can only delete your own messages'], 403);
        }

        // Delete files if they exist
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

    /**
     * Upload files for Messages
     */
    public function uploadFiles(Request $request)
    {
        $request->validate([
            'files.*' => 'required|file|max:10240', // 10MB max per file
            'conversation_id' => 'required|uuid|exists:conversations,id'
        ]);

        // Check if user is in the conversation
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

                // Determine file type
                $mimeType = $file->getMimeType();
                $type = 'file';

                if (strpos($mimeType, 'image') !== false) {
                    $type = 'image';
                } elseif (strpos($mimeType, 'video') !== false) {
                    $type = 'video';
                }

                // For images and videos, save to the images table as well
                if ($type === 'image' || $type === 'video') {
                    $url = Storage::disk('public')->url($path);

                    $image = new Image();
                    $image->id = Str::uuid();
                    $image->user_id = Auth::id();
                    $image->url = $url;
                    $image->public_id = basename($path);
                    $image->folder = 'message';
                    $image->type = $type;

                    // Get image dimensions if it's an image
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
     * Search messages within a conversation
     */
    public function search(Request $request, $conversationId)
    {
        $request->validate([
            'query' => 'required|string|min:2',
        ]);

        $conversation = Conversation::findOrFail($conversationId);

        // Check if user is in the conversation
        $isParticipant = $conversation->users()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'You are not a participant in this conversation'], 403);
        }

        $query = $request->query;

        $messages = Messenger::where('conversation_id', $conversationId)
            ->where('content', 'LIKE', "%{$query}%")
            ->orderBy('created_at', 'desc')
            ->with(['sender:id,username,first_name,last_name'])
            ->paginate(20);

        // Add URL to each message
        $messages->through(function ($message) {
            $message->url = $message->getUrl();
            return $message;
        });

        return response()->json($messages);
    }
}
