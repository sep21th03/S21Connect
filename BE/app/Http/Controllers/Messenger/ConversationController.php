<?php

namespace App\Http\Controllers\Messenger;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Models\Image;
use App\Models\Messenger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ConversationController extends Controller
{
    public function new_message_count()
    {
        $user = Auth::user();
        $userId = $user->id;

        $conversations = $user->conversations()
            ->withCount(['unreadMessages' => function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->where('is_read', false);
            }])
            ->get();

        $unreadCount = $conversations->sum('unread_messages_count');
        return response()->json([
            'unread_count' => $unreadCount,
        ]);
    }


    public function index(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;
        $archived = filter_var($request->query('archived', false), FILTER_VALIDATE_BOOLEAN);
        $conversations = $user->conversations()
            ->wherePivot('is_archived', $archived)
            ->with([
                'latestMessage',
                'latestMessage.sender',
                'image',
                'users' => function ($query) use ($userId) {
                    $query->select('users.id', 'username', 'first_name', 'last_name', 'last_active', 'avatar')
                        ->where('users.id', '!=', $userId);
                }
            ])
            ->withCount(['unreadMessages' => function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->where('is_read', false);
            }])
            ->get();


        $formattedConversations = $conversations->map(function ($conversation) use ($userId) {

            $data = [
                'id' => $conversation->id,
                'name' => $conversation->name,
                'type' => $conversation->type,
                'url' => $conversation->getUrl(),
                'unread_count' => $conversation->unread_messages_count,
                'created_at' => $conversation->created_at,
                'updated_at' => $conversation->updated_at
            ];

            if ($conversation->image) {
                $data['image'] = [
                    'url' => $conversation->image->url,
                    'type' => $conversation->image->type
                ];
            }

            if ($conversation->type === 'private') {
                $otherUser = $conversation->users->first();

                if ($otherUser) {
                    $data['name'] = $otherUser->getDisplayNameInConversation($conversation);
                    $data['other_user'] = [
                        'id' => $otherUser->id,
                        'username' => $otherUser->username,
                        'name' => trim($otherUser->first_name . ' ' . $otherUser->last_name),
                        'last_active' => $otherUser->last_active,
                        'avatar' => $otherUser->avatar,
                    ];
                }
            } else {
                $data['member_count'] = $conversation->users->count();
                $data['members'] = $conversation->users->map(function ($user) use ($conversation) {
                    return [
                        'id' => $user->id,
                        'username' => $user->username,
                        'name' => trim($user->first_name . ' ' . $user->last_name),
                        'nickname' => $user->pivot->nickname
                    ];
                });
            }

            if ($conversation->latestMessage) {
                $sender = $conversation->latestMessage->sender;
                $data['latest_message'] = [
                    'id' => $conversation->latestMessage->id,
                    'content' => $conversation->latestMessage->content,
                    'type' => $conversation->latestMessage->type,
                    'created_at' => $conversation->latestMessage->created_at,
                    'sender_id' => $conversation->latestMessage->sender_id,
                    'sender_name' => $sender ? trim($sender->first_name . ' ' . $sender->last_name) : null
                ];
            }

            return $data;
        });

        $sortedConversations = $formattedConversations->sortByDesc(function ($conversation) {
            return $conversation['latest_message']
                ? $conversation['latest_message']['created_at']
                : $conversation['updated_at'];
        })->values();

        return response()->json($sortedConversations);
    }




    public function create(Request $request)
    {
        $request->validate([
            'user_ids' => 'required_without:user_id|array',
            'user_ids.*' => 'exists:users,id',
            'user_id' => 'required_without:user_ids|uuid|exists:users,id',
            'name' => 'required_if:user_ids,*|string|max:100',
            'image_id' => 'sometimes|uuid|exists:images,id',
        ]);

        if ($request->has('user_id')) {
            $otherUser = User::findOrFail($request->user_id);
            $conversation = Conversation::createPrivateConversation(Auth::user(), $otherUser);

            $conversation->users()->attach(Auth::id());
            $conversation->users()->attach($otherUser->id);

            if ($request->has('message')) {
                $message = new Messenger();
                $message->sender_id = Auth::id();
                $message->receiver_id = $otherUser->id;
                $message->conversation_id = $conversation->id;
                $message->content = $request->message;
                $message->type = 'text';
                $message->save();
            }
        } else {
            $userIds = $request->user_ids;
            if (!in_array(Auth::id(), $userIds)) {
                $userIds[] = Auth::id();
            }

            $conversation = Conversation::createGroupConversation(
                $request->name,
                $userIds,
                $request->image_id
            );

            foreach ($userIds as $userId) {
                $conversation->users()->attach($userId);
            }

            if ($request->has('message')) {
                $message = new Messenger();
                $message->sender_id = Auth::id();
                $message->conversation_id = $conversation->id;
                $message->content = $request->message;
                $message->type = 'text';
                $message->save();
            }
        }

        $conversation->load(['users', 'latestMessage', 'latestMessage.sender']);

        return response()->json([
            'id' => $conversation->id,
            'name' => $conversation->name,
            'type' => $conversation->type,
            'url' => $conversation->getUrl(),
            'created_at' => $conversation->created_at,
            'updated_at' => $conversation->updated_at
        ], 201);
    }


    public function show(Request $request, $id)
    {
        $conversation = Conversation::findOrFail($id);

        $isParticipant = $conversation->users()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'You are not a participant in this conversation'], 403);
        }

        $perPage = $request->query('per_page', 20);
        $page = $request->query('page', 1);

        $messages = $conversation->messages()
            ->with('sender:id,username,first_name,last_name')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        if ($conversation->type === 'private') {
            Messenger::where('conversation_id', $conversation->id)
                ->where('sender_id', '!=', Auth::id())
                ->where('receiver_id', Auth::id())
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now()
                ]);
        }

        Auth::user()->markConversationAsRead($conversation);

        $conversation->load(['users', 'image']);

        $result = [
            'id' => $conversation->id,
            'name' => $conversation->name,
            'type' => $conversation->type,
            'url' => $conversation->getUrl(),
            'messages' => $messages,
            'created_at' => $conversation->created_at,
            'updated_at' => $conversation->updated_at
        ];

        if ($conversation->image) {
            $result['image'] = [
                'url' => $conversation->image->url,
                'type' => $conversation->image->type
            ];
        }

        $result['participants'] = $conversation->users->map(function ($user) use ($conversation) {
            return [
                'id' => $user->id,
                'username' => $user->username,
                'name' => trim($user->first_name . ' ' . $user->last_name),
                'nickname' => $user->pivot->nickname,
                'last_read_at' => $user->pivot->last_read_at
            ];
        });

        if ($request->has('message')) {
            $messageId = $request->query('message');
            $messagePosition = $conversation->messages()
                ->where('created_at', '<=', function ($query) use ($messageId) {
                    $query->select('created_at')
                        ->from('messages')
                        ->where('id', $messageId);
                })
                ->count();

            $result['scroll_to_message'] = [
                'id' => $messageId,
                'position' => $messagePosition
            ];
        }

        return response()->json($result);
    }


    public function update(Request $request, $id)
    {
        $conversation = Conversation::findOrFail($id);

        $isParticipant = $conversation->users()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'You are not a participant in this conversation'], 403);
        }

        if ($conversation->type !== 'group') {
            return response()->json(['error' => 'Can only update group conversations'], 422);
        }

        $request->validate([
            'name' => 'sometimes|string|max:100',
            'image_id' => 'sometimes|uuid|exists:images,id',
        ]);

        if ($request->has('name')) {
            $conversation->name = $request->name;
        }

        if ($request->has('image_id')) {
            $conversation->image_id = $request->image_id;
        }

        $conversation->save();

        return response()->json([
            'id' => $conversation->id,
            'name' => $conversation->name,
            'type' => $conversation->type,
            'updated_at' => $conversation->updated_at
        ]);
    }

    /**
     * Biệt danh
     */
    public function updateNickname(Request $request, $id, $userId)
    {
        $conversation = Conversation::findOrFail($id);

        $isParticipant = $conversation->users()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'You are not a participant in this conversation'], 403);
        }

        $targetUserExists = $conversation->users()
            ->where('user_id', $userId)
            ->exists();

        if (!$targetUserExists) {
            return response()->json(['error' => 'Target user is not a participant'], 404);
        }

        $request->validate([
            'nickname' => 'required|string|max:50',
        ]);

        $conversation->users()->updateExistingPivot($userId, [
            'nickname' => $request->nickname
        ]);

        return response()->json([
            'conversation_id' => $conversation->id,
            'user_id' => $userId,
            'nickname' => $request->nickname
        ]);
    }

    /**
     * Thêm vào nhóm
     */
    public function addUsers(Request $request, $id)
    {
        $conversation = Conversation::findOrFail($id);

        $isParticipant = $conversation->users()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'You are not a participant in this conversation'], 403);
        }

        if ($conversation->type !== 'group') {
            return response()->json(['error' => 'Can only add users to group conversations'], 422);
        }

        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'uuid|exists:users,id',
        ]);

        $users = [];
        foreach ($request->user_ids as $userId) {
            if ($conversation->users()->where('user_id', $userId)->exists()) {
                continue;
            }

            $users[$userId] = ['id' => Str::uuid()];
        }

        if (!empty($users)) {
            $conversation->users()->attach($users);
        }

        return response()->json([
            'conversation_id' => $conversation->id,
            'added_users' => array_keys($users)
        ]);
    }

    /**
     * Xóa người dùng khỏi cuộc trò chuyện
     */
    public function removeUser(Request $request, $id, $userId)
    {
        $conversation = Conversation::findOrFail($id);

        $isParticipant = $conversation->users()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'You are not a participant in this conversation'], 403);
        }

        if ($conversation->type !== 'group') {
            return response()->json(['error' => 'Can only remove users from group conversations'], 422);
        }

        $targetUserExists = $conversation->users()
            ->where('user_id', $userId)
            ->exists();

        if (!$targetUserExists) {
            return response()->json(['error' => 'Target user is not a participant'], 404);
        }

        $conversation->users()->detach($userId);

        return response()->json([
            'conversation_id' => $conversation->id,
            'removed_user_id' => $userId
        ]);
    }

    /**
     * Rời khỏi cuộc trò chuyện
     */
    public function leave($id)
    {
        $conversation = Conversation::findOrFail($id);

        $isParticipant = $conversation->users()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'You are not a participant in this conversation'], 403);
        }

        $conversation->users()->detach(Auth::id());

        if ($conversation->type === 'private' || $conversation->users()->count() === 0) {
            $conversation->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'You have left the conversation'
        ]);
    }

    public function getMedia($id, Request $request)
    {
        $perPage = $request->input('perPage', 20);
        $page = $request->input('page', 1);

        $mediaMessages = Messenger::where('conversation_id', $id)
            ->where('type', 'image')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['content', 'created_at']);

        return response()->json($mediaMessages->items());
    }


    public function hasUnreadMessages($conversationId)
    {
        $conversation = Conversation::findOrFail($conversationId);

        $userId = Auth::id();

        $lastTimeRead = $conversation->users()
            ->where('user_id', $userId)
            ->first()
            ?->pivot
            ->last_read_at;

        $query = $conversation->messages()
            ->where('sender_id', '!=', $userId);

        if ($lastTimeRead) {
            $query->where('created_at', '>', $lastTimeRead);
        }

        $hasUnread = $query->where('is_read', false)->exists();

        return response()->json([
            'has_unread' => $hasUnread,
        ]);
    }
}
