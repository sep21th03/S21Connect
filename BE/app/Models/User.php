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

    public function isAdmin()
    {
        return $this->is_admin;
    }

    public function getJWTIdentifier()
    {
        return $this->getKey(); // Thường là id của user
    }

    public function getJWTCustomClaims()
    {
        return [
            'username'   => $this->username,
            'email'      => $this->email,
            'first_name' => $this->first_name,
            'last_name'  => $this->last_name,
            'is_admin'   => $this->is_admin,
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
    public function posts()
    {
        return $this->hasMany(Post::class);
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
