<?php

namespace App\Http\Controllers\Pay;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Controllers\MyController\MyFunction;
use Illuminate\Support\Facades\Auth;
use App\Models\Cash;
use App\Models\User;

class CashController extends Controller
{
      public function create_request_payment(Request $request)
    {
        $function = new MyFunction;
        if (!Auth::check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn chưa đăng nhập hoặc thiếu token xác thực'
            ]);
        }
        $user = Auth::user();
        $username = $user->username;

        if ($request->sotien < 2000) {
            return response()->json([
                'status' => 'error',
                'message' => 'Số tiền phải lớn hơn 2.000 VNĐ',
                'error' => $request->account_bank,
            ]);
        }
        if ($request->sotien > $user->vnd) {
            return response()->json([
                'status' => 'error',
                'message' => 'Số dư không đủ'
            ]);
        }
        if ($request->filled('account_bank') && $request->filled('account_number') && $request->filled('sotien')) {
            $cash = Cash::create($username, $request->account_bank, $request->account_number, $user->name, $request->sotien);
            $user_get = User::getByUsername($username);
            $user_get->vnd = $user_get->vnd - $request->sotien;
            $user_get->save();
            $add_history = $function->addHistory($username, 'Yêu cầu thanh toán số tiền: ' . number_format($request->sotien) . ' VNĐ');

            return response()->json([
                'status' => 'success',
                'message' => 'Yêu cầu thanh toán của bạn đã được gửi',
                'data' => $cash
            ]);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Vui lòng điền đầy đủ thông tin'
            ]);
        }
    }
}