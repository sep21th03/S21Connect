<?php

namespace App\Services;

use App\Models\User;
use App\Models\Friendship;
use Illuminate\Support\Facades\Auth;

class UserService
{
    

    public function getHoverCardData($viewerId, $targetUserId)
    {
        $user = User::select('id', 'first_name', 'last_name', 'avatar')
            ->with(['profile:id,user_id,location'])
            ->where('id', $targetUserId)
            ->first();

        if (!$user) {
            return null;
        }

        // Tổng số bạn bè của target user
        $friendCount = Friendship::where('status', 'accepted')
            ->where(function ($q) use ($targetUserId) {
                $q->where('user_id', $targetUserId)
                    ->orWhere('friend_id', $targetUserId);
            })->count();

        // Số bạn bè chung giữa viewer và target
        $viewerFriends = Friendship::where('status', 'accepted')
            ->where(function ($q) use ($viewerId) {
                $q->where('user_id', $viewerId)
                    ->orWhere('friend_id', $viewerId);
            })->get()
            ->map(fn($f) => $f->user_id == $viewerId ? $f->friend_id : $f->user_id)
            ->toArray();

        $targetFriends = Friendship::where('status', 'accepted')
            ->where(function ($q) use ($targetUserId) {
                $q->where('user_id', $targetUserId)
                    ->orWhere('friend_id', $targetUserId);
            })->get()
            ->map(fn($f) => $f->user_id == $targetUserId ? $f->friend_id : $f->user_id)
            ->toArray();

        $mutualCount = count(array_intersect($viewerFriends, $targetFriends));

        // Kiểm tra 2 người đã là bạn chưa
        $isFriend = Friendship::where('status', 'accepted')
            ->where(function ($q) use ($viewerId, $targetUserId) {
                $q->where('user_id', $viewerId)->where('friend_id', $targetUserId)
                    ->orWhere('user_id', $targetUserId)->where('friend_id', $viewerId);
            })->exists();

        return [
            'id' => $user->id,
            'name' => $user->first_name . ' ' . $user->last_name,
            'avatar' => $user->avatar,
            'mutual_friends_count' => $mutualCount,
            'friend_count' => $friendCount,
            'location' => $user->profile->location ?? null,
            'is_friend' => $isFriend,
        ];
    }
}