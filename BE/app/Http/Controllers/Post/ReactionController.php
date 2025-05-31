<?php

namespace App\Http\Controllers\Post;

use App\Services\ReactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\Reaction;
use App\Models\Post;
use App\Events\PostReacted;
use App\Models\ActivityLog;
use Illuminate\Support\Str;

class ReactionController extends Controller
{
    protected $reactionService;

    public function __construct(ReactionService $reactionService)
    {
        $this->reactionService = $reactionService;
    }

    public function toggleReaction(Request $request)
    {
        $request->validate([
            'post_id' => 'required|exists:posts,id',
            'type' => 'required|in:smile,love,cry,wow,angry,haha',
        ]);

        $userId = Auth::id();
        $postId = $request->post_id;
        $type = $request->type;

        $post = Post::findOrFail($postId);

        $existingReaction = Reaction::where('user_id', $userId)
            ->where('post_id', $postId)
            ->first();

        if ($existingReaction) {
            if ($existingReaction->type === $type) {
                $existingReaction->delete();
                return response()->json([
                    'message' => 'Xóa cảm xúc',
                    'status' => 'removed'
                ]);
            } else {
                $existingReaction->update(['type' => $type]);

                ActivityLog::create([
                    'id' => Str::uuid(),
                    'user_id' => $userId,
                    'action' => 'updated_reaction',
                    'target_type' => Post::class,
                    'target_id' => $postId,
                    'metadata' => [
                        'new_type' => $type,
                        'content' => 'Bạn đã' . $type . 'bài viết của ' . $post->user->first_name . ' ' . $post->user->last_name,
                    ]
                ]);

                return response()->json([
                    'message' => 'Cập nhật cảm xúc',
                    'status' => 'updated',
                    'reaction' => $existingReaction
                ]);
            }
        } else {
            $reaction = Reaction::create([
                'user_id' => $userId,
                'post_id' => $postId,
                'type' => $type
            ]);

            ActivityLog::create([
                'id' => Str::uuid(),
                'user_id' => $userId,
                'action' => 'reaction_post',
                'target_type' => Post::class,
                'target_id' => $postId,
                'metadata' => [
                    'new_type' => $type,
                    'content' => 'Bạn đã thả cảm xúc bài viết của ',
                ]
            ]);

            if ($post->user_id !== $userId) {
                event(new PostReacted($post, Auth::user(), $type, $reaction));
            }
            return response()->json([
                'message' => 'Thả cảm xúc',
                'status' => 'added',
                'reaction' => $reaction
            ]);
        }
    }

    public function getPostReactions($postId)
    {
        $reactionCounts = Reaction::where('post_id', $postId)
            ->get()
            ->groupBy('type')
            ->map(function ($group) {
                return $group->count();
            });

        $userReaction = null;
        if (Auth::check()) {
            $userReaction = Reaction::where('post_id', $postId)
                ->where('user_id', Auth::id())
                ->value('type');
        }

        return response()->json([
            'reaction_counts' => $reactionCounts,
            'total_count' => Reaction::where('post_id', $postId)->count(),
            'user_reaction' => $userReaction
        ]);
    }
}
