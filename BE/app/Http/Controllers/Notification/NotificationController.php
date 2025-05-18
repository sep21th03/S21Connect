<?php

namespace App\Http\Controllers\Notification;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class NotificationController extends Controller
{
    public function getNotifications()
    {
        $userId = auth()->id();
        return Cache::remember("notifications_user_{$userId}", 60, function () use ($userId) {
            return Notification::where('user_id', $userId)
                ->with(['fromUser' => function ($query) {
                    $query->selectRaw("id, avatar, CONCAT(first_name, ' ', last_name) as name");
                }])
                ->orderByDesc('created_at')
                ->get();
        });
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Đánh dấu tất cả thông báo là đã đọc']);
    }
}
