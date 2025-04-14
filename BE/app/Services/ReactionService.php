<?php

namespace App\Services;

use App\Models\Reaction;

class ReactionService {
    public function react($userId, $postId, $type) {
        $reaction = Reaction::where('user_id', $userId)->where('post_id', $postId)->first();

        if ($reaction) {
            $reaction->type = $type;
            $reaction->save();
        } else {
            $reaction = Reaction::create([
                'user_id' => $userId,
                'post_id' => $postId,
                'type' => $type
            ]);
        }

        return response()->json($reaction, 200);
    }

    public function removeReaction($userId, $postId) {
        $reaction = Reaction::where('user_id', $userId)->where('post_id', $postId)->first();

        if (!$reaction) {
            return response()->json(['error' => 'Không có cảm xúc để xóa'], 404);
        }

        $reaction->delete();
        return response()->json(['message' => 'Đã xóa cảm xúc']);
    }
}
