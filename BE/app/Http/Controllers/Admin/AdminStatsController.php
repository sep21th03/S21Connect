<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Report;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Scopes\ExcludeBannedUsers;

class AdminStatsController extends Controller
{
    public function getStats()
    {
        $now = Carbon::now();
        $thirtyDaysAgo = $now->copy()->subDays(30);
        $sixtyDaysAgo = $now->copy()->subDays(60);

        $totalUsers = User::count();

        $newUsers = User::where('created_at', '>=', $thirtyDaysAgo)->count();
        $lastMonthNewUsers = User::whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])->count();

        $activeUsers = User::where('last_active', '>=', $thirtyDaysAgo)->count();
        $lastMonthActiveUsers = User::whereBetween('last_active', [$sixtyDaysAgo, $thirtyDaysAgo])->count();

        $pendingReports = Report::where('status', 'pending')->count();
        $lastMonthPendingReports = Report::where('status', 'pending')
            ->whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])
            ->count();

        return response()->json([
            'totalUsers' => $totalUsers,
            'newUsers' => $newUsers,
            'newUsersChange' => $this->calculatePercentChange($lastMonthNewUsers, $newUsers),
            'activeUsers' => $activeUsers,
            'activeUsersChange' => $this->calculatePercentChange($lastMonthActiveUsers, $activeUsers),
            'pendingReports' => $pendingReports,
            'pendingReportsChange' => $this->calculatePercentChange($lastMonthPendingReports, $pendingReports),
            'totalPayments' => 0,
            'totalPaymentsPercent' => 0,
        ]);
    }
    public function getActiveUsersByDate()
    {
        $now = Carbon::now();
        $thirtyDaysAgo = $now->copy()->subDays(30);
        $sixtyDaysAgo = $now->copy()->subDays(60);

        // Get data for last 6 periods (every 5 days)
        $data = [];
        for ($i = 5; $i >= 0; $i--) {
            $startDate = $thirtyDaysAgo->copy()->addDays($i * 5);
            $endDate = $startDate->copy()->addDays(5);

            // This month's data
            $thisMonthCount = User::where('last_active', '>=', $startDate)
                ->where('last_active', '<', $endDate)
                ->count();

            // Last month's data (same period but 30 days earlier)
            $lastMonthStart = $startDate->copy()->subDays(30);
            $lastMonthEnd = $endDate->copy()->subDays(30);
            $lastMonthCount = User::where('last_active', '>=', $lastMonthStart)
                ->where('last_active', '<', $lastMonthEnd)
                ->count();

            $data[] = [
                'date' => $startDate->format('d-m'),
                'thisMonth' => $thisMonthCount,
                'lastMonth' => $lastMonthCount
            ];
        }

        return response()->json($data);
    }

    /**
     * Get user distribution data (active vs inactive users for pie chart)
     */
    public function getUserDistribution()
    {
        $now = Carbon::now();
        $thirtyDaysAgo = $now->copy()->subDays(30);

        $totalUsers = User::count();
        $activeUsers = User::where('last_active', '>=', $thirtyDaysAgo)->count();
        $inactiveUsers = $totalUsers - $activeUsers;

        return response()->json([
            [
                'name' => 'Người dùng hoạt động',
                'value' => $activeUsers
            ],
            [
                'name' => 'Người dùng không hoạt động',
                'value' => $inactiveUsers
            ]
        ]);
    }

    /**
     * Get support requests by day of week (for bar chart)
     */
    public function getSupportRequestsByDay()
    {
        $now = Carbon::now();
        $thirtyDaysAgo = $now->copy()->subDays(30);

        // Since you don't have a support requests table, I'll use reports as proxy
        // You can modify this to use actual support requests table when available
        $data = [];
        $daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

        for ($i = 0; $i < 7; $i++) {
            $dayCount = Report::where('created_at', '>=', $thirtyDaysAgo)
                ->whereRaw('DAYOFWEEK(created_at) = ?', [($i == 0 ? 7 : $i) + 1])
                ->count();

            $data[] = [
                'name' => $daysOfWeek[$i],
                'value' => $dayCount
            ];
        }

        return response()->json($data);
    }

    /**
     * Get reports by category (for pie chart)
     */
    public function getReportsByCategory()
    {
        $now = Carbon::now();
        $thirtyDaysAgo = $now->copy()->subDays(30);

        // Get reports from last 30 days grouped by reason code
        $reports = Report::select('reason_code', DB::raw('count(*) as count'))
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->groupBy('reason_code')
            ->get();

        $data = [];
        $reportReasons = config('report_reasons');

        // Group similar reason codes into categories
        $categories = [
            'Spam' => ['P_Spam', 'U_Spam', 'Pg_Spam', 'C_Spam', 'G_Spam'],
            'Nội dung không phù hợp' => ['P_Nudity', 'P_Violence', 'Pg_Inappropriate'],
            'Lừa đảo' => ['P_FalseInformation', 'U_FalseInformation', 'Pg_FalseInformation', 'G_FalseInformation'],
            'Khác' => ['P_Other', 'U_Other', 'Pg_Other', 'C_Other', 'G_Other']
        ];

        $categoryCounts = [
            'Spam' => 0,
            'Nội dung không phù hợp' => 0,
            'Lừa đảo' => 0,
            'Khác' => 0
        ];

        foreach ($reports as $report) {
            foreach ($categories as $categoryName => $reasonCodes) {
                if (in_array($report->reason_code, $reasonCodes)) {
                    $categoryCounts[$categoryName] += $report->count;
                    break;
                }
            }
        }

        foreach ($categoryCounts as $name => $value) {
            if ($value > 0) {
                $data[] = [
                    'name' => $name,
                    'value' => $value
                ];
            }
        }

        // If no data, return sample data
        if (empty($data)) {
            $data = [
                ['name' => 'Spam', 'value' => 8],
                ['name' => 'Nội dung không phù hợp', 'value' => 6],
                ['name' => 'Lừa đảo', 'value' => 7],
                ['name' => 'Khác', 'value' => 3]
            ];
        }

        return response()->json($data);
    }

    /**
     * Get all dashboard data in one request
     */
    public function getDashboardData()
    {
        return response()->json([
            'stats' => $this->getStats()->getData(),
            'activeUsersByDate' => $this->getActiveUsersByDate()->getData(),
            'userDistribution' => $this->getUserDistribution()->getData(),
            'supportRequestsByDay' => $this->getSupportRequestsByDay()->getData(),
            'reportsByCategory' => $this->getReportsByCategory()->getData()
        ]);
    }

    private function calculatePercentChange($oldValue, $newValue)
    {
        if ($oldValue == 0) {
            return $newValue > 0 ? 100 : 0;
        }

        return round((($newValue - $oldValue) / $oldValue) * 100, 1);
    }


    public function manageUser(Request $request)
    {

        $query = User::withoutGlobalScope(ExcludeBannedUsers::class);

        // $query = User::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%")
                    ->orWhere('first_name', 'like', "%$search%")
                    ->orWhere('last_name', 'like', "%$search%");
            });
        }

        if (!is_null($request->input('is_admin'))) {
            $query->where('is_admin', $request->input('is_admin'));
        }

        if (!is_null($request->input('status'))) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('min_reports')) {
            $minReports = (int) $request->input('min_reports');
            $query->withCount('reportsReceived')
                ->having('reports_received_count', '>=', $minReports);
        }

        $query->orderByDesc('last_active');

        $users = $query->paginate(20);

        return response()->json($users);
    }

    public function updateUserStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,banned',
        ]);

        $user = User::withoutGlobalScopes()->findOrFail($id);

        $user->status = $request->input('status');
        $user->save();

        return response()->json([
            'message' => 'Cập nhật trạng thái thành công.',
            'user' => $user,
        ]);
    }
}
