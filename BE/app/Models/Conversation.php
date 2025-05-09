<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Conversation extends Model
{
    protected $fillable = [
        'name',
        'type',
        'image_id'
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
        // Check if a conversation already exists between these users
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

        // Create new conversation with UUID
        $conversation = new self();
        $conversation->id = Str::uuid();
        $conversation->type = 'private';
        $conversation->save();

        // Attach users with UUID for pivot records
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
        // Create new conversation
        $conversation = self::create([
            'name' => $name,
            'type' => 'group',
            'image_id' => $imageId
        ]);

        // Prepare user attachments with UUID for each pivot record
        $users = [];
        foreach ($userIds as $userId) {
            $users[$userId] = ['id' => Str::uuid()];
        }

        // Attach users
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
            ->pivot
            ->last_read_at;

        if (!$lastRead) {
            return $this->messages()
                ->where('sender_id', '!=', $user->id)
                ->count();
        }

        return $this->messages()
            ->where('sender_id', '!=', $user->id)
            ->where('created_at', '>', $lastRead)
            ->count();
    }
}
