<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\ResetPasswordNotification;
use App\Notifications\CustomVerifyEmail;
use App\Models\Scopes\ExcludeBannedUsers;


class User extends Authenticatable implements JWTSubject, MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = [
        'username',
        'email',
        'password',
        'is_admin',
        'first_name',
        'last_name',
        'email_verified_at',
        'bio',
        'gender',
        'birthday',
        'avatar',
        'cover_photo',
        'last_active',
        'vnd',
        'secret_code',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    protected static function booted()
    {
        static::addGlobalScope(new ExcludeBannedUsers);
    }

    public function isAdmin()
    {
        return $this->is_admin;
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'username'   => $this->username,
            'email'      => $this->email,
            'first_name' => $this->first_name,
            'last_name'  => $this->last_name,
            'is_admin'   => $this->is_admin,
            'avatar'     => $this->avatar,
        ];
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new CustomVerifyEmail());
    }
    // Relationships
    public function reportsReceived()
    {
        return $this->morphMany(Report::class, 'reportable');
    }
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
    public function conversations()
    {
        return $this->belongsToMany(Conversation::class, 'conversation_user')
            ->withPivot('nickname', 'last_read_at')
            ->withTimestamps();
    }

    public function sentMessages()
    {
        return $this->hasMany(Messenger::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Messenger::class, 'receiver_id');
    }

    public function avatar()
    {
        return $this->hasOne(Image::class)->where('type', 'avatar');
    }

    public function startConversationWith(User $otherUser)
    {
        return Conversation::createPrivateConversation($this, $otherUser);
    }

    public function getDisplayNameInConversation(Conversation $conversation)
    {
        $pivot = $conversation->users()
            ->where('user_id', $this->id)
            ->first()
            ->pivot;

        return $pivot->nickname ?? $this->name;
    }

    public function markConversationAsRead(Conversation $conversation)
    {
        $this->conversations()->updateExistingPivot(
            $conversation->id,
            ['last_read_at' => now()]
        );
    }

    public function acceptedFriendships()
    {
        return Friendship::where('status', 'accepted')
            ->where(function ($q) {
                $q->where('user_id', $this->id)
                    ->orWhere('friend_id', $this->id);
            });
    }
    // public function messagesSent()
    // {
    //     return $this->hasMany(Messenger::class, 'sender_id');
    // }

    // public function messagesReceived()
    // {
    //     return $this->hasMany(Messenger::class, 'receiver_id');
    // }

    public function stories()
    {
        return $this->hasMany(Story::class);
    }

    public function groups()
    {
        return $this->belongsToMany(ChatGroup::class, 'chat_group_user', 'user_id', 'group_id');
    }

    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function taggedInPosts()
    {
        return $this->belongsToMany(Post::class, 'post_user_tags');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function reactions()
    {
        return $this->hasMany(Reaction::class);
    }

    public function shares()
    {
        return $this->hasMany(Share::class);
    }

    public function friendships()
    {
        return $this->hasMany(Friendship::class);
    }

    public function blocks()
    {
        return $this->hasMany(Block::class, 'user_id');
    }

    public function blockedBy()
    {
        return $this->hasMany(Block::class, 'blocked_user_id');
    }

    // Friendship functions
    public function sentFriendRequests()
    {
        return $this->hasMany(Friendship::class, 'user_id')->where('status', 'pending');
    }

    public function receivedFriendRequests()
    {
        return $this->hasMany(Friendship::class, 'friend_id')->where('status', 'pending');
    }

    public function friends()
    {
        return $this->hasMany(Friendship::class, 'user_id')->where('status', 'accepted');
    }

    public function isFriend(User $user)
    {
        return $this->friends()->where('friend_id', $user->id)->exists();
    }

    public function isFriendRequestSent(User $user)
    {
        return $this->sentFriendRequests()->where('friend_id', $user->id)->exists();
    }

    // Block functions
    public function hasBlocked($userId)
    {
        return $this->blocks()->where('blocked_user_id', $userId)->exists();
    }

    public function isBlockedBy($userId)
    {
        return $this->blockedBy()->where('user_id', $userId)->exists();
    }
}
