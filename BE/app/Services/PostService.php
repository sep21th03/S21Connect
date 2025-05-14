<?php

namespace App\Services;

use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use App\Models\Share;

class PostService
{
    public function public_post()
    {
        $posts = Post::where('visibility', 'public')
            ->orWhere('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->with('user')
            ->get()
            ->map(function ($post) {
                $images = !empty($post->images) ? explode('|', $post->images) : [];
                $videos = !empty($post->videos) ? explode('|', $post->videos) : [];

                $imageCount = count($images);
                $videoCount = count($videos);

                if (isset($post->user)) {
                    $user = $post->user;
                    unset($user->gender, $user->birthday, $user->email, $user->email_verified_at, $user->phone, $user->phone_verified_at, $user->bio, $user->remember_token, $user->created_at, $user->updated_at, $user->is_admin, $user->status, $user->cover_photo, $user->last_active);
                    $post->user = $user;
                }
                return $post;
            });

        return response()->json($posts);
    }

    public function getFriendPost(string $user_id)
    {
        return Post::where('user_id', $user_id)
            ->whereIn('visibility', ['public', 'friends'])
            ->orderBy('created_at', 'desc')
            ->with([
                'user' => function ($query) {
                    $query->select('id', 'username', 'first_name', 'last_name', 'avatar');
                },
                'reactions'
            ])
            ->withCount(['comments', 'shares'])
            ->get()
            ->map(function ($post) {

                $user_tag = $post->taggedFriends()->get();
                if ($user_tag) {
                    $user_tag->each(function ($user) {
                        unset(
                            $user->gender,
                            $user->birthday,
                            $user->email,
                            $user->email_verified_at,
                            $user->phone,
                            $user->phone_verified_at,
                            $user->bio,
                            $user->remember_token,
                            $user->created_at,
                            $user->updated_at,
                            $user->is_admin,
                            $user->status,
                            $user->cover_photo,
                            $user->last_active
                        );
                    });
                    $post->taggedFriends = $user_tag;
                }
                $post->total_reactions = $post->reactions->count();
                $post->reaction_counts = $post->reactions
                    ->groupBy('type')
                    ->map(function ($group) {
                        return $group->count();
                    });
                $post->total_comments = $post->comments->count();
                $post->total_shares = $post->shares->count();
                unset(
                    $post->reactions,
                    $post->comments_count,
                    $post->shares_count,
                    $post->comments,
                    $post->shares
                );

                if (isset($user_tag)) {
                    unset($post->user->gender, $post->user->birthday, $post->user->email, $post->user->email_verified_at, $post->user->phone, $post->user->phone_verified_at, $post->user->bio, $post->user->remember_token, $post->user->created_at, $post->user->updated_at, $post->user->is_admin, $post->user->status, $post->user->cover_photo, $post->user->last_active);
                }
                return $post;
            });
    }


    public function getMyPost()
    {
        $userId = Auth::id();
        return Post::where('user_id', $userId)
            ->whereIn('visibility', ['public', 'friends', 'private'])
            ->orderBy('created_at', 'desc')
            ->with([
                'user' => function ($query) {
                    $query->select('id', 'username', 'first_name', 'last_name', 'avatar');
                },
                'reactions'
            ])
            ->withCount(['comments', 'shares'])
            ->get()
            ->map(function ($post) {
                $user_tag = $post->taggedFriends()->get();
                if ($user_tag) {
                    $user_tag->each(function ($user) {
                        unset(
                            $user->gender,
                            $user->birthday,
                            $user->email,
                            $user->email_verified_at,
                            $user->phone,
                            $user->phone_verified_at,
                            $user->bio,
                            $user->remember_token,
                            $user->created_at,
                            $user->updated_at,
                            $user->is_admin,
                            $user->status,
                            $user->cover_photo,
                            $user->last_active
                        );
                    });
                    $post->taggedFriends = $user_tag;
                }
                $post->total_reactions = $post->reactions->count();
                $post->reaction_counts = $post->reactions
                    ->groupBy('type')
                    ->map(function ($group) {
                        return $group->count();
                    });
                $post->total_comments = $post->comments->count();
                $post->total_shares = $post->shares->count();

                unset(
                    $post->reactions,
                    $post->comments_count,
                    $post->shares_count,
                    $post->comments,
                    $post->shares
                );

                if (isset($user_tag)) {
                    unset($post->user->gender, $post->user->birthday, $post->user->email, $post->user->email_verified_at, $post->user->phone, $post->user->phone_verified_at, $post->user->bio, $post->user->remember_token, $post->user->created_at, $post->user->updated_at, $post->user->is_admin, $post->user->status, $post->user->cover_photo, $post->user->last_active);
                }
                return $post;
            });

        // $sharedPosts = Share::where('user_id', $userId)
        //     ->with([
        //         'post.user:id,username,first_name,last_name,avatar',
        //         'post.reactions',
        //     ])
        //     ->get()
        //     ->map(function ($share) {
        //         $post = $share->post;

        //         $user_tag = $post?->taggedFriends()?->get();

        //         if ($user_tag) {
        //             $user_tag->each(function ($user) {
        //                 unset(
        //                     $user->gender,
        //                     $user->birthday,
        //                     $user->email,
        //                     $user->email_verified_at,
        //                     $user->phone,
        //                     $user->phone_verified_at,
        //                     $user->bio,
        //                     $user->remember_token,
        //                     $user->created_at,
        //                     $user->updated_at,
        //                     $user->is_admin,
        //                     $user->status,
        //                     $user->cover_photo,
        //                     $user->last_active
        //                 );
        //             });
        //             $post->taggedFriends = $user_tag;
        //         }
        //         if (isset($user_tag)) {
        //             unset($post->user->gender, $post->user->birthday, $post->user->email, $post->user->email_verified_at, $post->user->phone, $post->user->phone_verified_at, $post->user->bio, $post->user->remember_token, $post->user->created_at, $post->user->updated_at, $post->user->is_admin, $post->user->status, $post->user->cover_photo, $post->user->last_active);
        //         }

        //         $post->shared_at = $share->created_at;
        //         $post->shared_message = $share->message;
        //         return $post;
        //     });

        // $allPosts = $myPosts->merge($sharedPosts)->sortByDesc(function ($post) {
        //     return $post->shared_at ?? $post->created_at;
        // })->values();

        // return $allPosts;
    }


    public function store(array $data)
    {
        $post = new Post();
        $post->user_id = Auth::id();
        $post->content = $data['content'];

        $post->images = isset($data['images']) ? implode('|', $data['images']) : '';
        $post->videos = isset($data['videos']) ? implode('|', $data['videos']) : '';

        $images = !empty($post->images) ? explode('|', $post->images) : [];
        $videos = !empty($post->videos) ? explode('|', $post->videos) : [];

        $imageCount = count($images);
        $videoCount = count($videos);

        if (($imageCount + $videoCount) > 1) {
            $post->type = 'multiple';
        } elseif ($imageCount === 1) {
            $post->type = 'first';
        } elseif (!empty($post->iframe_link) || $post->fourthPost) {
            $post->type = 'third';
        } elseif ($imageCount === 0) {
            $post->type = 'second';
        } else {
            $post->type = 'second';
        }

        $post->visibility = $data['visibility'];
        $post->is_comment_disabled = $data['is_comment_disabled'] ?? false;
        $post->feeling = $data['feeling'] ?? null;
        $post->checkin = $data['checkin'] ?? null;
        $post->bg_id = $data['bg_id'] ?? null;

        $post->save();

        if (!empty($data['tagfriends']) && is_array($data['tagfriends'])) {
            $post->taggedFriends()->attach($data['tagfriends']);
        }
        return response()->json($post);
    }

    public function updatePost($data, string $post_id)
    {
        $post = Post::where('post_id', $post_id)->firstOrFail();

        if (Auth::id() !== $post->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post->content = $data['content'] ?? $post->content;
        $post->images = isset($data['images']) ? implode('|', $data['images']) : '';
        $post->videos = isset($data['videos']) ? implode('|', $data['videos']) : '';
        $post->visibility = $data['visibility'] ?? $post->visibility;
        $post->is_comment_disabled = $data['is_comment_disabled'] ?? false;
        $post->feeling = $data['feeling'] ?? null;
        $post->checkin = $data['checkin'] ?? null;
        $post->bg_id = $data['bg_id'] ?? null;

        $images = !empty($post->images) ? explode('|', $post->images) : [];
        $videos = !empty($post->videos) ? explode('|', $post->videos) : [];

        $imageCount = count($images);
        $videoCount = count($videos);

        if (($imageCount + $videoCount) > 1) {
            $post->type = 'multiple';
        } elseif ($imageCount === 1) {
            $post->type = 'first';
        } elseif (!empty($post->iframe_link) || $post->fourthPost) {
            $post->type = 'third';
        } elseif ($imageCount === 0) {
            $post->type = 'second';
        } else {
            $post->type = 'second';
        }

        $post->save();

        if (isset($data['tagfriends']) && is_array($data['tagfriends'])) {
            $post->taggedFriends()->sync($data['tagfriends']);
        } else {
            $post->taggedFriends()->detach();
        }

        $post->load(['user' => function ($query) {
            $query->select('id', 'username', 'first_name', 'last_name', 'avatar');
        }]);

        return $post;
    }


    public function destroy(string $post_id)
    {
        $post = Post::where('post_id', $post_id)->firstOrFail();

        if (!$post) {
            return false;
        }

        if (Auth::id() !== $post->user_id && !Auth::user()->is_admin) {
            return false;
        }

        return $post->delete();
    }

    public function toggleComment(string $id)
    {
        $post = Post::where('id', $id)->first();
        if (!$post) {
            return response()->json(['error' => 'Bài viết không tồn tại'], 404);
        }
        if (Auth::id() !== $post->user_id && !Auth::user()->is_admin) {
            return response()->json(['error' => 'Không có quyền chỉnh sửa'], 403);
        }
        $post->is_comment_disabled = !$post->is_comment_disabled;
        $post->save();

        return $post;
    }

    public function getPostReactions($postId)
    {
        $post = Post::findOrFail($postId);

        return [
            'post_id' => $post->id,
            'reactions' => $post->reactionSummary(),
            'shares' => $post->shareSummary(),
        ];
    }
}
