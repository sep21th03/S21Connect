<?php

namespace App\Http\Controllers\User;

use App\Services\BlockService;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class BlockController extends Controller {
    protected $blockService;

    public function __construct(BlockService $blockService) {
        $this->blockService = $blockService;
    }

    public function blockUser($blockedUserId): JsonResponse {
        return response()->json($this->blockService->blockUser($blockedUserId));
    }

    public function unblockUser($blockedUserId): JsonResponse {
        return response()->json($this->blockService->unblockUser($blockedUserId));
    }

    public function getBlockedUsers(): JsonResponse {
        return response()->json(['blocked_users' => $this->blockService->getBlockedUsers()]);
    }
}
