<?php

namespace App\Http\Controllers\User;

use App\Models\User;
use App\Models\Page;
use App\Models\Post;
use App\Models\SearchHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{

    public function search(Request $request)
    {
        $searchTerm = $request->query('searchTerm');
        $userId = Auth::id();

        if (!$searchTerm) {
            return response()->json([
                'users' => [],
                'posts' => [],
                'pages' => [],
                'friends' => [],
                'friendsOfFriends' => [],
                'strangers' => [],
            ]);
        }
        $searchKeywords = explode(' ', $searchTerm);



        $friendIds = DB::table('friendships')
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->orWhere('friend_id', $userId);
            })
            ->where('status', 'accepted')
            ->get()
            ->map(function ($friendship) use ($userId) {
                return $friendship->user_id == $userId ? $friendship->friend_id : $friendship->user_id;
            })
            ->toArray();

        $friendsOfFriendsIds = DB::table('friendships')
            ->whereIn('user_id', $friendIds)
            ->orWhereIn('friend_id', $friendIds)
            ->where('status', 'accepted')
            ->get()
            ->map(function ($friendship) use ($friendIds) {
                return in_array($friendship->user_id, $friendIds) ? $friendship->friend_id : $friendship->user_id;
            })
            ->unique()
            ->diff($friendIds)
            ->diff([$userId])
            ->values()
            ->toArray();

        $allUsers = User::where('id', '!=', $userId)
            ->where(function ($query) use ($searchKeywords) {
                foreach ($searchKeywords as $keyword) {
                    $query->where(function ($q) use ($keyword) {
                        $q->where('username', 'like', "%$keyword%")
                            ->orWhere('first_name', 'like', "%$keyword%")
                            ->orWhere('last_name', 'like', "%$keyword%");
                    });
                }
            })
            ->get()
            ->map(function ($user) use ($friendIds, $friendsOfFriendsIds, $userId) {
                $relationship = 'stranger';
                if (in_array($user->id, $friendIds)) {
                    $relationship = 'friend';
                } elseif (in_array($user->id, $friendsOfFriendsIds)) {
                    $relationship = 'friend_of_friend';
                }

                $mutualCount = $relationship === 'friend'
                    ? app(\App\Services\FriendService::class)->countMutualFriends($userId, $user->id)
                    : 0;

                return [
                    'type' => 'user',
                    'id' => $user->id,
                    'username' => $user->username,
                    'name' => trim("{$user->first_name} {$user->last_name}"),
                    'avatar' => $user->avatar,
                    'relationship' => $relationship,
                    'mutual_friends_count' => $mutualCount,
                ];
            });

        $friends = $allUsers->filter(fn($user) => $user['relationship'] === 'friend')->values();
        $friendsOfFriends = $allUsers->filter(fn($user) => $user['relationship'] === 'friend_of_friend')->values();
        $strangers = $allUsers->filter(fn($user) => $user['relationship'] === 'stranger')->values();


        $friendsOfFriends = $allUsers->filter(function ($user) use ($friendsOfFriendsIds) {
            return in_array($user['id'], $friendsOfFriendsIds);
        })->values();

        $strangers = $allUsers->filter(function ($user) use ($friendIds, $friendsOfFriendsIds) {
            return !in_array($user['id'], $friendIds) && !in_array($user['id'], $friendsOfFriendsIds);
        })->values();

        $posts = Post::where('content', 'like', "%$searchTerm%")
            ->whereIn('visibility', ['public', 'friends'])
            ->where('is_review', false)
            ->orderBy('created_at', 'desc')
            ->with([
                'user:id,username,first_name,last_name,avatar',
                'reactions',
                'originalPost.user:id,username,first_name,last_name,avatar',
                'originalPost.taggedFriends:id,username,first_name,last_name,avatar'
            ])
            ->withCount(['comments', 'shares'])
            ->limit(10)
            ->get()
            ->map(function ($post) {
                $user_tag = $post->taggedFriends()
                    ->select('users.id', 'username', 'first_name', 'last_name', 'avatar')
                    ->get();

                $post->taggedFriends = $user_tag;

                if ($post->post_format === 'shared' && $post->originalPost) {
                    $original = $post->originalPost;

                    $post->shared_post = $original;
                    unset($post->originalPost);
                }

                $post->total_reactions = $post->reactions->count();
                $post->reaction_counts = $post->reactions
                    ->groupBy('type')
                    ->map->count();

                $post->total_comments = $post->comments_count;
                $post->total_shares = $post->shares_count;

                unset(
                    $post->reactions,
                    $post->comments_count,
                    $post->shares_count,
                    $post->comments,
                    $post->shares
                );

                return $post;
            });


        $pages = Page::where('name', 'like', "%$searchTerm%")
            ->orWhere('description', 'like', "%$searchTerm%")
            ->withCount('followers')
            ->withExists([
                'followers as is_followed' => function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                }
            ])
            ->limit(10)
            ->get()
            ->map(function ($page) {
                return [
                    'type' => 'page',
                    'id' => $page->id,
                    'name' => $page->name,
                    'slug' => $page->slug,
                    'avatar' => $page->avatar,
                    'description' => $page->description,
                    'page_type' => $page->type,
                    'followers_count' => $page->followers_count,
                    'is_followed' => (bool) $page->is_followed,
                ];
            });


        return response()->json([
            'users' => $allUsers,
            'posts' => $posts,
            'pages' => $pages,
            'friends' => $friends,
            'friendsOfFriends' => $friendsOfFriends,
            'strangers' => $strangers,
        ]);
    }

    public function saveHistory(Request $request)
    {
        $request->validate([
            'type' => 'required|in:user,page,none',
            'target_id' => 'nullable|string',
            'keyword' => 'required_if:type,none|string'
        ]);

        $userId = Auth::id();
        $type = $request->type;
        $targetId = $request->target_id;

        $keyword = null;

        if ($type === 'user') {
            $user = User::find($targetId);
            if ($user) {
                $keyword = trim("{$user->first_name} {$user->last_name}");
            }
        } elseif ($type === 'page') {
            $page = Page::find($targetId);
            if ($page) {
                $keyword = $page->name;
            }
        } elseif ($type === 'none') {
            $keyword = $request->keyword;
        }


        if (!$keyword) {
            return response()->json(['message' => 'Target not found.'], 404);
        }

        SearchHistory::updateOrCreate(
            [
                'user_id' => $userId,
                'type' => $type,
                'target_id' => $type === 'none' ? null : $targetId,
            ],
            [
                'keyword' => $keyword,
                'updated_at' => now(),
            ]
        );

        return response()->json(['message' => 'Saved.']);
    }


    public function history()
    {
        $userId = Auth::id();

        $histories = SearchHistory::where('user_id', $userId)
            ->orderByDesc('updated_at')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                if ($item->type === 'user') {
                    $user = User::select('id', 'username', 'first_name', 'last_name', 'avatar')
                        ->find($item->target_id);

                    if ($user) {
                        return [
                            'type' => 'user',
                            'id' => $user->id,
                            'username' => $user->username,
                            'name' => trim($user->first_name . ' ' . $user->last_name),
                            'avatar' => $user->avatar,
                        ];
                    }
                }

                if ($item->type === 'page') {
                    $page = Page::select('id', 'name', 'slug', 'avatar')
                        ->find($item->target_id);

                    if ($page) {
                        return [
                            'type' => 'page',
                            'id' => $page->id,
                            'name' => $page->name,
                            'slug' => $page->slug,
                            'avatar' => $page->avatar,
                        ];
                    }
                }

                return null;
            })
            ->filter()
            ->values();

        return response()->json($histories);
    }
}
