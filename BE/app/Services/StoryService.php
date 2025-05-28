<?php

namespace App\Services;

use App\Models\Story;
use App\Models\StoryItem;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Models\Friendship;


class StoryService
{
    public function createStory(string $userId, array $items): Story
    {
        return DB::transaction(function () use ($userId, $items) {
            $story = Story::where('user_id', $userId)
                ->where('expires_at', '>', now())
                ->latest('expires_at')
                ->first();
            if (!$story) {
                $story = Story::create([
                    'user_id' => $userId,
                    'expires_at' => now()->addDay(),
                ]);
            }

            foreach ($items as $itemData) {
                $story->items()->create([
                    'type' => $itemData['type'],
                    'file_url' => $itemData['file_url'] ?? null,
                    'text' => $itemData['text'] ?? null,
                    'text_position' => $itemData['text_position'] ?? null,
                    'text_style' => $itemData['text_style'] ?? null,
                    'background' => $itemData['background'] ?? null,
                ]);
            }

            return $story;
        });
    }

    public function getStories(string $userId)
    {
        $friendIds = Friendship::where('status', 'accepted')
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->orWhere('friend_id', $userId);
            })
            ->get()
            ->map(function ($row) use ($userId) {
                return $row->user_id === $userId ? $row->friend_id : $row->user_id;
            })->toArray();

        $idsToGet = array_merge($friendIds, [$userId]);

        $stories = Story::with(['items', 'user:id,username,avatar,first_name,last_name'])
            ->where('expires_at', '>', now())
            ->whereIn('user_id', $idsToGet)
            ->orderByRaw('user_id = ? DESC, created_at DESC', [$userId])
            ->get();

        $storyItemIds = $stories->flatMap(fn($story) => $story->items->pluck('id'))->all();

        $viewedItemIds = DB::table('story_item_views')
            ->where('user_id', $userId)
            ->whereIn('story_item_id', $storyItemIds)
            ->pluck('story_item_id')
            ->toArray();

        $stories->each(function ($story) use ($viewedItemIds, $userId) {
            $story->items->transform(function ($item) use ($viewedItemIds) {
                $item->is_seen = in_array($item->id, $viewedItemIds);
                return $item;
            });

            $story->is_mine = $story->user_id === $userId;
            $story->has_unseen = $story->items->contains(fn($item) => !$item->is_seen);
        });

        return $stories
            ->sortByDesc(fn($story) => [
                $story->is_mine,       // Ưu tiên của chính mình
                $story->has_unseen,    // Ưu tiên chưa xem
                $story->created_at,    // Mới nhất
            ])->values()
            ->map(function ($story) {
                return [
                    'id' => $story->id,
                    'user_id' => $story->user_id,
                    'expires_at' => $story->expires_at,
                    'created_at' => $story->created_at,
                    'is_mine' => $story->is_mine,
                    'user' => [
                        'id' => $story->user->id,
                        'username' => $story->user->username,
                        'avatar' => $story->user->avatar,
                        'first_name' => $story->user->first_name,
                        'last_name' => $story->user->last_name,
                    ],
                    'items' => $story->items->map(fn($item) => [
                        'id' => $item->id,
                        'type' => $item->type,
                        'file_url' => $item->file_url,
                        'text' => $item->text,
                        'text_position' => $item->text_position,
                        'text_style' => $item->text_style,
                        'color' => $item->color,
                        'duration' => $item->duration,
                        'created_at' => $item->created_at,
                        'is_seen' => $item->is_seen,
                        'background' => $item->background,
                    ]),
                ];
            })
            ->all();
    }

    public function markStoryAsSeen(string $storyId): array
    {
        $userId = auth()->id();

        $story = Story::with('items')->findOrFail($storyId);

        $storyItemIds = $story->items->pluck('id');

        foreach ($storyItemIds as $itemId) {
            DB::table('story_item_views')->updateOrInsert(
                [
                    'user_id' => $userId,
                    'story_item_id' => $itemId,
                ],
                [
                    'seen_at' => now(),
                ]
            );
        }

        $story->items->transform(function ($item) {
            $item->is_seen = true;
            return $item;
        });

        return [$story];
    }
}
