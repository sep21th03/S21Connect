<?php

namespace App\Http\Controllers\Pay;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Bill;
use App\Models\History;
use App\Models\Cash;
use App\Models\Shop;
use Illuminate\Support\Facades\Auth;
use App\Models\LuckyMoney;

class UserGetController extends Controller
{
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
                $get_name = Shop::getByID($item->shop_id);
                if ($get_name == null) {
                    $name = 'Không tìm thấy';
                } else {
                    $name = $get_name->name;
                }
                $result[] = [
                    'id' => $item->id,
                    'bill_id' => $item->bill_id,
                    'username' => $item->username,
                    'sotien' => $item->sotien,
                    'ghichu' => $item->comment,
                    'trangthai' => $item->trangthai,
                    'payment_method' => $item->payment_method,
                    'shop' => $name,
                    'shop_id' => $item->shop_id,
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
    public function get_lixi()
    {
        if (!Auth::check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn chưa đăng nhập hoặc thiếu token xác thực'
            ]);
        }
        $user = Auth::user();
        $username = $user->username;
        $data = LuckyMoney::getByUsername($username);
        if ($data != null) {
            $result = [];
            foreach ($data as $item) {
                $result[] = [
                    'id' => $item->id,
                    'bill_id' => $item->bill_id,
                    'username' => $item->username,
                    'sotien' => $item->sotien,
                    'ghichu' => $item->comment,
                    'trangthai' => $item->trangthai,
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
    public function get_shop()
    {
        if (!Auth::check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn chưa đăng nhập'
            ]);
        }
        $user = Auth::user();
        $username = $user->username;
        $data = Shop::getByUsername($username);
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
    public function get_list_shop_count_money()
    {
        $shops = Shop::getByUsername(Auth::user()->username);
        $result = [];
        foreach ($shops as $shop) {
            $totalMoney = Bill::countTotalMoneybyShopid($shop->id, Auth::user()->username);
            $count = Bill::countBillbyShopid($shop->id);
            $count_pay = Bill::countBillbyShopidAndStatusAndUsername($shop->id, 2, Auth::user()->username);
            $count_cancel = Bill::countBillbyShopidAndStatusAndUsername($shop->id, 3, Auth::user()->username);
            $count_unpay = Bill::countBillbyShopidAndStatusAndUsername($shop->id, 1, Auth::user()->username);
            $result[] = [
                'id' => $shop->id,
                'name' => $shop->name,
                'count' => $count,
                'count_pay' => $count_pay,
                'count_cancel' => $count_cancel,
                'count_unpay' => $count_unpay,
                'money' => $totalMoney
            ];
        }

        usort($result, function ($a, $b) {
            return $b['money'] <=> $a['money'];
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Lấy dữ liệu thành công',
            'data' => $result
        ]);
    }

    public function get_payment()
    {
        if (!Auth::check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn chưa đăng nhập'
            ]);
        }
        $user = Auth::user();
        if($user->admin == 'true'){
            $data = Cash::getPayment();
        } else {
            $data = Cash::getByUsername($user->username);
        }
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
}
