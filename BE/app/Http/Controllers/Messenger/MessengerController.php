<?php

namespace App\Http\Controllers\Messenger;

use App\Http\Controllers\Controller;
use App\Models\Messenger;
use App\Models\ChatGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;


class MessengerController extends Controller
{
    /**
     * Send a new Messenger
     */
    public function send(Request $request)
    {
        $request->validate([
            'content' => 'required_without:file_paths',
            'receiver_id' => 'required_without:group_id|uuid|exists:users,id',
            'group_id' => 'required_without:receiver_id|uuid|exists:chat_groups,id',
            'type' => 'sometimes|in:text,image,video,sticker,file',
            'file_paths' => 'sometimes|array'
        ]);

        if ($request->has('group_id')) {
            $group = ChatGroup::findOrFail($request->group_id);
            $isMember = $group->users()->where('user_id', Auth::id())->exists();

            if (!$isMember) {
                return response()->json(['error' => 'You are not a member of this group'], 403);
            }
        }

        $Messenger = new Messenger();
        $Messenger->id = Str::uuid();
        $Messenger->sender_id = Auth::id();
        $Messenger->content = $request->content;
        $Messenger->type = $request->type ?? 'text';

        if ($request->has('file_paths')) {
            $Messenger->file_paths = json_encode($request->file_paths);
        }

        if ($request->has('receiver_id')) {
            $Messenger->receiver_id = $request->receiver_id;
        } else {
            $Messenger->group_id = $request->group_id;
        }

        $Messenger->save();

        // Include sender info in the response
        $MessengerWithSender = $Messenger->toArray();
        $MessengerWithSender['sender'] = Auth::user()->only(['id', 'username', 'name']);

        return response()->json($MessengerWithSender, 201);
    }

    /**
     * Mark Messengers as read
     */
    public function markAsRead(Request $request)
    {
        // Validate receiver_id và danh sách Messenger_ids
        $request->validate([
            'receiver_id' => 'required|uuid|exists:users,id',
        ]);
    
        $now = now();
        $receiver_id = $request->receiver_id;
    
        // Cập nhật tất cả tin nhắn với receiver_id thành đã đọc
        $updatedRows = Messenger::where('receiver_id', $receiver_id)
            ->update([
                'is_read' => true,
                'read_at' => $now
            ]);
    
        // Trả về phản hồi
        return response()->json([
            'success' => true,
            'updated_rows' => $updatedRows,
            'read_at' => $now
        ]);
    }
    

