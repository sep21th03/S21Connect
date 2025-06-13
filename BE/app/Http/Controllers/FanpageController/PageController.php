<?php

namespace App\Http\Controllers\FanpageController;

use App\Models\Page;
use App\Models\Post;
use App\Models\Image;
use App\Models\PageReview;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PageController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->get('type', 'all');
        $user = auth()->user();

        $query = Page::with(['creator', 'admins.user', 'followers'])
            ->withCount('followers')
            ->withExists([
                'followers as is_followed' => function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                }
            ]);

        switch ($type) {
            case 'my_pages':
                $query->whereHas('admins', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
                break;

            case 'liked':
                $query->whereHas('followers', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
                break;

            case 'invitations':
                $query->where('id', null);
                break;

            case 'all':
            default:
                $query->whereDoesntHave('followers', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })->whereDoesntHave('admins', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
                break;
        }

        $pages = $query->paginate(12);

        return response()->json([
            'data' => $pages,
            'type' => $type
        ]);
    }

    public function getFollowedPages()
    {
        $user = auth()->user();

        $pages = Page::select('id', 'name', 'slug', 'avatar', 'type') 
            ->withCount('followers') 
            ->withExists([
                'followers as is_followed' => function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                }
            ])
            ->whereHas('followers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->take(5)
            ->get();

        return response()->json([
            'data' => $pages,
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:pages,slug',
            'description' => 'nullable|string',
            'avatar' => 'nullable|string',
            'cover_image' => 'nullable|string',
            'type' => 'nullable|string|in:business,community,brand,public_figure,personal,other',
            'link' => 'nullable|url',
            'email' => 'nullable|max:255',
            'phone' => 'nullable|max:20',
        ]);

        $page = Page::create([
            'id' => Str::uuid(),
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? Str::slug($validated['name']) . '-' . Str::random(5),
            'description' => $validated['description'] ?? null,
            'avatar' => $validated['avatar'] ?? null,
            'cover_image' => $validated['cover_image'] ?? null,
            'created_by' => auth()->id(),
            'link' => $validated['link'] ?? null,
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'type' => $validated['type'] ?? 'personal',
        ]);

        $page->admins()->create([
            'id' => Str::uuid(),
            'user_id' => auth()->id(),
            'role' => 'admin',
        ]);

        return response()->json([
            'message' => 'Tạo trang thành công',
            'data' => $page,
            'success' => true
        ], 201);
    }

    public function addAdmin(Request $request, Page $page)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:admin,editor',
        ]);

        $admin = $page->admins()->where('user_id', auth()->id())->first();
        if (!$admin || $admin->role !== 'admin') {
            return response()->json(['message' => 'Permission denied'], 403);
        }

        $existing = $page->admins()->where('user_id', $validated['user_id'])->first();
        if ($existing) {
            return response()->json(['message' => 'User is already an admin/editor'], 409);
        }

        $page->admins()->create([
            'id' => Str::uuid(),
            'user_id' => $validated['user_id'],
            'role' => $validated['role'],
        ]);

        return response()->json(['message' => 'Admin/editor added successfully']);
    }

    public function follow(Page $page)
    {
        $user = auth()->user();

        $existing = $page->followers()->where('user_id', $user->id)->first();
        if ($existing) {
            return response()->json(['message' => 'Đã theo dõi trang này'], 409);
        }

        $page->followers()->create([
            'id' => Str::uuid(),
            'user_id' => $user->id,
        ]);

        return response()->json(['message' => 'Theo dõi trang thành công']);
    }

    public function unfollow(Page $page)
    {
        $user = auth()->user();

        $page->followers()->where('user_id', $user->id)->delete();

        return response()->json(['message' => 'Hủy theo dõi trang thành công']);
    }

    public function followStatus(Page $page)
    {
        $user = auth()->user();

        $isFollowing = $page->followers()->where('user_id', $user->id)->exists();

        return response()->json(['is_following' => $isFollowing]);
    }

    public function show(string $slug)
    {
        try {
            $page = Page::where('slug', $slug)
                ->withCount(['followers', 'posts'])
                ->with(['admins.user:id,first_name,last_name'])
                ->firstOrFail();

            return response()->json([
                'id' => $page->id,
                'name' => $page->name,
                'slug' => $page->slug,
                'description' => $page->description,
                'avatar' => $page->avatar,
                'cover_image' => $page->cover_image,
                'type' => $page->type,
                'followers_count' => $page->followers_count,
                'posts_count' => $page->posts_count,
                'created_at' => $page->created_at,
                'link' => $page->link,
                'email' => $page->email,
                'phone' => $page->phone,
                'admins' => $page->admins->map(fn($admin) => [
                    'id' => $admin->user->id,
                    'first_name' => $admin->user->first_name,
                    'last_name' => $admin->user->last_name,
                    'username' => $admin->user->username,
                    'avatar' => $admin->user->avatar,
                    'role' => $admin->role,
                ]),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Page not found'], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Internal server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getPagePhotos($pageId)
    {
        $posts = Post::where('page_id', $pageId)->pluck('id');

        $images = Image::whereIn('post_id', $posts)
            ->where('type', 'image')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'url', 'public_id', 'created_at']);

        return response()->json([
            'success' => true,
            'data' => $images,
        ]);
    }

    public function storePageReview(Request $request, $pageId)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
            'rate' => 'required|integer|min:1|max:5',
        ]);

        DB::beginTransaction();

        try {
            $post = Post::create([
                'id' => Str::uuid(),
                'user_id' => Auth::id(),
                'page_id' => $pageId,
                'content' => $request->content,
                'type' => 'second',
                'visibility' => 'public',
                'is_review' => true,
            ]);

            $review = PageReview::create([
                'id' => Str::uuid(),
                'post_id' => $post->id,
                'page_id' => $pageId,
                'user_id' => Auth::id(),
                'rate' => $request->rate,
            ]);

            DB::commit();
            $review->load('user');

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $review->id,
                    'content' => $post->content,
                    'rate' => $review->rate,
                    'created_at' => $review->created_at,
                    'user' => $review->user,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function getPageReviews($pageId, $page = 1, $limit = 10)
    {
        $pageModel = Page::find($pageId);
        if (!$pageModel) {
            return response()->json(['message' => 'Page not found'], 404);
        }

        $query = Post::where('page_id', $pageId)
            ->whereHas('pageReview')
            ->orderBy('created_at', 'desc')
            ->with([
                'user:id,username,first_name,last_name,avatar',
                'pageReview:id,post_id,rate'
            ]);

        $total = $query->count();
        $offset = ($page - 1) * $limit;

        $posts = $query->skip($offset)->take($limit)->get();

        $posts = $posts->map(function ($post) {
            return [
                'id' => $post->id,
                'content' => $post->content,
                'rate' => $post->pageReview->rate ?? null,
                'created_at' => $post->created_at,
                'user' => $post->user,
            ];
        });

        $hasMore = ($page * $limit) < $total;

        return response()->json([
            'data' => $posts,
            'has_more' => $hasMore,
            'page_info' => [
                'id' => $pageModel->id,
                'name' => $pageModel->name,
                'avatar' => $pageModel->avatar,
            ]
        ]);
    }
}
