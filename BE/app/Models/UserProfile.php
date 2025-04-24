<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    use HasFactory;

    protected $table = 'user_profiles';

    protected $fillable = [
        'user_id',
        'phone_number',
        'location',
        'workplace',
        'current_school',
        'past_school',
        'relationship_status',
        'is_phone_number_visible',
        'is_location_visible',
        'is_workplace_visible',
        'is_school_visible',
        'is_past_school_visible',
        'is_relationship_status_visible',
    ];

    protected $casts = [
        'relationship_status' => 'string',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
