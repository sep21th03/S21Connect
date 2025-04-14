<?php

namespace App\Services;

use App\Models\Block;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class BlockService {
    // Chặn người dùng
    public function blockUser($blockedUserId) {
        $userId = Auth::id();

        // Kiểm tra nếu đã chặn
        if ($this->isBlocked($blockedUserId)) {
            return ['message' => 'Bạn đã chặn người này rồi'];
        }

        Block::create([
            'user_id' => $userId,
            'blocked_user_id' => $blockedUserId
        ]);

        // Xóa cache để cập nhật lại danh sách block
        $this->clearCache($userId);
        $this->clearBlockedByMeCache($blockedUserId);

        return ['message' => 'Đã chặn người dùng'];
    }

    // Bỏ chặn người dùng
    public function unblockUser($blockedUserId) {
        $userId = Auth::id();

        Block::where('user_id', $userId)
             ->where('blocked_user_id', $blockedUserId)
             ->delete();

        // Xóa cache để cập nhật lại danh sách block
        $this->clearCache($userId);
        $this->clearBlockedByMeCache($blockedUserId);

        return ['message' => 'Đã bỏ chặn người dùng'];
    }

    // Kiểm tra xem user có bị chặn không (dùng cache)
    public function isBlocked($blockedUserId) {
        $blockedUsers = $this->getBlockedUsers();
        return in_array($blockedUserId, $blockedUsers);
    }

    // Lấy danh sách user đã chặn (dùng cache)
    public function getBlockedUsers() {
        $cacheKey = 'blocked_users:' . Auth::id();
        return Cache::remember($cacheKey, now()->addMinutes(60), function () {
            return Block::where('user_id', Auth::id())->pluck('blocked_user_id')->toArray();
        });
    }

    // Kiểm tra xem user có bị block bởi người khác không
    public function isBlockedByMe($userId) {
        $cacheKey = "blocked_by_me:" . Auth::id();
        return Cache::remember($cacheKey, now()->addMinutes(60), function () use ($userId) {
            return Block::where('blocked_user_id', Auth::id())
                        ->where('user_id', $userId)
                        ->exists();
        });
    }

    // Xóa cache của danh sách block
    private function clearCache($userId) {
        Cache::forget("blocked_users:$userId");
    }

    // Xóa cache của danh sách những người block mình
    private function clearBlockedByMeCache($blockedUserId) {
        Cache::forget("blocked_by_me:$blockedUserId");
    }
}
