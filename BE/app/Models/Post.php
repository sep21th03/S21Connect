<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Post extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'post_id', 'page_id', 'content', 'images', 'videos', 'visibility', 'is_comment_disabled', 'feeling', 'checkin', 'bg_id', 'type', 'original_post_id', 'post_format'];

    protected $casts = [
        'images' => 'array',
        'videos' => 'array',
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function page()
    {
        return $this->belongsTo(Page::class);
    }


    public function taggedFriends()
    {
        return $this->belongsToMany(User::class, 'post_user_tags');
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($post) {
            $post->post_id = self::generateUniquePostId();
        });
    }

    public static function generateUniquePostId()
    {
        do {
            $uniqueId = 'pfbid' . Str::random(40);
        } while (self::where('post_id', $uniqueId)->exists());

        return $uniqueId;
    }


    public function isPagePost()
    {
        return !is_null($this->page_id);
    }



    public function getRouteKeyName()
    {
        return 'post_id';
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function reactions()
    {
        return $this->hasMany(Reaction::class);
    }

    public function originalPost()
    {
        return $this->belongsTo(Post::class, 'original_post_id');
    }

    public function shares()
    {
        return $this->hasMany(Share::class);
    }

    public function shareSummary()
    {
        return $this->shares()->count();
    }

    public function getReactionCountByType($type)
    {
        return $this->reactions()->where('type', $type)->count();
    }

    public function getTotalReactionCount()
    {
        return $this->reactions()->count();
    }
}
