<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
        ]);
        $perPage = $validated['per_page'] ?? 20;
        $logs = ActivityLog::where('user_id', Auth::id())
            ->latest()
            ->paginate($perPage);

        $logs->getCollection()->transform(function ($log) {
            if ($log->target_type === Post::class) {
                $post = Post::with('user:id,first_name,last_name,username,avatar')->find($log->target_id);
                $log->target_user = $post?->user;
            } elseif ($log->target_type === User::class) {
                $user = User::select('id', 'first_name', 'last_name', 'username', 'avatar')->find($log->target_id);
                $log->target_user = $user;
            } else {
                $log->target_user = null;
            }

            return $log;
        });

        return response()->json($logs);
    }

    public function activityProfile(Request $request, $username)
    {
        $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
        ]);
        $perPage = $validated['per_page'] ?? 10;
        $user = User::where('username', $username)->firstOrFail();
        $logs = ActivityLog::where('user_id', $user->id)
            ->latest()
            ->paginate($perPage);

        $logs->getCollection()->transform(function ($log) {
            if ($log->target_type === Post::class) {
                $post = Post::with('user:id,first_name,last_name,username,avatar')->find($log->target_id);
                $log->target_user = $post?->user;
            } elseif ($log->target_type === User::class) {
                $user = User::select('id', 'first_name', 'last_name', 'username', 'avatar')->find($log->target_id);
                $log->target_user = $user;
            } else {
                $log->target_user = null;
            }

            return $log;
        });

        return response()->json($logs);
    }
}
