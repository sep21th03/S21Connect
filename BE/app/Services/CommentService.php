<?php

namespace App\Services;

use App\Models\Comment;
use Illuminate\Support\Facades\Auth;

class CommentService {
    public function store(array $data) {
        $comment = new Comment();
        $comment->user_id = Auth::id();
        $comment->post_id = $data['post_id'];
        $comment->content = $data['content'];
        $comment->save();

        return $comment;
    }

    public function update(array $data, string $id) {
        $comment = Comment::where('id', $id)->first();
        $comment->content = $data['content'];
        $comment->save();

        return $comment;
    }

    public function destroy(string $id) {
        $comment = Comment::find($id);

        if (!$comment) {
            return false;
        }

        if (Auth::id() !== $comment->user_id && !Auth::user()->is_admin) {
            return false;
        }

        return $comment->delete();
    }
}