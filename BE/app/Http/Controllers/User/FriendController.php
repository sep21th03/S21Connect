<?php

namespace App\Http\Controllers\User;

use App\Services\FriendService;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class FriendController extends Controller
{
    protected $friendService;

    public function __construct(FriendService $friendService)
    {
        $this->friendService = $friendService;
    }

    public function sendRequest($friendId): JsonResponse
    {
        return response()->json($this->friendService->sendFriendRequest($friendId));
    }

    public function acceptRequest($friendId): JsonResponse
    {
        return response()->json($this->friendService->acceptFriendRequest($friendId));
    }

    public function cancelRequest($friendId): JsonResponse
    {
        return response()->json($this->friendService->cancelFriendRequest($friendId));
    }

    public function unfriend($friendId): JsonResponse
    {
        return response()->json($this->friendService->unfriend($friendId));
    }
    public function checkStatus($friendId): JsonResponse
    {
        return response()->json($this->friendService->checkFriendshipStatus($friendId));
    }

    public function getFriendStats($userId): JsonResponse
    {
        $result = $this->friendService->getFriendStats($userId);

        return response()->json([
            'following' => $result['following'],
            'followers' => $result['followers'],
            'friends' => $result['friends'],
        ]);
    }

    //Bạn bè chung
    public function getMutualFriends($userId1, $userId2)
    {
        $mutualFriends = $this->friendService->getMutualFriends($userId1, $userId2);

        return response()->json($mutualFriends);
    }

 
}
