<?php

namespace App\Http\Controllers\Post;

use App\Http\Controllers\Controller;
use App\Services\PostService;
use App\Http\Requests\User\Post\StorePostRequest;
use App\Http\Requests\User\Post\UpdatePostRequest;


class PostController extends Controller
{

    protected $postService;

    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
    }

    public function index()
    {
        $posts = $this->postService->index();
        return response()->json($posts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePostRequest $request)
    {
        $this->postService->store($request->validated());
        return response()->json(['message' => 'Đăng bài thành công!']);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $post_id)
    {
        $post = $this->postService->show($post_id);
        return response()->json($post);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePostRequest $request, string $post_id)
    {
        $post = $this->postService->update($request->validated(), $post_id);
        return response()->json($post);
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
