<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SearchHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'target_id',
        'keyword',
    ];

    protected $casts = [
        'user_id' => 'string',
        'target_id' => 'string',
    ];

    /**
     * Quan hệ với người dùng đã tìm kiếm
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Lấy target tương ứng (User hoặc Page)
     */
    public function target()
    {
        return match ($this->type) {
            'user' => User::find($this->target_id),
            'page' => Page::find($this->target_id),
            default => null,
        };
    }

    /**
     * Scope: lọc theo user
     */
    public function scopeOfUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
