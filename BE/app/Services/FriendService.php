<?php

namespace App\Services;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\ActivityLog;

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

        ActivityLog::create([
            'id' => Str::uuid(),
            'user_id' => Auth::id(),
            'action' => 'commented_post',
            'target_type' => \App\Models\User::class,
            'target_id' => $friendId,
            'metadata' => [
                'content' => 'Bạn đã gửi lời mời kết bạn cho '
            ]
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

        ActivityLog::create([
            'id' => Str::uuid(),
            'user_id' => Auth::id(),
            'action' => 'commented_post',
            'target_type' => \App\Models\User::class,
            'target_id' => $friendId,
            'metadata' => [
                'content' => 'Bạn đã hủy kết bạn '
            ]
        ]);
        return ['message' => 'Đã hủy kết bạn'];
    }

    public function getFriendsList()
    {
        return Auth::user()->friends;
    }

    public function getPendingRequests()
    {
        $friends = Auth::user()->receivedFriendRequests()->orderByDesc('created_at')->get();
        // Auth::user()->receivedFriendRequests()
        //     ->where('new', false)
        //     ->update(['new' => true]);
        $infoFriends = $friends->map(function ($friendship) {
            $friend = User::find($friendship->user_id);
            $mutualFriendIds =  $this->countMutualFriends($friend->id, Auth::id());

            return [
                'id' => $friend->id,
                'first_name' => $friend->first_name,
                'last_name' => $friend->last_name,
                'avatar' => $friend->avatar,
                'username' => $friend->username,
                'mutual_friend' => $mutualFriendIds,
            ];
        });
        return $infoFriends;
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
            })
            ->get();

        $uniqueFriendPairs = $friends->map(function ($friend) {
            $ids = [$friend->user_id, $friend->friend_id];
            sort($ids);
            return implode('-', $ids);
        })->unique();

        $friendCount = $uniqueFriendPairs->count();

        return [
            'following' => $following,
            'followers' => $followers,
            'friends' => $friendCount,
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
            ->filter(fn($id) => $id !== $userId)
            ->unique()
            ->values()
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

    public function getUpcomingBirthdays($userId, $daysAhead = 30)
    {
        $today = Carbon::today();
        $endDate = $today->copy()->addDays($daysAhead);

        $friends = Friendship::where('friendships.status', 'accepted')
            ->where(function ($query) use ($userId) {
                $query->where('friendships.user_id', $userId)
                    ->orWhere('friendships.friend_id', $userId);
            })
            ->join('users', function ($join) use ($userId) {
                $join->on(DB::raw("IF(friendships.user_id = '$userId', friendships.friend_id, friendships.user_id)"), '=', 'users.id');
            })
            ->leftJoin('user_profiles', 'user_profiles.user_id', '=', 'users.id')
            ->select('users.id', 'users.first_name', 'users.last_name', 'users.birthday', 'users.avatar', 'users.username', 'users.birthday', 'users.gender', 'user_profiles.location')
            ->distinct()
            ->whereNotNull('users.birthday')
            ->get()
            ->filter(function ($user) use ($today, $endDate) {
                $birthday = Carbon::parse($user->birthday)->setYear($today->year);
                if ($birthday->lessThan($today)) {
                    $birthday->addYear();
                }
                return $birthday->between($today, $endDate);
            })
            ->sortBy(function ($user) use ($today) {
                $birthday = Carbon::parse($user->birthday)->setYear($today->year);
                if ($birthday->lessThan($today)) {
                    $birthday->addYear();
                }
                return $birthday->dayOfYear;
            })
            ->values();

        return $friends;
    }
}
