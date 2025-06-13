<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PageReview extends Model
{
    use HasFactory;

    protected $table = 'page_reviews';

    protected $fillable = [
        'id',
        'post_id',
        'page_id',
        'user_id',
        'rate',
        'helpful_count',
    ];

    public $incrementing = false;
    protected $keyType = 'string';


    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function page()
    {
        return $this->belongsTo(Page::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
