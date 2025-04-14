<?php

namespace App\Http\Controllers\User;

use App\Services\FriendService;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class FriendController extends Controller {
    protected $friendService;

    public function __construct(FriendService $friendService) {
        $this->friendService = $friendService;
    }

    public function sendRequest($friendId): JsonResponse {
        return response()->json($this->friendService->sendFriendRequest($friendId));
    }

    public function acceptRequest($friendId): JsonResponse {
        return response()->json($this->friendService->acceptFriendRequest($friendId));
    }

    public function cancelRequest($friendId): JsonResponse {
        return response()->json($this->friendService->cancelFriendRequest($friendId));
    }

    public function unfriend($friendId): JsonResponse {
        return response()->json($this->friendService->unfriend($friendId));
    }
}
