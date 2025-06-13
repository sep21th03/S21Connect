<?php

namespace App\Http\Controllers\Pay;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\MyController\MyFunction;

class ShopController extends Controller
{
    public function create_shop(Request $request)
    {
        $function = new MyFunction;
        if (!Auth::check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn chưa đăng nhập hoặc thiếu token xác thực'
            ]);
        }
        if (!$request->filled('name')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thiếu thông tin'
            ]);
        }
        $user = Auth::user();
        $username = $user->username;
        $name = $request->name;
        $shop = Shop::firstShopByUsernameAndName($username, $name);
        if ($shop != null) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn đã có shop tên này rồi'
            ]);
        }
        $token = $function->randomToken('32');
        $data = new Shop;
        $data->username = $username;
        $data->name = $name;
        $data->token = $token;
        $data->time = time();
        if ($data->save()) {
            $ip = $function->getIP();
            $add_history = $function->addHistory($username, 'Tạo shop thành công từ IP: ' . $ip);
            return response()->json([
                'status' => 'success',
                'message' => 'Tạo shop thành công',
                'data' => $data
            ]);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi truy vấn cơ sở dữ liệu'
            ]);
        }
    }
    public function delete_shop(Request $request)
    {
        $function = new MyFunction;
        if (!Auth::check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn chưa đăng nhập hoặc thiếu token xác thực'
            ]);
        }
        if (!$request->filled('id')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thiếu thông tin'
            ]);
        }
        $user = Auth::user();
        $username = $user->username;
        $id = $request->id;
        $shop = Shop::firstShopByUsernameAndID($username, $id);
        if ($shop == null) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn không có shop này'
            ]);
        }
        if ($shop->delete()) {
            $ip = $function->getIP();
            $add_history = $function->addHistory($username, 'Xóa shop thành công từ IP: ' . $ip);
            return response()->json([
                'status' => 'success',
                'message' => 'Xóa shop thành công',
                'data' => $shop
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
}
