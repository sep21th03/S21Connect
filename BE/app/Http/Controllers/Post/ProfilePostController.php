<?php

namespace App\Http\Controllers\Post;

use App\Http\Controllers\Controller;
use App\Services\ProfilePostService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProfilePostController extends Controller
{
    protected $profilePostService;

    public function __construct(ProfilePostService $profilePostService)
    {
        $this->profilePostService = $profilePostService;
    }

    public function getProfilePosts(Request $request, $userId): JsonResponse
    {
        $page = $request->query('page', 1);
        $perPage = $request->query('per_page', 10);

        $posts = $this->profilePostService->getProfilePosts($userId, $page, $perPage);

        return response()->json([
            'message' => 'Lấy bài viết thành công',
            'data' => $posts
        ]);
    }

    public function getMyPosts(Request $request): JsonResponse
    {
        $page = $request->query('page', 1);
        $perPage = $request->query('per_page', 10);

        $posts = $this->profilePostService->getMyPosts($page, $perPage);

        return response()->json([
            'message' => 'Lấy bài viết thành công',
            'data' => $posts
        ]);
    }
}
