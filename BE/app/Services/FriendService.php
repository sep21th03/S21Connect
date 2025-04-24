<?php

namespace App\Services;

use App\Models\Friendship;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\User;


class FriendService
{
    public function sendFriendRequest($friendId)
    {
        $userId = Auth::id();

        if ($this->isFriend($userId, $friendId) || $this->hasPendingRequest($userId, $friendId)) {
            return ['message' => 'Đã gửi lời mời hoặc đã là bạn bè'];
        }

        Friendship::create([
            'id' => Str::uuid(),
            'user_id' => $userId,
            'friend_id' => $friendId,
            'status' => 'pending'
        ]);

        return ['message' => 'Đã gửi lời mời kết bạn'];
    }

    public function acceptFriendRequest($friendId)
    {
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

    public function cancelFriendRequest($friendId)
    {
        $userId = Auth::id();

        Friendship::where('user_id', $userId)
            ->where('friend_id', $friendId)
            ->where('status', 'pending')
            ->delete();

        return ['message' => 'Đã hủy lời mời kết bạn'];
    }

    public function unfriend($friendId)
    {
        $userId = Auth::id();

        Friendship::where(function ($query) use ($userId, $friendId) {
            $query->where('user_id', $userId)->where('friend_id', $friendId);
        })->orWhere(function ($query) use ($userId, $friendId) {
            $query->where('user_id', $friendId)->where('friend_id', $userId);
        })->delete();

        return ['message' => 'Đã hủy kết bạn'];
    }

    public function getFriendsList()
    {
        return Auth::user()->friends;
    }

    public function getPendingRequests()
    {
        return Auth::user()->receivedFriendRequests;
    }

    private function isFriend($userId, $friendId)
    {
        return Friendship::where('user_id', $userId)
            ->where('friend_id', $friendId)
            ->where('status', 'accepted')
            ->exists();
    }

    private function hasPendingRequest($userId, $friendId)
    {
        return Friendship::where('user_id', $userId)
            ->where('friend_id', $friendId)
            ->where('status', 'pending')
            ->exists();
    }

    public function checkFriendshipStatus($friendId)
    {
        $userId = Auth::id();

        if ($this->isFriend($userId, $friendId)) {
            return ['status' => 'accepted'];
        }

        if ($this->hasPendingRequest($userId, $friendId)) {
            return ['status' => 'pending_sent'];
        }

        if ($this->hasPendingRequest($friendId, $userId)) {
            return ['status' => 'pending_received'];
        }

        return ['status' => 'none'];
    }

    public function getFriendStats($userId)
    {
        $following = Friendship::where('user_id', $userId)->count();

        $followers = Friendship::where('friend_id', $userId)->count();

        $friends = Friendship::where('status', 'accepted')
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->orWhere('friend_id', $userId);
            })->count();

        return [
            'following' => $following,
            'followers' => $followers,
            'friends' => $friends,
        ];
    }

    /**
     * Lấy danh sách bạn bè chung giữa hai người dùng
     *
     * @param string $userAId ID của người dùng A
     * @param string $userBId ID của người dùng B
     * @return array Danh sách bạn bè chung và số lượng
     * @throws \Exception Nếu không tìm thấy người dùng
     */

    // Hàm lấy danh sách bạn bè của một user
    public function getAcceptedFriends($userId)
    {
        return Friendship::where('status', 'accepted')
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->orWhere('friend_id', $userId);
            })
            ->get()
            ->map(function ($friendship) use ($userId) {
                return $friendship->user_id === $userId
                    ? $friendship->friend_id
                    : $friendship->user_id;
            })
            ->toArray();
    }


    public function getMutualFriends($userId1, $userId2)
    {
        $friendsOfUser1 = $this->getAcceptedFriends($userId1);
        $friendsOfUser2 = $this->getAcceptedFriends($userId2);

        $mutualFriendIds = array_intersect($friendsOfUser1, $friendsOfUser2);

        // Trả về danh sách user
        return User::whereIn('id', $mutualFriendIds)->get();
    }
    public function countMutualFriends($userId1, $userId2)
    {
        $friendsOfUser1 = $this->getAcceptedFriends($userId1);
        $friendsOfUser2 = $this->getAcceptedFriends($userId2);

        return count(array_intersect($friendsOfUser1, $friendsOfUser2));
    }

    public function getListFriend($userId)
    {
       $listFriend = Friendship::where('user_id', $userId)
            ->where('status', 'accepted')
            ->orWhere(function ($query) use ($userId) {
                $query->where('friend_id', $userId)
                    ->where('status', 'accepted');
            })
            ->get()
            ->map(function ($friendship) use ($userId) {
                return $friendship->user_id === $userId
                    ? $friendship->friend_id
                    : $friendship->user_id;
            })
            ->toArray();

        return User::whereIn('id', $listFriend)->get();
    }
}
