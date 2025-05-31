<?php

namespace App\Http\Controllers\Post;

use App\Models\Share;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\ActivityLog;
use Illuminate\Support\Str;

class ShareController extends Controller
{
    public function share(Request $request)
    {
        $user = auth()->user();
        $postIdToShare = $request->input('post_id');
        $content = $request->input('content', '');
        $visibility = $request->input('visibility', 'public');

        $postToShare = Post::findOrFail($postIdToShare);

        Share::create([
            'user_id' => $user->id,
            'post_id' => $postToShare->id,
            'content' => $content,
        ]);

        $newPost = Post::create([
            'user_id' => $user->id,
            'original_post_id' => $postToShare->id,
            'content' => $content,
            'visibility' => $visibility,
            'post_format' => 'shared',
        ]);

        ActivityLog::create([
            'id' => Str::uuid(),
            'user_id' => Auth::id(),
            'action' => 'shared_post',
            'target_type' => Post::class,
            'target_id' => $postToShare->id,
            'metadata' => [
                'content' => "Bạn đã chia sẻ bài viết của",
                'shared_post_id' => $newPost->id,
            ],
        ]);
        return response()->json([
            'message' => 'Chia sẻ bài viết thành công',
            'post' => $newPost
        ]);
    }

    public function getSharesByPost($postId)
    {
        // $shares = Share::where('post_id', $postId)
        //     ->with(['user:id,username,first_name,last_name,avatar'])
        //     ->orderBy('created_at', 'desc')
        //     ->get();

        // return response()->json([
        //     'shares' => $shares,
        //     'total' => $shares->count(),
        // ]);
        if (!$postId) {
            return response()->json(['message' => 'Post ID is required'], 400);
        }
        return Post::findOrFail($postId);
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
