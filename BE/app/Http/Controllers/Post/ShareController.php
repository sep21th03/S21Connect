<?php

namespace App\Http\Controllers\Post;

use App\Models\Share;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class ShareController extends Controller {
    public function store(Request $request) {
        $request->validate([
            'post_id' => 'required|exists:posts,id',
            'message' => 'nullable|string'
        ]);

        $share = Share::create([
            'user_id' => Auth::id(),
            'post_id' => $request->post_id,
            'message' => $request->message
        ]);

        return response()->json(['message' => 'Đã chia sẻ bài viết', 'share' => $share], 201);
    }

    public function getShares($postId) {
        $shares = Share::where('post_id', $postId)->with('user')->get();
        return response()->json($shares);
    }
}
