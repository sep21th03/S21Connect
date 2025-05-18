<?php

namespace App\Http\Controllers\Pay;

use App\Models\Bill;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Models\History;

class UserBillController extends Controller
{
    public function get_info()
    {
        if (!Auth::check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn chưa đăng nhập'
            ]);
        }
        $user = Auth::user();
        $username = $user->username;
        $data_user = User::where('username', $username)->first();
        if ($data_user == null) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy thông tin người dùng'
            ]);
        }
        $count_bill = Bill::countBillByUsername($username);
        $count_bill_unpay = Bill::countBillByUsernameAndStatus($username, 1);
        $count_bill_pay = Bill::countBillByUsernameAndStatus($username, 2);
        $count_bill_cancel = Bill::countBillByUsernameAndStatus($username, 3);
        $data = [
            'username' => $data_user->username,
            'vnd' => $data_user->vnd,
            'count_bill' => $count_bill,
            'count_bill_unpay' => $count_bill_unpay,
            'count_bill_pay' => $count_bill_pay,
            'count_bill_cancel' => $count_bill_cancel
        ];
        if ($data != null) {
            return response()->json([
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công',
                'data' => $data
            ]);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi truy vấn cơ sở dữ liệu'
            ]);
        }
    }

    public function get_history()
    {
        if (!Auth::check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn chưa đăng nhập hoặc thiếu token xác thực'
            ]);
        }
        $user = Auth::user();
        $username = $user->username;
        $data = History::getByUsername($username);
        if ($data != null) {
            return response()->json([
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công',
                'data' => $data
            ]);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi truy vấn cơ sở dữ liệu'
            ]);
        }
    }

    public function get_bill()
    {
        if (!Auth::check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn chưa đăng nhập hoặc thiếu token xác thực'
            ]);
        }
        $user = Auth::user();
        $username = $user->username;
        $data = Bill::getByUsername($username);
        if ($data != null) {
            $result = [];
            foreach ($data as $item) {
                $result[] = [
                    'id' => $item->id,
                    'bill_id' => $item->bill_id,
                    'username' => $item->username,
                    'amount' => $item->amount,
                    'note' => $item->comment,
                    'status' => $item->status,
                    'payment_method' => $item->payment_method,
                    'created_at' => $item->time,
                    'updated_at' => $item->updated_at,
                ];
            }
            return response()->json([
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công',
                'data' => $result
            ]);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi truy vấn cơ sở dữ liệu'
            ]);
        }
    }

}
