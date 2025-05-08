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

    // Hàm lấy danh sách bạn bè của một user
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

    public function getListFriendLimit($userId, $limit = 20)
    {
        $userFriendIds = Friendship::where('status', 'accepted')
            ->where(function ($q) use ($userId) {
                $q->where('user_id', $userId)
                    ->orWhere('friend_id', $userId);
            })
            ->pluck('user_id', 'friend_id')
            ->flatMap(function ($item, $key) use ($userId) {
                return [$item, $key];
            })
            ->filter(fn($id) => $id != $userId)
            ->unique()
            ->values()
            ->toArray();

        $friends = User::select('id', 'first_name', 'last_name', 'avatar')
            ->whereIn('id', $userFriendIds)
            ->limit($limit)
            ->get();

        $friendIds = $friends->pluck('id')->toArray();
        $allFriendships = Friendship::where('status', 'accepted')
            ->where(function ($q) use ($friendIds) {
                $q->whereIn('user_id', $friendIds)
                    ->orWhereIn('friend_id', $friendIds);
            })
            ->get();

        $friendFriendMap = [];
        foreach ($friendIds as $fid) {
            $friendFriendMap[$fid] = [];
        }
        foreach ($allFriendships as $fs) {
            $friend_id_1 = $fs->user_id;
            $friend_id_2 = $fs->friend_id;
            if (in_array($friend_id_1, $friendIds)) {
                $friendFriendMap[$friend_id_1][] = $friend_id_2;
            }
            if (in_array($friend_id_2, $friendIds)) {
                $friendFriendMap[$friend_id_2][] = $friend_id_1;
            }
        }

        return $friends->map(function ($friend) use ($userFriendIds, $friendFriendMap) {
            $friendFriends = $friendFriendMap[$friend->id] ?? [];
            $mutualCount = count(array_intersect($userFriendIds, $friendFriends));

            return [
                'id' => $friend->id,
                'name' => "{$friend->first_name} {$friend->last_name}",
                'avatar' => $friend->avatar ?? null,
                'mutual_friends_count' => $mutualCount,
            ];
        });
    }



    public function getFriendsWithMutualCount($viewerId)
    {
        // Lấy mảng ID bạn bè của viewer
        $viewerFriendIds = Friendship::where('status', 'accepted')
            ->where(function ($q) use ($viewerId) {
                $q->where('user_id', $viewerId)
                    ->orWhere('friend_id', $viewerId);
            })
            ->get()
            ->map(fn($f) => $f->user_id === $viewerId ? $f->friend_id : $f->user_id)
            ->toArray();

        // Lấy tất cả dữ liệu user bạn bè
        $friends = User::select('id', 'first_name', 'last_name')
            ->whereIn('id', $viewerFriendIds)
            ->get();

        // Với mỗi friend, tính số mutual friends
        $result = $friends->map(function ($friend) use ($viewerFriendIds, $viewerId) {
            // Lấy mảng ID bạn bè của friend
            $friendFriendIds = Friendship::where('status', 'accepted')
                ->where(function ($q) use ($friend) {
                    $q->where('user_id', $friend->id)
                        ->orWhere('friend_id', $friend->id);
                })
                ->get()
                ->map(fn($f) => $f->user_id === $friend->id ? $f->friend_id : $f->user_id)
                ->toArray();

            // Tính giao của hai mảng bạn bè để lấy mutual friends
            // Chỉ tính các bạn bè chung một chiều (không tính ngược lại)
            $mutualCount = count(array_intersect($viewerFriendIds, $friendFriendIds));

            return [
                'id' => $friend->id,
                'name' => "{$friend->first_name} {$friend->last_name}",
                'mutual_friends_count' => $mutualCount,
                'avatar' => $friend->avatar ?? null,
                'status' => 'offline'
            ];
        });

        return $result;
    }

    public function updateLastActive($data)
    {
        $userId = $data['user_id'];
        $lastActive = $data['last_active'];
        $user = User::find($userId);
        if ($user) {
            $user->last_active = $lastActive;
            $user->save();
        }
        return $user;
    }
}
