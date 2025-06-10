<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Page extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'name',
        'slug',
        'description',
        'avatar',
        'cover_image',
        'created_by',
    ];

    protected $keyType = 'string';
    public $incrementing = false;


    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function admins()
    {
        return $this->hasMany(PageAdmin::class);
    }

    public function followers()
    {
        return $this->hasMany(PageFollower::class);
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function getFollowersCountAttribute()
    {
        return $this->followers()->count();
    }

    public function isFollowedBy($userId)
    {
        return $this->followers()->where('user_id', $userId)->exists();
    }

    public function isAdminBy($userId)
    {
        return $this->admins()->where('user_id', $userId)->exists();
    }
}
