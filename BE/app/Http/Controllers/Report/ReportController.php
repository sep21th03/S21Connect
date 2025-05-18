<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function report(Request $request, $type, $id)
    {
        $data = $request->validate([
            'reason_code' => 'required|string',
            'reason_text' => 'nullable|string|max:255',
        ]);
        return $this->reportService->report($id, $data, $type);
    }
    public function getReasons($type)
    {
        $all = config('report_reasons');

        if (!isset($all[$type])) {
            return response()->json(['message' => 'Loại báo cáo không hợp lệ.'], 422);
        }

        $reasons = collect($all[$type])->map(fn($label, $code) => [
            'value' => $code,
            'label' => $label,
        ])->values();

        return response()->json($reasons);
    }
    public function getReportPost()
    {
        return $this->reportService->getReportPost();
    }
    public function getReportUser()
    {
        return $this->reportService->getReportUser();
    }
    public function getReportAll()
    {
        return $this->reportService->getReportAll();
    }
}
