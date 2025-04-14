<?php

namespace App\Http\Controllers\User;

use App\Services\ReactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class ReactionController extends Controller {
    protected $reactionService;

    public function __construct(ReactionService $reactionService) {
        $this->reactionService = $reactionService;
    }

    public function react(Request $request) {
        $request->validate([
            'post_id' => 'required|exists:posts,id',
            'type' => 'required|in:like,love,haha,wow,sad,angry'
        ]);

        return $this->reactionService->react(Auth::id(), $request->post_id, $request->type);
    }

    public function removeReaction($postId) {
        return $this->reactionService->removeReaction(Auth::id(), $postId);
    }
}
