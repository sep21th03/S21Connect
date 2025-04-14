<?php

namespace App\Http\Middleware;

use Closure;
use App\Services\BlockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckBlockedUser {
    protected $blockService;

    public function __construct(BlockService $blockService) {
        $this->blockService = $blockService;
    }

    public function handle(Request $request, Closure $next) {
        $user = Auth::user();
        if ($user && $user->is_admin) {
            return $next($request);
        }    
        $targetId = $request->route('id') ?? $request->route('user_id') ?? $request->route('post_id');

        if ($targetId && $this->blockService->isBlockedByMe($targetId)) {
            return response()->json(['message' => 'Bạn đã bị chặn bởi người dùng này'], 403);
        }
        
        return $next($request);
    }
}
