<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Friendship extends Model {
    use HasFactory;
    use HasUuids;
    protected $fillable = ['user_id', 'friend_id', 'status', 'new'];

    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function friend() {
        return $this->belongsTo(User::class, 'friend_id');
    }
}
