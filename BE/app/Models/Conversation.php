<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Conversation extends Model
{
    protected $fillable = [
        'name',
        'type',
        'avatar',
    ];
    protected $keyType = 'string';
    public $incrementing = false;

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::creating(function ($conversation) {
            $conversation->id = Str::uuid();
        });
    }

    /**
     * Get the users in this conversation
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'conversation_user')
            ->withPivot('nickname', 'last_read_at')
            ->withTimestamps();
    }

    /**
     * Get the messages in this conversation
     */
    public function messages()
    {
        return $this->hasMany(Messenger::class);
    }

    /**
     * Get the avatar image for this conversation
     */
    public function image()
    {
        return $this->belongsTo(Image::class, 'image_id');
    }

    /**
     * Get the latest message in this conversation
     */
    public function latestMessage()
    {
        return $this->hasOne(Messenger::class)->latest();
    }

    /**
     * Create a new private conversation between two users
     * 
     * @param \App\Models\User $user1
     * @param \App\Models\User $user2
     * @return self
     */
    public static function createPrivateConversation($user1, $user2)
    {
        $existingConversation = self::whereType('private')
            ->whereHas('users', function ($query) use ($user1) {
                $query->where('user_id', $user1->id);
            })
            ->whereHas('users', function ($query) use ($user2) {
                $query->where('user_id', $user2->id);
            })
            ->first();

        if ($existingConversation) {
            return $existingConversation;
        }

        $conversation = new self();
        $conversation->id = Str::uuid();
        $conversation->type = 'private';
        $conversation->save();

        $conversation->users()->attach([
            $user1->id => ['id' => Str::uuid()],
            $user2->id => ['id' => Str::uuid()]
        ]);

        return $conversation;
    }

    /**
     * Create a new group conversation with multiple users
     * 
     * @param string $name
     * @param array $userIds
     * @param string|null $imageId
     * @return self
     */
    public static function createGroupConversation($name, $userIds, $imageId = null)
    {
        $conversation = self::create([
            'name' => $name,
            'type' => 'group',
            'image_id' => $imageId
        ]);

        $users = [];
        foreach ($userIds as $userId) {
            $users[$userId] = ['id' => Str::uuid()];
        }

        $conversation->users()->attach($users);

        return $conversation;
    }

    public static function firstOrCreatePrivateConversation(User $user1, User $user2)
    {
        $conversation = self::where('type', 'private')
            ->whereHas('users', fn($q) => $q->where('user_id', $user1->id))
            ->whereHas('users', fn($q) => $q->where('user_id', $user2->id))
            ->first();

        if ($conversation) {
            return $conversation;
        }

        return self::createPrivateConversation($user1, $user2);
    }


    public static function firstOrCreateGroup(array $userIds, array $options = []): self
    {
        $userIds = array_unique($userIds);
        sort($userIds);

        $existing = self::where('type', 'group')->first();

        if ($existing) {
            return $existing;
        }

        $conversation = self::create([
            'type' => 'group',
            'name' => $options['name'] ?? 'Group Chat',
            'avatar' => $options['avatar'] ?? null,
        ]);

        foreach ($userIds as $userId) {
            $conversation->users()->attach($userId, [
                'id' => (string) Str::uuid(),
                'is_archived' => false,
                'nickname' => null,
                'last_read_at' => now(),
            ]);
        }

        return $conversation;
    }


    /**
     * Get the URL for this conversation
     */
    public function getUrl()
    {
        return url("/chat/{$this->id}");
    }

    /**
     * Get unread message count for specific user
     * 
     * @param \App\Models\User $user
     * @return int
     */
    public function unreadCount($user)
    {
        $lastRead = $this->users()
            ->where('user_id', $user->id)
            ->first()
            ?->pivot
            ->last_read_at;

        $query = $this->messages()
            ->where('sender_id', '!=', $user->id);

        if ($lastRead) {
            $query->where('created_at', '>', $lastRead);
        }

        return $query->count();
    }

    public function unreadMessages()
    {
        $userId = auth()->id();

        return $this->messages()
            ->where('sender_id', '!=', $userId)
            ->where(function ($query) use ($userId) {
                $query->when($this->type === 'private', function ($q) {
                    $q->whereNull('read_at');
                })->when($this->type === 'group', function ($q) use ($userId) {
                    $q->whereHas('conversation.users', function ($u) use ($userId) {
                        $u->where('user_id', $userId)
                            ->whereColumn('last_read_at', '<', 'messages.created_at');
                    });
                });
            });
    }

    public function unreadMessagesPrivate($userId)
    {
        return $this->messages()
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at');
    }

    public function unreadMessagesGroup($userId)
    {
        return $this->messages()
            ->where('sender_id', '!=', $userId)
            ->whereHas('conversation.users', function ($u) use ($userId) {
                $u->where('user_id', $userId)
                    ->whereColumn('last_read_at', '<', 'messages.created_at');
            });
    }
}
