<?php

namespace App\Services;

use App\Models\Post;
use App\Models\Image;
use Illuminate\Support\Facades\Auth;
use App\Models\ActivityLog;
use Illuminate\Support\Str;
use App\Models\Page;
use App\Models\PageAdmin;

class PostService
{

    public function getFriendPost(string $user_id, $page = 1, $limit = 10)
    {

        $query = Post::where('user_id', $user_id)
            ->whereIn('visibility', ['public', 'friends'])
            ->where('is_review', false)
            ->orderBy('created_at', 'desc')
            ->with([
                'user' => function ($query) {
                    $query->select('users.id', 'username', 'first_name', 'last_name', 'avatar');
                },
                'reactions',
                'originalPost.user:id,username,first_name,last_name,avatar',
                'originalPost.taggedFriends:id,username,first_name,last_name,avatar'
            ])
            ->withCount(['comments', 'shares']);

        $offset = ($page - 1) * $limit;

        $posts = $query->skip($offset)->take($limit)->get();

        $posts = $posts->map(function ($post) {
            $user_tag = $post->taggedFriends()
                ->select('users.id', 'username', 'first_name', 'last_name', 'avatar')
                ->get();

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

            if ($post->post_format === 'shared' && $post->originalPost) {
                $original = $post->originalPost;

                if ($original->user) {
                    unset(
                        $original->user->gender,
                        $original->user->birthday,
                        $original->user->email,
                        $original->user->email_verified_at,
                        $original->user->phone,
                        $original->user->phone_verified_at,
                        $original->user->bio,
                        $original->user->remember_token,
                        $original->user->created_at,
                        $original->user->updated_at,
                        $original->user->is_admin,
                        $original->user->status,
                        $original->user->cover_photo,
                        $original->user->last_active
                    );
                }

                if ($original->taggedFriends) {
                    $original->taggedFriends->each(function ($user) {
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
                }

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

            if ($post->user) {
                unset(
                    $post->user->gender,
                    $post->user->birthday,
                    $post->user->email,
                    $post->user->email_verified_at,
                    $post->user->phone,
                    $post->user->phone_verified_at,
                    $post->user->bio,
                    $post->user->remember_token,
                    $post->user->created_at,
                    $post->user->updated_at,
                    $post->user->is_admin,
                    $post->user->status,
                    $post->user->cover_photo,
                    $post->user->last_active
                );
            }

            return $post;
        });

        return [
            'data' => $posts,
        ];
    }


    public function getMyPost($page = 1, $limit = 10)
    {
        $userId = Auth::id();

        $query = Post::where('user_id', $userId)
            ->whereIn('visibility', ['public', 'friends', 'private'])
            ->where('is_review', false)
            ->orderBy('created_at', 'desc')
            ->with([
                'user' => function ($query) {
                    $query->select('users.id', 'username', 'first_name', 'last_name', 'avatar');
                },
                'reactions',
                'originalPost.user:id,username,first_name,last_name,avatar',
                'originalPost.taggedFriends:id,username,first_name,last_name,avatar'
            ])
            ->withCount(['comments', 'shares']);

        $total = $query->count();
        $offset = ($page - 1) * $limit;

        $posts = $query->skip($offset)->take($limit)->get();


        $posts = $posts->map(function ($post) {
            $user_tag = $post->taggedFriends()
                ->select('users.id', 'username', 'first_name', 'last_name', 'avatar')
                ->get();

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

            if ($post->post_format === 'shared' && $post->originalPost) {
                $original = $post->originalPost;

                if ($original->user) {
                    unset(
                        $original->user->gender,
                        $original->user->birthday,
                        $original->user->email,
                        $original->user->email_verified_at,
                        $original->user->phone,
                        $original->user->phone_verified_at,
                        $original->user->bio,
                        $original->user->remember_token,
                        $original->user->created_at,
                        $original->user->updated_at,
                        $original->user->is_admin,
                        $original->user->status,
                        $original->user->cover_photo,
                        $original->user->last_active
                    );
                }

                if ($original->taggedFriends) {
                    $original->taggedFriends->each(function ($user) {
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
                }

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

            if ($post->user) {
                unset(
                    $post->user->gender,
                    $post->user->birthday,
                    $post->user->email,
                    $post->user->email_verified_at,
                    $post->user->phone,
                    $post->user->phone_verified_at,
                    $post->user->bio,
                    $post->user->remember_token,
                    $post->user->created_at,
                    $post->user->updated_at,
                    $post->user->is_admin,
                    $post->user->status,
                    $post->user->cover_photo,
                    $post->user->last_active
                );
            }

            return $post;
        });
        $hasMore = ($page * $limit) < $total;
        return [
            'data' => $posts,
            'has_more' => $hasMore,
        ];
    }



    public function store(array $data)
    {
        $post = new Post();
        $post->user_id = Auth::id();
        $post->content = $data['content'];

        $images = [];
        $videos = [];
        if (isset($data['media']) && is_array($data['media'])) {
            foreach ($data['media'] as $mediaItem) {
                if ($mediaItem['type'] === 'image') {
                    $images[] = $mediaItem['url'];
                } elseif ($mediaItem['type'] === 'video') {
                    $videos[] = $mediaItem['url'];
                }
            }
        }

        $post->images = !empty($images) ? implode('|', $images) : '';
        $post->videos = !empty($videos) ? implode('|', $videos) : '';

        $imageCount = count($images);
        $videoCount = count($videos);

        if (($imageCount + $videoCount) > 1) {
            $post->type = 'multiple';
        } elseif ($imageCount === 1 && $videoCount === 0) {
            $post->type = 'first';
        } elseif ($videoCount === 1 && $imageCount === 0) {
            $post->type = 'first';
        } elseif (!empty($post->iframe_link)) {
            $post->type = 'third';
        } else {
            $post->type = 'second';
        }

        $post->visibility = $data['visibility'];
        $post->is_comment_disabled = $data['is_comment_disabled'] ?? false;
        $post->feeling = $data['feeling'] ?? null;
        $post->checkin = $data['checkin'] ?? null;
        $post->bg_id = $data['bg_id'] ?? null;

        $post->save();

        ActivityLog::create([
            'id' => Str::uuid(),
            'user_id' => Auth::id(),
            'action' => 'created_post',
            'target_type' => Post::class,
            'target_id' => $post->id,
            'metadata' => [
                'content' => "Bạn đã đăng một bài viết mới",
                'has_images' => !empty($images),
                'has_videos' => !empty($videos),
            ],
        ]);

        if (!empty($data['tagfriends']) && is_array($data['tagfriends'])) {
            $post->taggedFriends()->attach($data['tagfriends']);
        }

        if (isset($data['media']) && is_array($data['media'])) {
            foreach ($data['media'] as $mediaItem) {
                Image::create([
                    'id' => Str::uuid(),
                    'user_id' => Auth::id(),
                    'url' => $mediaItem['url'],
                    'public_id' => $mediaItem['public_id'],
                    'type' => $mediaItem['type'],
                    'folder' => 'post',
                    'post_id' => $post->id,
                ]);
            }
        }

        return response()->json($post);
    }

    public function storePagePost(array $data, $pageId)
    {
        $post = new Post();
        $post->user_id = Auth::id();
        $post->page_id = $pageId;
        $post->content = $data['content'];

        $images = [];
        $videos = [];
        if (isset($data['media']) && is_array($data['media'])) {
            foreach ($data['media'] as $mediaItem) {
                if ($mediaItem['type'] === 'image') {
                    $images[] = $mediaItem['url'];
                } elseif ($mediaItem['type'] === 'video') {
                    $videos[] = $mediaItem['url'];
                }
            }
        }

        $post->images = !empty($images) ? implode('|', $images) : '';
        $post->videos = !empty($videos) ? implode('|', $videos) : '';

        $imageCount = count($images);
        $videoCount = count($videos);

        if (($imageCount + $videoCount) > 1) {
            $post->type = 'multiple';
        } elseif ($imageCount === 1 && $videoCount === 0) {
            $post->type = 'first';
        } elseif ($videoCount === 1 && $imageCount === 0) {
            $post->type = 'first';
        } elseif (!empty($post->iframe_link)) {
            $post->type = 'third';
        } else {
            $post->type = 'second';
        }

        $post->visibility = $data['visibility'];
        $post->is_comment_disabled = $data['is_comment_disabled'] ?? false;
        $post->feeling = $data['feeling'] ?? null;
        $post->checkin = $data['checkin'] ?? null;
        $post->bg_id = $data['bg_id'] ?? null;

        $post->save();

        ActivityLog::create([
            'id' => Str::uuid(),
            'user_id' => Auth::id(),
            'action' => 'created_page_post',
            'target_type' => Post::class,
            'target_id' => $post->id,
            'metadata' => [
                'content' => "Bạn đã đăng một bài viết mới cho trang",
                'page_id' => $pageId,
                'has_images' => !empty($images),
                'has_videos' => !empty($videos),
            ],
        ]);

        if (!empty($data['tagfriends']) && is_array($data['tagfriends'])) {
            $post->taggedFriends()->attach($data['tagfriends']);
        }

        if (isset($data['media']) && is_array($data['media'])) {
            foreach ($data['media'] as $mediaItem) {
                Image::create([
                    'id' => Str::uuid(),
                    'user_id' => Auth::id(),
                    'post_id' => $post->id,
                    'url' => $mediaItem['url'],
                    'public_id' => $mediaItem['public_id'],
                    'type' => $mediaItem['type'],
                    'folder' => 'page_post',
                    'post_id' => $post->id,
                ]);
            }
        }

        return response()->json($post);
    }


    public function getPagePosts($pageId, $page = 1, $limit = 10)
    {
        $pageModel = Page::find($pageId);
        if (!$pageModel) {
            return response()->json(['message' => 'Page not found'], 404);
        }
        $query = Post::where('page_id', $pageId)
            ->whereIn('visibility', ['public', 'friends', 'private'])
            ->orderBy('created_at', 'desc')
            ->with([
                'user' => function ($query) {
                    $query->select('users.id', 'username', 'first_name', 'last_name', 'avatar');
                },
                'page' => function ($query) {
                    $query->select('pages.id', 'name', 'avatar', 'slug');
                },
                'reactions',
                'originalPost.user:id,username,first_name,last_name,avatar',
                'originalPost.taggedFriends:id,username,first_name,last_name,avatar'
            ])
            ->withCount(['comments', 'shares']);

        $total = $query->count();
        $offset = ($page - 1) * $limit;

        $posts = $query->skip($offset)->take($limit)->get();

        $posts = $posts->map(function ($post) {
            $user_tag = $post->taggedFriends()
                ->select('users.id', 'username', 'first_name', 'last_name', 'avatar')
                ->get();

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

            if ($post->post_format === 'shared' && $post->originalPost) {
                $original = $post->originalPost;

                if ($original->user) {
                    unset(
                        $original->user->gender,
                        $original->user->birthday,
                        $original->user->email,
                        $original->user->email_verified_at,
                        $original->user->phone,
                        $original->user->phone_verified_at,
                        $original->user->bio,
                        $original->user->remember_token,
                        $original->user->created_at,
                        $original->user->updated_at,
                        $original->user->is_admin,
                        $original->user->status,
                        $original->user->cover_photo,
                        $original->user->last_active
                    );
                }

                if ($original->taggedFriends) {
                    $original->taggedFriends->each(function ($user) {
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
                }

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

            if ($post->user) {
                unset(
                    $post->user->gender,
                    $post->user->birthday,
                    $post->user->email,
                    $post->user->email_verified_at,
                    $post->user->phone,
                    $post->user->phone_verified_at,
                    $post->user->bio,
                    $post->user->remember_token,
                    $post->user->created_at,
                    $post->user->updated_at,
                    $post->user->is_admin,
                    $post->user->status,
                    $post->user->cover_photo,
                    $post->user->last_active
                );
            }

            return $post;
        });

        $hasMore = ($page * $limit) < $total;

        return [
            'data' => $posts,
            'has_more' => $hasMore,
            'page_info' => [
                'id' => $pageModel->id,
                'name' => $pageModel->name,
                'avatar' => $pageModel->avatar,
            ]
        ];
    }

    public function getMyPagesPosts($page = 1, $limit = 10)
    {
        $userId = Auth::id();

        $pageIds = PageAdmin::where('user_id', $userId)
            ->pluck('page_id');

        if ($pageIds->isEmpty()) {
            return [
                'data' => [],
                'has_more' => false,
            ];
        }

        $query = Post::whereIn('page_id', $pageIds)
            ->whereIn('visibility', ['public', 'friends', 'private'])
            ->orderBy('created_at', 'desc')
            ->with([
                'user' => function ($query) {
                    $query->select('users.id', 'username', 'first_name', 'last_name', 'avatar');
                },
                'page' => function ($query) {
                    $query->select('pages.id', 'name', 'avatar', 'slug');
                },
                'reactions',
                'originalPost.user:id,username,first_name,last_name,avatar',
                'originalPost.taggedFriends:id,username,first_name,last_name,avatar'
            ])
            ->withCount(['comments', 'shares']);

        $total = $query->count();
        $offset = ($page - 1) * $limit;

        $posts = $query->skip($offset)->take($limit)->get();

        $posts = $posts->map(function ($post) {
            return $post;
        });

        $hasMore = ($page * $limit) < $total;

        return [
            'data' => $posts,
            'has_more' => $hasMore,
        ];
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
