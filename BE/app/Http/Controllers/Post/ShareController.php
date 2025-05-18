<?php

namespace App\Http\Controllers\Post;

use App\Models\Share;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class ShareController extends Controller
{
    public function share(Request $request)
    {
        $request->validate([
            'post_id' => 'required|exists:posts,id',
            'message' => 'nullable|string',
            'visibility' => 'nullable|in:public,friends,only_me',
        ]);

        $share = Share::create([
            'user_id' => Auth::id(),
            'post_id' => $request->post_id,
            'message' => $request->message,
            'visibility' => $request->visibility,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Post shared successfully.',
            'data' => $share,
        ]);
    }

    public function getSharesByPost($postId)
    {
        $shares = Share::where('post_id', $postId)
            ->with(['user:id,username,first_name,last_name,avatar'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'shares' => $shares,
            'total' => $shares->count(),
        ]);
    }

    public function getMySharedPosts()
    {
        $sharedPosts = Share::where('user_id', Auth::id())
            ->with(['post.user:id,username,first_name,last_name,avatar'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'shared_posts' => $sharedPosts,
        ]);
    }
}
