<?php

namespace App\Http\Controllers\Notification;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function getNotifications()
    {
        return Notification::where('user_id', auth()->id())
            ->with(['fromUser' => function ($query) {
                $query->selectRaw("id, avatar, CONCAT(first_name, ' ', last_name) as name");
            }])
            ->orderByDesc('created_at')
            ->get();
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Đánh dấu tất cả thông báo là đã đọc']);
    }
}
