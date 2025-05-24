<?php

namespace App\Http\Controllers\Story;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\Story\CreateStoryRequest;
use App\Services\StoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class StoryController extends Controller
{
    protected $storyService;

    public function __construct(StoryService $storyService)
    {
        $this->storyService = $storyService;
    }

    /**
     * Tạo story mới
     */
    public function store(CreateStoryRequest $request): JsonResponse
    {
        $user = $request->user();

        $story = $this->storyService->createStory(
            $user->id,
            $request->input('items'),
        );

        return response()->json([
            'message' => 'Tạo tin thành công',
            'story' => $story->load('items'),
        ], 201);
    }

    public function index(): JsonResponse
    {
        $userId = Auth::id();

        $stories = $this->storyService->getStories($userId);

        return response()->json([
            'stories' => $stories,
        ]);
    }
    public function markAsSeen(Request $request)
    {
        $request->validate([
            'story_id' => 'required|uuid|exists:stories,id',
        ]);
        $stories = $this->storyService->markStoryAsSeen(
            $request->input('story_id'),
        );

        return response()->json([
            'message' => 'Đã đánh dấu tin là đã xem',
            'stories' => $stories,
        ]);
    }
}
