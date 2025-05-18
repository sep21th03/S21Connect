<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Report;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AdminStatsController extends Controller
{
    public function getStats()
    {
        $totalUsers = User::count();

        $thirtyDaysAgo = Carbon::now()->subDays(30);
        $activeUsers = User::where('last_active', '>=', $thirtyDaysAgo)->count();

        $pendingReports = Report::where('status', 'pending')->count();

        return response()->json([
            'totalUsers' => $totalUsers,
            'activeUsers' => $activeUsers,
            'pendingReports' => $pendingReports,
        ]);
    }

    public function manageUser(Request $request)
    {
        $query = User::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%")
                    ->orWhere('first_name', 'like', "%$search%")
                    ->orWhere('last_name', 'like', "%$search%");
            });
        }

        if ($request->has('is_admin')) {
            $query->where('is_admin', $request->input('is_admin'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->has('status'));
        }

        if ($request->has('min_reports')) {
            $query->whereHas('reportsReceived', function ($q) {
            }, '>=', $request->input('min_reports'));
        }
        $query->orderByDesc('last_active');

        $users = $query->paginate(20);

        return response()->json($users);
    }
}
