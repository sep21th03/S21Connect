<?php

namespace App\Http\Controllers\Post;

use App\Services\ReactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\Reaction;
use App\Models\Post;

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

        $existingReaction = Reaction::where('user_id', $userId)
            ->where('post_id', $postId)
            ->first();

        if ($existingReaction) {
            if ($existingReaction->type === $type) {
                $existingReaction->delete();
                return response()->json([
                    'message' => 'Reaction removed',
                    'status' => 'removed'
                ]);
            } else {
                $existingReaction->update(['type' => $type]);
                return response()->json([
                    'message' => 'Reaction updated',
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

            return response()->json([
                'message' => 'Reaction added',
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
