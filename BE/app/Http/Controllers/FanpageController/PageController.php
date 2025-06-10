<?php

namespace App\Http\Controllers\FanpageController;

use App\Models\Page;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\PageAdmin;
use App\Models\PageFollower;

class PageController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->get('type', 'all');
        $user = auth()->user();

        $query = Page::with(['creator', 'admins.user', 'followers']);

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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:pages,slug',
            'description' => 'nullable|string',
            'avatar' => 'nullable|string',
            'cover_image' => 'nullable|string',
        ]);

        $page = Page::create([
            'id' => Str::uuid(),
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? Str::slug($validated['name']) . '-' . Str::random(5),
            'description' => $validated['description'] ?? null,
            'avatar' => $validated['avatar'] ?? null,
            'cover_image' => $validated['cover_image'] ?? null,
            'created_by' => auth()->id(),
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
            return response()->json(['message' => 'Already following this page'], 409);
        }

        $page->followers()->create([
            'id' => Str::uuid(),
            'user_id' => $user->id,
        ]);

        return response()->json(['message' => 'Followed page successfully']);
    }

    public function unfollow(Page $page)
    {
        $user = auth()->user();

        $page->followers()->where('user_id', $user->id)->delete();

        return response()->json(['message' => 'Unfollowed page successfully']);
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
                'admins' => $page->admins->map(fn($admin) => [
                    'id' => $admin->user->id,
                    'name' => $admin->user->name,
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
}
