<?php

namespace App\Http\Controllers\Story;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\Story\CreateStoryRequest;
use App\Services\StoryService;
use Illuminate\Http\JsonResponse;
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
            $request->input('expires_at')
        );

        return response()->json([
            'message' => 'Tạo tin thành công',
            'story' => $story->load('items'),
        ], 201);
    }
}
