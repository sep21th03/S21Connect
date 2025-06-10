<?php

namespace App\Services;

use App\Models\User;
use App\Models\Friendship;
use Illuminate\Support\Facades\Auth;
use App\Models\Conversation;
use App\Models\Post;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class UserService
{
    public function getUserProfile($userId)
    {
        $user = User::where('id', $userId)
            ->first();

        if (!$user) {
            return null;
        }

        return [
            'id' => $user->id,
            'username' => $user->username,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'avatar' => $user->avatar,
            'is_admin' => $user->is_admin,
        ];
    }


    public function getHoverCardData($viewerId, $targetUserId)
    {
        $user = User::select('id', 'first_name', 'last_name', 'avatar')
            ->with(['profile:id,user_id,location'])
            ->where('id', $targetUserId)
            ->first();

        if (!$user) {
            return null;
        }

        $friendCount = Friendship::where('status', 'accepted')
            ->where(function ($q) use ($targetUserId) {
                $q->where('user_id', $targetUserId)
                    ->orWhere('friend_id', $targetUserId);
            })->count();

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

        return User::whereIn('id', $listFriend)->take(20)->get();
    }


    public function getListFriendByUsername($username, $type = 'all', $currentUserId = null)
    {
        $user = User::where('username', $username)->first();

        if (!$user) {
            return [];
        }

        switch ($type) {
            case 'all':
                $friendIds = Friendship::where('status', 'accepted')
                    ->where(function ($q) use ($user) {
                        $q->where('user_id', $user->id)
                            ->orWhere('friend_id', $user->id);
                    })
                    ->get()
                    ->map(function ($f) use ($user) {
                        return $f->user_id === $user->id ? $f->friend_id : $f->user_id;
                    })
                    ->unique()
                    ->values()
                    ->toArray();
                break;

            case 'mutual':
                if (!$currentUserId) return [];

                $userFriendIds = Friendship::where('status', 'accepted')
                    ->where(function ($q) use ($user) {
                        $q->where('user_id', $user->id)
                            ->orWhere('friend_id', $user->id);
                    })
                    ->get()
                    ->map(fn($f) => $f->user_id === $user->id ? $f->friend_id : $f->user_id)
                    ->toArray();

                $currentFriendIds = Friendship::where('status', 'accepted')
                    ->where(function ($q) use ($currentUserId) {
                        $q->where('user_id', $currentUserId)
                            ->orWhere('friend_id', $currentUserId);
                    })
                    ->get()
                    ->map(fn($f) => $f->user_id === $currentUserId ? $f->friend_id : $f->user_id)
                    ->toArray();

                $friendIds = array_values(array_intersect($userFriendIds, $currentFriendIds));
                break;

            case 'followers':
                $friendIds = Friendship::where('status', 'pending')
                    ->where('friend_id', $user->id)
                    ->pluck('user_id')
                    ->toArray();
                break;

            case 'following':
                $friendIds = Friendship::where('status', 'pending')
                    ->where('user_id', $user->id)
                    ->pluck('friend_id')
                    ->toArray();
                break;

            case 'requests':
                $friendIds = Friendship::where('status', 'pending')
                    ->where(function ($q) use ($user) {
                        $q->where('user_id', $user->id)
                            ->orWhere('friend_id', $user->id);
                    })
                    ->get()
                    ->map(function ($f) use ($user) {
                        return $f->user_id === $user->id ? $f->friend_id : $f->user_id;
                    })
                    ->unique()
                    ->toArray();
                break;

            default:
                return [];
        }

        $friends = User::with('profile')
            ->whereIn('id', $friendIds)
            ->get();

        $result = $friends->map(function ($friend) use ($currentUserId) {
            $following = Friendship::where('user_id', $friend->id)->count();
            $followers = Friendship::where('friend_id', $friend->id)->count();

            $acceptedFriendships = Friendship::where('status', 'accepted')
                ->where(function ($q) use ($friend) {
                    $q->where('user_id', $friend->id)
                        ->orWhere('friend_id', $friend->id);
                })
                ->get();

            $uniqueFriendPairs = $acceptedFriendships->map(function ($f) {
                $ids = [$f->user_id, $f->friend_id];
                sort($ids);
                return implode('-', $ids);
            })->unique();

            $friendCount = $uniqueFriendPairs->count();

            $mutualCount = 0;
            if ($currentUserId) {
                $friendFriendIds1 = Friendship::where('status', 'accepted')
                    ->where('user_id', $friend->id)
                    ->pluck('friend_id')
                    ->toArray();

                $friendFriendIds2 = Friendship::where('status', 'accepted')
                    ->where('friend_id', $friend->id)
                    ->pluck('user_id')
                    ->toArray();

                $friendFriendIds = array_unique(array_merge($friendFriendIds1, $friendFriendIds2));

                $currentFriendIds1 = Friendship::where('status', 'accepted')
                    ->where('user_id', $currentUserId)
                    ->pluck('friend_id')
                    ->toArray();

                $currentFriendIds2 = Friendship::where('status', 'accepted')
                    ->where('friend_id', $currentUserId)
                    ->pluck('user_id')
                    ->toArray();

                $currentFriendIds = array_unique(array_merge($currentFriendIds1, $currentFriendIds2));
                
                $mutualCount = count(array_intersect($friendFriendIds, $currentFriendIds));
            }

            return [
                'id' => $friend->id,
                'username' => $friend->username,
                'email' => $friend->email,
                'first_name' => $friend->first_name,
                'last_name' => $friend->last_name,
                'bio' => $friend->bio,
                'avatar' => $friend->avatar,
                'mutual_friends_count' => $mutualCount,
                'user_data' => [
                    'following' => $following,
                    'followers' => $followers,
                    'friends' => $friendCount,
                ]
            ];
        });

        return $result->values();
    }



    public function getListFriendLimit($userId, $limit = 20)
    {
        $friendIds = Friendship::where('status', 'accepted')
            ->where(function ($q) use ($userId) {
                $q->where('user_id', $userId)
                    ->orWhere('friend_id', $userId);
            })
            ->get()
            ->map(function ($f) use ($userId) {
                return $f->user_id === $userId ? $f->friend_id : $f->user_id;
            })
            ->unique()
            ->values()
            ->toArray();

        $friends = User::whereIn('id', $friendIds)
            ->select('id', 'first_name', 'last_name', 'avatar', 'username')
            ->limit($limit)
            ->get();

        $userFriendIds = $friendIds;

        $friendFriendships = Friendship::where('status', 'accepted')
            ->where(function ($q) use ($friendIds) {
                $q->whereIn('user_id', $friendIds)
                    ->orWhereIn('friend_id', $friendIds);
            })
            ->get(['user_id', 'friend_id']);

        $friendFriendMap = [];
        foreach ($friendIds as $id) {
            $friendFriendMap[$id] = [];
        }

        foreach ($friendFriendships as $f) {
            if (in_array($f->user_id, $friendIds)) {
                $friendFriendMap[$f->user_id][] = $f->friend_id;
            }
            if (in_array($f->friend_id, $friendIds)) {
                $friendFriendMap[$f->friend_id][] = $f->user_id;
            }
        }

        return $friends->map(function ($friend) use ($userFriendIds, $friendFriendMap) {
            $friendFriends = $friendFriendMap[$friend->id] ?? [];
            $mutualCount = count(array_intersect($userFriendIds, $friendFriends));
            $conversationId = $this->getConversationFriends($friend->id);

            return [
                'id' => $conversationId,
                'mutual_friends_count' => $mutualCount,
                'type' => 'private',
                'other_user' => [
                    'id' => $friend->id,
                    'name' => "{$friend->first_name} {$friend->last_name}",
                    'avatar' => $friend->avatar,
                    'username' => $friend->username,
                ],
            ];
        });
    }


    public function getConversationFriends($userId)
    {
        $userId1 = Auth::user()->id;
        $userId2 = $userId;
        $conversation = Conversation::where('type', 'private')
            ->whereHas('users', function ($q) use ($userId1, $userId2) {
                $q->whereIn('user_id', [$userId1, $userId2]);
            }, '=', 2)
            ->whereHas('users', function ($q) use ($userId1) {
                $q->where('user_id', $userId1);
            })
            ->whereHas('users', function ($q) use ($userId2) {
                $q->where('user_id', $userId2);
            })
            ->first();

        return $conversation?->id;
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

    public function getUserStats(string $userId): array
    {
        $start = microtime(true);
        return Cache::remember("user_stats_{$userId}", 60, function () use ($userId) {
            $totalPosts = Post::where('user_id', $userId)->count();

            $totalFriends = Friendship::where('status', 'accepted')
                ->where(function ($query) use ($userId) {
                    $query->where('user_id', $userId)
                        ->orWhere('friend_id', $userId);
                })
                ->count();

            return [
                'total_posts' => $totalPosts,
                'total_friends' => $totalFriends,
            ];
        });
    }

    public function suggestFriends()
    {
        $userId = Auth::user()->id;
        $friendIds = DB::table('friendships')
            ->where('user_id', $userId)
            ->where('status', 'accepted')
            ->pluck('friend_id')
            ->toArray();

        $mutuals = DB::table('friendships as f1')
            ->join('friendships as f2', 'f1.friend_id', '=', 'f2.friend_id')
            ->join('users', 'users.id', '=', 'f2.user_id')
            ->where('f1.user_id', $userId)
            ->where('f2.user_id', '!=', $userId)
            ->where('f2.status', 'accepted')
            ->whereNotIn('f2.user_id', $friendIds)
            ->whereNotIn('f2.user_id', [$userId])
            ->select('users.id', 'users.first_name', 'users.last_name', 'users.avatar', DB::raw('COUNT(*) as mutual_count'))
            ->groupBy('users.id', 'users.first_name', 'users.last_name', 'users.avatar')
            ->get();

        $latestIp = DB::table('login_logs')
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->value('ip_address');

        $sameIpUsers = collect();
        if ($latestIp) {
            $sameIpUsers = DB::table('login_logs')
                ->join('users', 'users.id', '=', 'login_logs.user_id')
                ->where('login_logs.ip_address', $latestIp)
                ->where('users.id', '!=', $userId)
                ->whereNotIn('users.id', $friendIds)
                ->select('users.id', 'users.first_name', 'users.last_name', 'users.avatar')
                ->distinct()
                ->get();
        }

        $profile = DB::table('user_profiles')->where('user_id', $userId)->first();

        $similarProfiles = collect();
        if ($profile) {
            $similarProfiles = DB::table('user_profiles')
                ->join('users', 'users.id', '=', 'user_profiles.user_id')
                ->where('user_profiles.user_id', '!=', $userId)
                ->where(function ($query) use ($profile) {
                    $query->orWhere('user_profiles.location', $profile->location)
                        ->orWhere('user_profiles.current_school', $profile->current_school)
                        ->orWhere('user_profiles.past_school', $profile->past_school)
                        ->orWhere('user_profiles.workplace', $profile->workplace);
                })
                ->whereNotIn('users.id', $friendIds)
                ->select('users.id', 'users.first_name', 'users.last_name', 'users.avatar')
                ->distinct()
                ->get();
        }

        $allSuggestions = collect()
            ->merge($mutuals)
            ->merge($sameIpUsers)
            ->merge($similarProfiles)
            ->unique('id')
            ->values();

        return response()->json($allSuggestions);
    }

    public function searchFriends(string $searchTerm = null)
    {
        $userId = Auth::id();

        $listFriendIds = Friendship::where(function ($q) use ($userId) {
            $q->where('user_id', $userId)
                ->orWhere('friend_id', $userId);
        })
            ->where('status', 'accepted')
            ->get()
            ->map(function ($friendship) use ($userId) {
                return $friendship->user_id === $userId ? $friendship->friend_id : $friendship->user_id;
            })
            ->toArray();

        $conversations = Conversation::where('type', 'private')
            ->whereHas('users', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->with(['users' => function ($q) use ($userId) {
                $q->where('user_id', '!=', $userId);
            }])
            ->get();

        $conversationMap = [];
        foreach ($conversations as $conversation) {
            $friend = $conversation->users->first();
            if ($friend) {
                $conversationMap[$friend->id] = $conversation->id;
            }
        }

        if ($searchTerm) {
            $terms = explode(' ', $searchTerm);
            $users = User::whereIn('id', $listFriendIds)
                ->where(function ($q) use ($terms) {
                    foreach ($terms as $term) {
                        $q->where(function ($q2) use ($term) {
                            $q2->where('first_name', 'like', "%$term%")
                                ->orWhere('last_name', 'like', "%$term%")
                                ->orWhere('username', 'like', "%$term%");
                        });
                    }
                })
                ->get();

            return $users->map(function ($user) use ($conversationMap) {
                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'avatar' => $user->avatar,
                    'conversation_id' => $conversationMap[$user->id] ?? null,
                ];
            });
        }

        $friendMessagesCount = [];

        foreach ($conversations as $conversation) {
            $friend = $conversation->users->first();
            if (!$friend) continue;

            $messageCount = $conversation->messages()->count();
            $friendMessagesCount[$friend->id] = $messageCount;
        }

        arsort($friendMessagesCount);
        $topFriendIds = array_slice(array_keys($friendMessagesCount), 0, 10);

        $users = User::whereIn('id', $topFriendIds)->get();

        return $users->map(function ($user) use ($conversationMap) {
            return [
                'id' => $user->id,
                'username' => $user->username,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'avatar' => $user->avatar,
                'conversation_id' => $conversationMap[$user->id] ?? null,
            ];
        });
    }
}
