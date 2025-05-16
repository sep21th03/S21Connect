<?php

namespace App\Http\Controllers\Post;

use App\Http\Controllers\Controller;
use App\Services\PostService;
use App\Http\Requests\User\Post\StorePostRequest;
use App\Http\Requests\User\Post\UpdatePostRequest;
use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\Friendship;

class PostController extends Controller
{

    protected $postService;

    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
    }

    public function public_post()
    {
        $posts = $this->postService->public_post();
        return response()->json($posts);
    }

    public function getFriendPost(string $user_id)
    {
        $posts = $this->postService->getFriendPost($user_id);
        return response()->json($posts);
    }

    public function getMyPost()
    {
        $posts = $this->postService->getMyPost();
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

    public function getPostReactions($postId) {
        $data = $this->postService->getPostReactions($postId);
        return response()->json($data);
    }

     public function getNewsFeed(Request $request)
    {
        $user = auth()->user();
        $after = $request->query('after'); 
        $limit = $request->query('limit', 10);

        $friendIds = Friendship::where('user_id', $user->id)->pluck('friend_id')->toArray();

        $allowedUserIds = array_merge($friendIds, [$user->id]);

        $query = Post::with([
            'user' => function ($query) {
                $query->select('id', 'username', 'first_name', 'last_name', 'avatar');
            },
            'reactions'
        ])
            ->withCount(['comments', 'shares'])
            ->whereIn('user_id', $allowedUserIds)
            ->where(function ($q) use ($user) {
                $q->where('visibility', 'public')
                    ->orWhere(function ($q2) use ($user) {
                        $q2->where('visibility', 'friends');
                    });
            })
            ->orderByDesc('created_at');

        if ($after) {
            $query->where('created_at', '<', $after);
        }

        $posts = $query->limit($limit)->get();

        $posts = $posts->map(function ($post) {
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
                ->map(fn($group) => $group->count());

            $post->total_comments = $post->comments->count();
            $post->total_shares = $post->shares->count();

            unset(
                $post->reactions,
                $post->comments_count,
                $post->shares_count,
                $post->comments,
                $post->shares
            );

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

            return $post;
        });

        return response()->json($posts);
    }

}
