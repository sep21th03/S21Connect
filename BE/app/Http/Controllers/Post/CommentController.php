<?php

namespace App\Http\Controllers\Post;

use App\Http\Controllers\Controller;
use App\Services\CommentService;
use App\Http\Requests\User\Comment\StoreCommentRequest;

class CommentController extends Controller
{
    protected $commentService;
    public function __construct(CommentService $commentService)
    {
        $this->commentService = $commentService;
    }

    public function getCommentsByPostId(string $post_id)
    {
        $comments = $this->commentService->getCommentsByPostId($post_id);
        return response()->json($comments);
    }

    public function store(StoreCommentRequest $request)
    {
        $comment = $this->commentService->store($request->validated());
        return response()->json(['message' => 'Bình luận thành công!', 'data' => $comment]);
    }

    public function update(StoreCommentRequest $request, string $id)
    {
        $this->commentService->update($request->validated(), $id);
        return response()->json(['message' => 'Cập nhật bình luận thành công!']);
    }

    public function destroy(string $id)
    {
        $this->commentService->destroy($id);
        return response()->json(['message' => 'Xóa bình luận thành công!']);
    }
}
