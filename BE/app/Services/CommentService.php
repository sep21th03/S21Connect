<?php

namespace App\Services;

use App\Models\Comment;
use Illuminate\Support\Facades\Auth;

class CommentService
{
    public function store(array $data)
    {
        $comment = new Comment();
        $comment->user_id = Auth::id();
        $comment->post_id = $data['id'];
        $comment->content = $data['content'];
        $comment->parent_id = $data['parent_id'] ?? null;
        $comment->save();

        $comment->load('user');

        return $comment;
    }

    public function update(array $data, string $id)
    {
        $comment = Comment::where('id', $id)->first();
        $comment->content = $data['content'];
        $comment->save();

        return $comment;
    }

    public function destroy(string $id)
    {
        $comment = Comment::find($id);

        if (!$comment) {
            return false;
        }

        if (Auth::id() !== $comment->user_id && !Auth::user()->is_admin) {
            return false;
        }

        return $comment->delete();
    }

    public function getCommentsByPostId(string $post_id)
    {
        $comments = Comment::where('post_id', $post_id)
            ->whereNull('parent_id')
            ->with([
                'user:id,username,avatar,first_name,last_name',
                'replies' => function ($query) {
                    $query->with('user:id,username,avatar,first_name,last_name')
                        ->orderBy('created_at', 'desc');
                },  
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return $comments;
    }
}
