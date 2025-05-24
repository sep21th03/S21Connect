<?php

namespace App\Services;

use App\Models\Story;
use App\Models\StoryItem;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class StoryService
{
    public function createStory(string $userId, array $items, $expiresAt): Story
    {
        return DB::transaction(function () use ($userId, $items, $expiresAt) {
            $story = Story::create([
                'user_id' => $userId,
                'expires_at' => $expiresAt instanceof Carbon ? $expiresAt : Carbon::parse($expiresAt),
            ]);

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
}
