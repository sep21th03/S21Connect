<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PageAdmin extends Model
{
    use HasFactory, HasUuids;

     protected $fillable = [
        'id',
        'page_id',
        'user_id',
        'role',
    ];

    protected $keyType = 'string';
    public $incrementing = false;

    public function page()
    {
        return $this->belongsTo(Page::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
