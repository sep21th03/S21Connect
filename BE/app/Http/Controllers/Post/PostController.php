<?php

namespace App\Http\Controllers\Post;

use App\Http\Controllers\Controller;
use App\Services\PostService;
use App\Http\Requests\User\Post\StorePostRequest;
use App\Http\Requests\User\Post\UpdatePostRequest;
use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\Notification;
use App\Models\Friendship;
use App\Models\Comment;

class PostController extends Controller
{

    protected $postService;

    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
    }

    public function getFriendPost(Request $request)
    {
        $user_id = $request->query('user_id');
        if (!$user_id) {
            return response()->json(['error' => 'User ID is required'], 400);
        }

        $page = $request->query('page', 1);
        $limit = $request->query('limit', 10);

        $posts = $this->postService->getFriendPost($user_id, $page, $limit);
        return response()->json($posts);
    }

    public function getMyPost(Request $request)
    {
        $page = $request->query('page', 1);
        $limit = $request->query('limit', 10);
        $posts = $this->postService->getMyPost($page, $limit);
        return response()->json($posts);
    }

    public function editPost(UpdatePostRequest $request)
    {
        $data = $request->validated();
        $post_id = $data['post_id'];
        $post = $this->postService->updatePost($data, $post_id);
        return response()->json(['data' => $post]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePostRequest $request)
    {
        $this->postService->store($request->validated());
        return response()->json(['message' => 'Tạo bài viết thành công']);
    }

    /**
     * Display the specified resource.
     */

    public function show($postId, Request $request)
    {
        $commentId = $request->query('comment_id');
        $replyCommentId = $request->query('reply_comment_id');
        $reactionId = $request->query('reaction_id');
        $notifId = $request->query('notification_id');

        $post = Post::with([
            'user:id,username,first_name,last_name,avatar',
            'reactions'
        ])
            ->withCount(['comments', 'shares'])
            ->findOrFail($postId);

        if ($notifId && auth()->check()) {
            Notification::where('id', $notifId)
                ->where('user_id', auth()->id())
                ->update(['is_read' => true]);
        }

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
        
        return response()->json([
            'post' => $post,
            'highlight_comment_id' => $commentId,
            'highlight_reply_comment_id' => $replyCommentId,
            'highlight_reaction_id' => $reactionId,
        ]);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $post_id)
    {
        if ($this->postService->destroy($post_id)) {
            return response()->json(['message' => 'Xóa bài viết thành công'], 200);
        }
        return response()->json(['error' => 'Xóa bài viết thất bại hoặc không có quyền'], 403);
    }

    public function toggleComment(string $post_id)
    {
        $post = $this->postService->toggleComment($post_id);
        return response()->json([
            'message' => $post->is_comment_disabled ? 'Đã khóa bình luận' : 'Đã mở bình luận',
        ]);
    }

    public function getPostReactions($postId)
    {
        $data = $this->postService->getPostReactions($postId);
        return response()->json($data);
    }

    public function getNewsFeed(Request $request)
    {
        $user = auth()->user();
        $cursor = $request->query('after');
        $limit = $request->query('limit', 10);

        $friendIds = Friendship::where('user_id', $user->id)
            ->where('status', 'accepted')
            ->pluck('friend_id')
            ->toArray();

        $allowedUserIds = array_merge($friendIds, [$user->id]);

        $query = Post::with([
            'user' => function ($query) {
                $query->select('users.id', 'username', 'first_name', 'last_name', 'avatar');
            },
            'reactions' => function ($query) use ($user) {
                $query->limit(100);
            },
            'taggedFriends' => function ($query) {
                $query->select('users.id', 'username', 'first_name', 'last_name', 'avatar');
            }
        ])
            ->withCount(['comments', 'shares'])
            ->whereIn('user_id', $allowedUserIds)
            ->where(function ($q) use ($user) {
                $q->where('visibility', 'public')
                    ->orWhereIn('visibility', ['friends']);
            });

        if ($cursor) {
            $query->where('created_at', '<', $cursor);
        }

        $posts = $query->orderByDesc('created_at')
            ->limit($limit + 1)
            ->get();

        $hasMore = $posts->count() > $limit;

        if ($hasMore) {
            $posts = $posts->slice(0, $limit);
        }

        $nextCursor = $posts->last() ? $posts->last()->created_at->toIso8601String() : null;

        $posts = $posts->map(function ($post) use ($user, $friendIds) {
            if ($post->taggedFriends) {
                $post->taggedFriends->makeHidden([
                    'gender',
                    'birthday',
                    'email',
                    'email_verified_at',
                    'phone',
                    'phone_verified_at',
                    'bio',
                    'remember_token',
                    'created_at',
                    'updated_at',
                    'is_admin',
                    'status',
                    'cover_photo',
                    'last_active'
                ]);
            }

            $reactionCounts = $post->reactions->groupBy('type')->map->count();
            $totalReactions = $post->reactions->count();

            $userReaction = $post->reactions->where('user_id', $user->id)->first();

            $post->user->makeHidden([
                'gender',
                'birthday',
                'email',
                'email_verified_at',
                'phone',
                'phone_verified_at',
                'bio',
                'remember_token',
                'created_at',
                'updated_at',
                'is_admin',
                'status',
                'cover_photo',
                'last_active'
            ]);

            $post->total_reactions = $totalReactions;
            $post->reaction_counts = $reactionCounts;
            $post->user_reaction = $userReaction ? $userReaction->type : null;
            $post->total_comments = $post->comments_count;
            $post->total_shares = $post->shares_count;

            unset(
                $post->reactions,
                $post->comments_count,
                $post->shares_count,
                $post->comments,
                $post->shares
            );

            $previewComment = $post->comments()
                ->with(['user:id,username,first_name,last_name,avatar'])
                ->whereNull('parent_id')
                ->whereIn('user_id', $friendIds)
                ->orderByDesc('likes_count')
                ->orderByDesc('created_at')
                ->first();

            if ($previewComment && $previewComment->user) {
                $previewComment->user->makeHidden([
                    'email',
                    'phone',
                    'bio',
                    'created_at',
                    'updated_at'
                ]);
            }

            $post->preview_comment = $previewComment;

            return $post;
        });

        return response()->json([
            'data' => $posts,
            'next_cursor' => $nextCursor,
            'has_more' => $hasMore
        ]);
    }
}
