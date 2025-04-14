<?php

namespace App\Services;

use App\Models\Post;
use Illuminate\Support\Facades\Auth;

class PostService
{
    public function index()
    {
        $posts = Post::where('visibility', 'public')->orWhere('user_id', Auth::id())->orderBy('created_at', 'desc')->with('user')->get();
        return response()->json($posts);
    }

    public function store(array $data)
    {
        $post = new Post();
        $post->user_id = Auth::id();
        $post->content = $data['content'];
        $post->images = $data['images'];
        $post->videos = $data['videos'];
        $post->visibility = $data['visibility'];
        $post->save();

        return $post;
    }

    public function show(string $post_id)
    {
        $post = Post::where('post_id', $post_id)->with('user')->firstOrFail();
        return response()->json($post);
    }

    public function update(array $data, string $post_id)
    {
        $post = Post::where('post_id', $post_id)->firstOrFail();
        $post->content = $data['content'];
        $post->images = $data['images'];
        $post->videos = $data['videos'];
        $post->visibility = $data['visibility'];
        $post->save();

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

    public function getPostReactions($postId) {
        $post = Post::findOrFail($postId);

        return [
            'post_id' => $post->id,
            'reactions' => $post->reactionSummary(),
            'shares' => $post->shareSummary(),
        ];
    }
}
