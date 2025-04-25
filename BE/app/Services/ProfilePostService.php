<?php

namespace App\Services;

use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ProfilePostService
{
    public function getProfilePosts($userId, $page = 1, $perPage = 10)
    {
        $currentUserId = Auth::id();
        $isOwnProfile = $currentUserId === $userId;

        $query = Post::with([
            'user',
            'comments' => function ($query) {
                $query->with('user')->latest();
            },
            'reactions' => function ($query) {
                $query->with('user');
            },
            'shares' => function ($query) {
                $query->with('user');
            }
        ])
            ->where('user_id', $userId);

        if (!$isOwnProfile) {
            $query->where('visibility', 'public');
        }

        $posts = $query->latest()
            ->paginate($perPage, ['*'], 'page', $page);

        $posts->getCollection()->transform(function ($post) {
            return [
                'id' => $post->id,
                'post_id' => $post->post_id,
                'content' => $post->content,
                'images' => $post->images,
                'videos' => $post->videos,
                'visibility' => $post->visibility,
                'is_comment_disabled' => $post->is_comment_disabled,
                'created_at' => $post->created_at,
                'updated_at' => $post->updated_at,
                'user' => [
                    'id' => $post->user->id,
                    'username' => $post->user->username,
                    'first_name' => $post->user->first_name,
                    'last_name' => $post->user->last_name,
                    'avatar' => $post->user->avatar,
                ],
                'comments' => $post->comments->map(function ($comment) {
                    return [
                        'id' => $comment->id,
                        'content' => $comment->content,
                        'created_at' => $comment->created_at,
                        'user' => [
                            'id' => $comment->user->id,
                            'username' => $comment->user->username,
                            'first_name' => $comment->user->first_name,
                            'last_name' => $comment->user->last_name,
                            'avatar' => $comment->user->avatar,
                        ]
                    ];
                }),
                'reactions' => $post->reactions->map(function ($reaction) {
                    return [
                        'id' => $reaction->id,
                        'type' => $reaction->type,
                        'user' => [
                            'id' => $reaction->user->id,
                            'username' => $reaction->user->username,
                            'first_name' => $reaction->user->first_name,
                            'last_name' => $reaction->user->last_name,
                            'avatar' => $reaction->user->avatar,
                        ]
                    ];
                }),
                'shares' => $post->shares->map(function ($share) {
                    return [
                        'id' => $share->id,
                        'message' => $share->message,
                        'created_at' => $share->created_at,
                        'user' => [
                            'id' => $share->user->id,
                            'username' => $share->user->username,
                            'first_name' => $share->user->first_name,
                            'last_name' => $share->user->last_name,
                            'avatar' => $share->user->avatar,
                        ]
                    ];
                }),
                'reaction_summary' => $post->reactionSummary(),
                'share_count' => $post->shareSummary(),
            ];
        });

        return $posts;
    }

    public function getMyPosts($page = 1, $perPage = 10)
    {
        $currentUserId = Auth::id();
        $posts = Post::with([
            'user',
            'comments' => function ($query) {
                $query->with('user')->latest();
            },
            'reactions' => function ($query) {
                $query->with('user');   
            },
            'shares' => function ($query) {
                $query->with('user');
            }
        ])
            ->where('user_id', $currentUserId)
            ->latest()
            ->paginate($perPage, ['*'], 'page', $page);

        $posts->getCollection()->transform(function ($post) {
            return [
                'id' => $post->id,
                'post_id' => $post->post_id,
                'content' => $post->content,
                'images' => $post->images,
                'videos' => $post->videos,
                'visibility' => $post->visibility,
                'is_comment_disabled' => $post->is_comment_disabled,
                'created_at' => $post->created_at,
                'updated_at' => $post->updated_at,
                'user' => [
                    'id' => $post->user->id,
                    'username' => $post->user->username,
                    'first_name' => $post->user->first_name,
                    'last_name' => $post->user->last_name,
                    'avatar' => $post->user->avatar,
                ],
                'comments' => $post->comments->map(function ($comment) {
                    return [
                        'id' => $comment->id,
                        'content' => $comment->content,
                        'created_at' => $comment->created_at,
                        'user' => [
                            'id' => $comment->user->id,
                            'username' => $comment->user->username,
                            'first_name' => $comment->user->first_name,
                            'last_name' => $comment->user->last_name,
                            'avatar' => $comment->user->avatar,
                        ]
                    ];
                }),
                'reactions' => $post->reactions->map(function ($reaction) {
                    return [
                        'id' => $reaction->id,
                        'type' => $reaction->type,
                        'user' => [
                            'id' => $reaction->user->id,
                            'username' => $reaction->user->username,
                            'first_name' => $reaction->user->first_name,
                            'last_name' => $reaction->user->last_name,
                            'avatar' => $reaction->user->avatar,
                        ]
                    ];
                }),
                'shares' => $post->shares->map(function ($share) {
                    return [
                        'id' => $share->id, 
                        'message' => $share->message,
                        'created_at' => $share->created_at,
                        'user' => [
                            'id' => $share->user->id,
                            'username' => $share->user->username,
                            'first_name' => $share->user->first_name,
                            'last_name' => $share->user->last_name,
                            'avatar' => $share->user->avatar,
                        ]
                    ];
                }),
                'reaction_summary' => $post->reactionSummary(), 
                'share_count' => $post->shareSummary(),
            ];
        });

        return $posts;
    }
}