    /**
     * Get conversation history
     */
    public function getConversation(Request $request)
    {
        $request->validate([
            'with_user_id' => 'required_without:group_id|uuid|exists:users,id',
            'group_id' => 'required_without:with_user_id|uuid|exists:chat_groups,id',
        ]);

        $page =  1;
        $perPage = 20;

        if ($request->has('with_user_id')) {
            // Get 1-1 conversation
            $Messengers = Messenger::where(function ($query) use ($request) {
                $query->where('sender_id', Auth::id())
                    ->where('receiver_id', $request->with_user_id);
            })
                ->orWhere(function ($query) use ($request) {
                    $query->where('sender_id', $request->with_user_id)
                        ->where('receiver_id', Auth::id());
                })
                ->orderBy('created_at', 'desc')
                ->with(['sender:id,username,first_name,last_name,last_active'])
                ->paginate($perPage, ['*'], 'page', $page);

            // Mark unread Messengers as read
            Messenger::where('sender_id', $request->with_user_id)
                ->where('receiver_id', Auth::id())
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now()
                ]);
        } else {
            // Get group conversation
            // First check if user is member of the group
            $group = ChatGroup::findOrFail($request->group_id);
            $isMember = $group->users()->where('user_id', Auth::id())->exists();

            if (!$isMember) {
                return response()->json(['error' => 'Bạn không phải thành viên của nhóm này'], 403);
            }

            $Messengers = Messenger::where('group_id', $request->group_id)
                ->orderBy('created_at', 'desc')
                ->with(['sender:id,username,first_name,last_name,last_active'])
                ->paginate($perPage, ['*'], 'page', $page);
        }

        return response()->json($Messengers);
    }

    /**
     * Get recent conversations list
     */
    public function getRecentConversations()
    {
        $userId = Auth::id();

        // Get latest 1-1 Messengers
        $privateConversations = Messenger::where(function ($query) use ($userId) {
            $query->where('sender_id', $userId)
                ->whereNotNull('receiver_id');
        })
            ->orWhere(function ($query) use ($userId) {
                $query->where('receiver_id', $userId);
            })
            ->orderBy('created_at', 'desc')
            ->with('sender:id,username,first_name,last_name')
            ->with('receiver:id,username,first_name,last_name,last_active')
            ->get()
            ->groupBy(function ($Messenger) use ($userId) {
                return $Messenger->sender_id == $userId
                    ? $Messenger->receiver_id
                    : $Messenger->sender_id;
            })
            ->map(function ($Messengers, $otherUserId) use ($userId) {
                $latestMessenger = $Messengers->first();
                $otherUser = $latestMessenger->sender_id == $userId
                    ? $latestMessenger->receiver
                    : $latestMessenger->sender;

                $unreadCount = $Messengers
                    ->where('receiver_id', $userId)
                    ->where('is_read', false)
                    ->count();

                return [
                    'id' => $otherUserId,
                    'name' => trim($otherUser->first_name . ' ' . $otherUser->last_name),
                    'username' => $otherUser->username,
                    'conversation_type' => 'private',
                    'latest_Messenger' => [
                        'id' => $latestMessenger->id,
                        'content' => $latestMessenger->content,
                        'type' => $latestMessenger->type,
                        'created_at' => $latestMessenger->created_at,
                        'sender_id' => $latestMessenger->sender_id
                    ],
                    'unread_count' => $unreadCount,
                    'last_active' => $otherUser->last_active,
                ];
            })
            ->values();

        // Get group conversations that user is part of
        $userGroups = Auth::user()->groups;
        $groupConversations = $userGroups->map(function ($group) {
            $latestMessenger = Messenger::where('group_id', $group->id)
                ->orderBy('created_at', 'desc')
                ->with('sender:id,username,first_name,last_name')
                ->first();

            return [
                'id' => $group->id,
                'name' => $group->name,
                'conversation_type' => 'group',
                'latest_Messenger' => $latestMessenger ? [
                    'id' => $latestMessenger->id,
                    'content' => $latestMessenger->content,
                    'type' => $latestMessenger->type,
                    'created_at' => $latestMessenger->created_at,
                    'sender_id' => $latestMessenger->sender_id,
                    'sender_name' => trim($latestMessenger->sender->first_name . ' ' . $latestMessenger->sender->last_name)
                ] : null,
                'member_count' => $group->users->count()
            ];
        });

        // Merge and sort by latest Messenger
        $allConversations = $privateConversations->concat($groupConversations)
            ->sortByDesc(function ($conversation) {
                return $conversation['latest_Messenger']
                    ? $conversation['latest_Messenger']['created_at']
                    : '1970-01-01';
            })
            ->values();

        return response()->json($allConversations);
    }

    /**
     * Upload files for Messengers
     */
    public function uploadFiles(Request $request)
    {
        $request->validate([
            'files.*' => 'required|file|max:10240' // 10MB max per file
        ]);

        $uploadedFiles = [];

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('Messenger_files/' . Auth::id(), 'public');

                // Determine file type
                $mimeType = $file->getMimeType();
                $type = 'file';

                if (strpos($mimeType, 'image') !== false) {
                    $type = 'image';
                } elseif (strpos($mimeType, 'video') !== false) {
                    $type = 'video';
                }

                $uploadedFiles[] = [
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $mimeType,
                    'size' => $file->getSize(),
                    'type' => $type
                ];
            }
        }

        return response()->json($uploadedFiles);
    }
}
