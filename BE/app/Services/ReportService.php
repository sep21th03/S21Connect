<?php

namespace App\Services;

use App\Models\Report;
use Illuminate\Support\Facades\Auth;

class ReportService
{
    public function report($id, $data, $type)
    {
        $user = Auth::user();
        $validTypes = ['Post', 'User', 'Page'];

        $validTypes = ['Post', 'User', 'Page'];
        if (!in_array($type, $validTypes)) {
            return response()->json(['message' => 'Loại báo cáo không hợp lệ.'], 422);
        }

        $reasons = config('report_reasons.' . $type, []);
        if (!array_key_exists($data['reason_code'], $reasons)) {
            return response()->json(['message' => 'Lý do báo cáo không hợp lệ.'], 422);
        }

        if ($type === 'User' && $id === $user->id) {
            return response()->json(['message' => 'Bạn không thể báo cáo chính mình.'], 403);
        }

        if ($type === 'Post' && $id === $user->id) {
            return response()->json(['message' => 'Bạn không thể báo cáo bài viết của chính mình.'], 403);
        }

        $existing = Report::where('reportable_type', $type)
            ->where('reportable_id', $id)
            ->where('reporter_id', $user->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Bạn đã báo cáo mục này rồi.'], 409);
        }

        Report::create([
            'reportable_type' => $type,
            'reportable_id' => $id,
            'reporter_id' => $user->id,
            'reason_code' => $data['reason_code'],
            'reason_text' => $data['reason_text'] ?? null,
            'status' => 'pending',
        ]);


        return response()->json(['message' => 'Báo cáo đã được gửi thành công.']);
    }
    public function getReportPost()
    {
        $user = Auth::user();
        return Report::where('reporter_id', $user->id)
            ->where('reportable_type', "Post")
            ->with(['reportable'])
            ->get();
    }

    public function getReportUser()
    {
        $user = Auth::user();
        return Report::where('reporter_id', $user->id)
            ->where('reportable_type', "User")
            ->with(['reportable'])
            ->get();
    }
    public function getReportAll()
    {
        $reports = Report::with([
            'reportable', // load đầy đủ, hoặc dùng select global cho model
            'reporter:id,first_name,last_name,avatar'
        ])->get();

        return $reports->map(function ($report) {
            $reportable = $report->reportable;

            if ($reportable instanceof \App\Models\Post) {
                // Lọc bớt trường cho post
                $reportable = collect($reportable)->only([
                    'id',
                    'post_id',
                    'user_id',
                    'content',
                    'images',
                    'created_at',
                    'updated_at'
                ]);
            } elseif ($reportable instanceof \App\Models\User) {
                // Lọc bớt trường cho user
                $reportable = collect($reportable)->only([
                    'id',
                    'username',
                    'first_name',
                    'last_name',
                    'email',
                    'avatar',
                    'created_at',
                    'updated_at'
                ]);
            }

            return [
                'id' => $report->id,
                'reportable_type' => class_basename($report->reportable_type),
                'reportable_id' => $report->reportable_id,
                'reporter_id' => $report->reporter_id,
                'reason_code' => $report->reason_code,
                'reason_text' => $report->reason_text,
                'reason_description' => $report->reason_description,
                'status' => $report->status,
                'admin_note' => $report->admin_note,
                'created_at' => $report->created_at,
                'updated_at' => $report->updated_at,
                'reportable' => $reportable,
                'reporter' => $report->reporter->only(['id', 'first_name', 'last_name', 'avatar']),
            ];
        });
    }
}
