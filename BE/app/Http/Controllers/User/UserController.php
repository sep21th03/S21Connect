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
}