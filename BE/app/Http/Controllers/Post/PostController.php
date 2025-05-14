<?php

namespace App\Http\Controllers\Post;

use App\Http\Controllers\Controller;
use App\Services\PostService;
use App\Http\Requests\User\Post\StorePostRequest;
use App\Http\Requests\User\Post\UpdatePostRequest;
use Illuminate\Http\Client\Request;

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
}
