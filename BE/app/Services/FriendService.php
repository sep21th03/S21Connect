<?php

namespace App\Services;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class FriendService {
    public function sendFriendRequest($friendId) {
        $userId = Auth::id();

        if ($this->isFriend($userId, $friendId) || $this->hasPendingRequest($userId, $friendId)) {
            return ['message' => 'Đã gửi lời mời hoặc đã là bạn bè'];
        }

        Friendship::create([
            'user_id' => $userId,
            'friend_id' => $friendId,
            'status' => 'pending'
        ]);

        return ['message' => 'Đã gửi lời mời kết bạn'];
    }

    public function acceptFriendRequest($friendId) {
        $userId = Auth::id();

        $friendship = Friendship::where('user_id', $friendId)
                                ->where('friend_id', $userId)
                                ->where('status', 'pending')
                                ->first();

        if (!$friendship) {
            return ['message' => 'Không tìm thấy lời mời'];
        }

        $friendship->update(['status' => 'accepted']);

        Friendship::create([
            'user_id' => $userId,
            'friend_id' => $friendId,
            'status' => 'accepted'
        ]);

        return ['message' => 'Đã chấp nhận lời mời kết bạn'];
    }

    public function cancelFriendRequest($friendId) {
        $userId = Auth::id();
        
        Friendship::where('user_id', $userId)
                  ->where('friend_id', $friendId)
                  ->where('status', 'pending')
                  ->delete();

        return ['message' => 'Đã hủy lời mời kết bạn'];
    }

    public function unfriend($friendId) {
        $userId = Auth::id();

        Friendship::where(function($query) use ($userId, $friendId) {
            $query->where('user_id', $userId)->where('friend_id', $friendId);
        })->orWhere(function($query) use ($userId, $friendId) {
            $query->where('user_id', $friendId)->where('friend_id', $userId);
        })->delete();

        return ['message' => 'Đã hủy kết bạn'];
    }

    public function getFriendsList() {
        return Auth::user()->friends;
    }

    public function getPendingRequests() {
        return Auth::user()->receivedFriendRequests;
    }

    private function isFriend($userId, $friendId) {
        return Friendship::where('user_id', $userId)
                         ->where('friend_id', $friendId)
                         ->where('status', 'accepted')
                         ->exists();
    }

    private function hasPendingRequest($userId, $friendId) {
        return Friendship::where('user_id', $userId)
                         ->where('friend_id', $friendId)
                         ->where('status', 'pending')
                         ->exists();
    }
}
