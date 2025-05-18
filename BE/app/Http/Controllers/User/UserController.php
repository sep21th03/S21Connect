<?php

namespace App\Http\Controllers\User;

use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function hoverCardData($targetUserId)
    {
        $viewerId = Auth::id();

        $data = $this->userService->getHoverCardData($viewerId, $targetUserId);

        if (!$data) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($data);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id'         => $user->id,
            'username'   => $user->username,
        ]);
    }

    public function getListFriend($userId)
    {
        $friendList = $this->userService->getListFriend($userId);

        return response()->json($friendList);
    }

    public function getListFriendLimit($userId)
    {
        $friendList = $this->userService->getListFriendLimit($userId);

        return response()->json($friendList);
    }

    public function updateLastActive(Request $request)
    {
        $data = $request->validate([
            'last_active' => 'required|date',
            'user_id' => 'required|uuid|exists:users,id',
        ]);

        $this->userService->updateLastActive($data);

        return response()->json(['message' => 'Last active updated successfully']);
    }

    public function getStats(Request $request)
    {
        $userId = $request->user()->id;

        $stats = $this->userService->getUserStats($userId);

        return response()->json([
            'data' => $stats
        ]);
    }

    public function suggestFriends()
    {
        return $this->userService->suggestFriends();
    }
}
