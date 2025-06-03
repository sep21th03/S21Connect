<?php

namespace App\Http\Controllers\User;

use App\Services\FriendService;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

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

    public function upcomingBirthdays()
    {
        $userId = Auth::id();
        $daysAhead = 30;

        $friends = $this->friendService->getUpcomingBirthdays($userId, $daysAhead);

        return response()->json([
            'data' => $friends,
        ]);
    }

    public function getListRequestFriends()
    {
        $pendingRequests = $this->friendService->getPendingRequests();

        return response()->json([
            'data' => $pendingRequests,
        ]);
    }

    public function countNewFriendRequests()
    {
        return Auth::user()
            ->receivedFriendRequests()
            ->where('new', false)
            ->count();
    }

    public function searchFriend(Request $request)
    {
        $keyword = $request->input('q', '');

        $friends = $this->friendService->searchFriend($keyword);

        return response()->json([
            'data' => $friends,
        ]);
    }
}
