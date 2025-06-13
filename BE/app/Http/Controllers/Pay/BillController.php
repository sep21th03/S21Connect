<?php

namespace App\Http\Controllers\Pay;

use App\Models\Bill;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Http\Controllers\MyController\MyFunction;
use Illuminate\Support\Facades\Auth;


class BillController extends Controller
{
    public function get_info(Request $request)
    {
        $bill_id = $request->input('bill_id');
        if ($bill_id == null) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thiếu id hóa đơn'
            ]);
        }
        $data = Bill::getfirstBill($bill_id);
        if ($data->count() == 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy hóa đơn'
            ]);
        }
        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }
    public function check(Request $request)
    {
        $bill_id = $request->input('bill_id');
        if (!$request->filled('bill_id')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thiếu id hóa đơn'
            ]);
        }
        $data = Bill::getfirstBill($bill_id);
        if ($data == null) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy hóa đơn'
            ]);
        }
        $status = $data->status;
        if ($status == 1) {
            return response()->json([
                'status' => 'error',
                'message' => 'Chưa thanh toán'
            ]);
        } elseif ($status == 2) {
            return response()->json([
                'status' => 'success',
                'message' => 'Đã thanh toán',
                'data' => $data
            ]);
        } elseif ($status == 3) {
            return response()->json([
                'status' => 'success',
                'message' => 'Đã hủy thanh toán'
            ]);
        }
    }
    public function check_id(Request $request)
    {
        $bil_id = $request->input('bil_id');
        if (!$request->filled('bil_id')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thiếu id hóa đơn'
            ], 500);
        }
        $data = Bill::getfirstBill($bil_id);
        if ($data == null) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy hóa đơn nào với ID này, vui lòng kiểm tra lại'
            ], 500);
        }
        return response()->json([
            'status' => 'success',
            'message' => 'Tìm thấy hóa đơn'
        ]);
    }

    public function create_bill(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn chưa đăng nhập hoặc thiếu token xác thực'
            ]);
        }
        $amount = $request->input('amount');
        $comment = $request->input('note');
        $return_url = $request->input('return_url');
        $shop = $request->input('shop');
        if (!$request->filled('amount') || !$request->filled('note')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thiếu thông tin'
            ]);
        }
        $function = new MyFunction();
        $bill_id = $function->generateRandomString();
        $check = Bill::where('bill_id', $bill_id)->first();
        do {
            $bill_id = $function->generateRandomString();
            $check = Bill::where('bill_id', $bill_id)->first();
        } while ($check != null);

        $time = time();
        $data = Bill::where('bill_id', $bill_id)->get();
        if ($data->count() == 1) {
            return response()->json([
                'status' => 'error',
                'message' => 'ID Hóa đơn đã tồn tại, vui lòng kiểm tra lại'
            ]);
        } else {
            $shop_id = null;
            if (!empty($shop)) {
                $check_shop = Shop::getByUserandToken(Auth::user()->username, $shop);
                if ($check_shop == null) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Shop không tồn tại'
                    ]);
                }
                $shop_id = $check_shop->id;
            }
            $total_num_data = Bill::countallBill();
            $id = $total_num_data + 10900;
            $amount = (int)$amount;
            $cancelUrl = env('CANCEL_URL');
            $description = $bill_id;
            $orderCode = (int)$id;
            $random = rand(1, 999999);
            $id = $id + $random;
            $id = (int)$id;
            $returnUrl = env('RETURN_URL');
            $get_func = new MyFunction();
            $result = $get_func->create_api_bill($amount, $id, $description, $returnUrl, $cancelUrl);
            if ($result == false) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Lỗi kết nối đến API'
                ]);
            }
            if ($result['code'] == 00) {
                $paymentLinkId = $result['data']['paymentLinkId'];
                $accountName = $result['data']['accountName'];
                $accountNumber = $result['data']['accountNumber'];
                $description = $result['data']['description'];
                $qrCode = $result['data']['qrCode'];
                $signature = $result['signature'];
                $bill = new Bill();
                $bill->bill_id = $bill_id;
                $bill->amount = $amount;
                $bill->comment = $comment;
                $bill->status = 1;
                $bill->time = $time;
                $bill->paymentLinkId = $paymentLinkId;
                $bill->data_accountName = $accountName;
                $bill->data_accountNumber = $accountNumber;
                $bill->data_description = $description;
                $bill->data_qrCode = $qrCode;
                $bill->signature = $signature;
                $bill->data_OrderCode = $id;
                $bill->username = Auth::user()->username;
                $bill->return_url = $return_url;
                $bill->payment_method = 'QRCode';
                if ($shop_id !== null) {
                    $bill->shop_id = $shop_id;
                }
                if ($bill->save()) {
                    $myFunction = new MyFunction();
                    $ip = $myFunction->getIP();
                    $add_history = $myFunction->addHistory(Auth::user()->username, 'Tạo hóa đơn thành công từ IP: ' . $ip);
                    return response()->json([
                        'status' => 'success',
                        'message' => 'Hóa đơn đã được tạo thành công',
                        'link' => env('APP_URL') . '/hoadon/' . $bill_id,
                        'data' => [
                            'bill_id' => $bill_id,
                            'amount' => $amount,
                            'comment' => $comment,
                            'status' => 1,
                            'time' => $time,
                            'paymentLinkId' => $paymentLinkId,
                            'data_accountName' => $accountName,
                            'data_accountNumber' => $accountNumber,
                            'data_description' => $description,
                            'data_qrCode' => $qrCode,
                            'signature' => $signature,
                            'data_OrderCode' => $id,
                            'username' => Auth::user()->username,
                            'return_url' => $return_url,
                            'payment_method' => 'QRCode',
                            'shop_id' => $shop_id
                        ]
                    ]);
                } else {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Lỗi truy vấn cơ sở dữ liệu'
                    ]);
                }
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Có lỗi xảy ra khi tạo link thanh toán: ' . $result['desc'] . ' (' . $result['code'] . ')',
                    'amount' => $amount,
                    'description' => $description,
                    'orderCode' => $orderCode,
                    'id_order' => $id
                ]);
            }
        }
    }

    public function create_store_account(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn chưa đăng nhập hoặc thiếu token xác thực'
            ]);
        }
        $amount = $request->input('amount');
        $comment = $request->input('comment');
        $return_url = $request->input('return_url');
        $shop = $request->input('shop');
        if (!$request->filled('amount') || !$request->filled('comment') || !$request->filled('shop')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thiếu thông tin'
            ]);
        }
        $function = new MyFunction();
        $bill_id = $function->generateRandomString();
        $check = Bill::where('bill_id', $bill_id)->first();
        do {
            $bill_id = $function->generateRandomString();
            $check = Bill::where('bill_id', $bill_id)->first();
        } while ($check != null);

        $time = time();
        $data = Bill::where('bill_id', $bill_id)->get();
        if ($data->count() == 1) {
            return response()->json([
                'status' => 'error',
                'message' => 'ID Hóa đơn đã tồn tại, vui lòng kiểm tra lại'
            ]);
        } else {
            $check_shop = Shop::getByUserandToken(Auth::user()->username, $shop);
            if ($check_shop == null) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Shop không tồn tại'
                ]);
            }
            $shop = $check_shop->id;
            $total_num_data = Bill::countallBill();
            $id = $total_num_data + 10900;
            $amount = (int)$amount;
            $cancelUrl = env('CANCEL_URL');
            $description = $bill_id;
            $orderCode = (int)$id;
            $random = rand(1, 999999);
            $id = $id + $random;
            $id = (int)$id;
            $returnUrl = env('RETURN_URL');
            $get_func = new MyFunction();
            $result = $get_func->create_api_bill($amount, $id, $description, $returnUrl, $cancelUrl);
            if ($result == false) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Lỗi kết nối đến API'
                ]);
            }
            if ($result['code'] == 00) {
                $paymentLinkId = $result['data']['paymentLinkId'];
                $accountName = $result['data']['accountName'];
                $accountNumber = $result['data']['accountNumber'];
                $description = $result['data']['description'];
                $qrCode = $result['data']['qrCode'];
                $signature = $result['signature'];
                $bill = new Bill();
                $bill->bill_id = $bill_id;
                $bill->amount = $amount;
                $bill->comment = $comment;
                $bill->status = 1;
                $bill->time = $time;
                $bill->paymentLinkId = $paymentLinkId;
                $bill->data_accountName = $accountName;
                $bill->data_accountNumber = $accountNumber;
                $bill->data_description = $description;
                $bill->data_qrCode = $qrCode;
                $bill->signature = $signature;
                $bill->data_OrderCode = $id;
                $bill->username = Auth::user()->username;
                $bill->return_url = $return_url;
                $bill->payment_method = 'QRCode';
                $bill->shop_id = $shop;
                if ($bill->save()) {
                    $myFunction = new MyFunction();
                    $ip = $myFunction->getIP();
                    $add_history = $myFunction->addHistory(Auth::user()->username, 'Tạo hóa đơn thành công từ IP: ' . $ip);
                    return response()->json([
                        'status' => 'success',
                        'message' => 'Hóa đơn đã được tạo thành công',
                        'link' => env('APP_URL') . '/hoadon/' . $bill_id,
                        'data' => [
                            'bill_id' => $bill_id,
                            'amount' => $amount,
                            'comment' => $comment,
                            'status' => 1,
                            'time' => $time,
                            'paymentLinkId' => $paymentLinkId,
                            'data_accountName' => $accountName,
                            'data_accountNumber' => $accountNumber,
                            'data_description' => $description,
                            'data_qrCode' => $qrCode,
                            'signature' => $signature,
                            'data_OrderCode' => $id,
                            'username' => Auth::user()->username,
                            'return_url' => $return_url,
                            'payment_method' => 'QRCode',
                            'shop_id' => $shop
                        ]
                    ]);
                } else {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Lỗi truy vấn cơ sở dữ liệu'
                    ]);
                }
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Có lỗi xảy ra khi tạo link thanh toán: ' . $result['desc'] . ' (' . $result['code'] . ')',
                    'amount' => $amount,
                    'description' => $description,
                    'orderCode' => $orderCode,
                    'id_order' => $id
                ]);
            }
        }
    }

    public function get_shop_bill()
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
                    'id_hoadon' => $item->id_hoadon,
                    'username' => $item->username,
                    'sotien' => $item->sotien,
                    'ghichu' => $item->comment,
                    'status' => $item->status,
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

    public function delete_bill(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn chưa đăng nhập hoặc thiếu token xác thực'
            ]);
        }
        $user = Auth::user();
        $username = $user->username;
        $id_hoadon = $request->input('id');
        if (!$request->filled('id')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thiếu id hóa đơn'
            ]);
        }
        $data = Bill::getfirstBill($id_hoadon);
        if ($data == null) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hóa đơn không tồn tại'
            ]);
        }
        if ($data->username != $username) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn không có quyền xóa hóa đơn này'
            ]);
        }
        if ($data->status == 2) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hóa đơn đã được thanh toán, không thể xóa'
            ]);
        }
        if ($data->status == 3) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hóa đơn đã bị hủy, không thể xóa'
            ]);
        }
        if ($data->delete()) {
            $myFunction = new MyFunction();
            $ip = $myFunction->getIP();
            $add_history = $myFunction->addHistory(Auth::user()->username, 'Xóa hóa đơn thành công từ IP: ' . $ip);
            return response()->json([
                'status' => 'success',
                'message' => 'Xóa hóa đơn thành công'
            ]);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi truy vấn cơ sở dữ liệu'
            ]);
        }
    }

    public function pay_bill(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn chưa đăng nhập hoặc thiếu token xác thực'
            ]);
        }
        $user = Auth::user();
        $username = $user->username;
        $id_hoadon = $request->input('id_hoadon');
        if (!$request->filled('id_hoadon')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thiếu id hóa đơn'
            ]);
        }
        $data = Bill::getfirstBill($id_hoadon);
        if ($data == null) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hóa đơn không tồn tại'
            ]);
        }
        if ($data->username != $username) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn không có quyền hoàn thành hóa đơn này'
            ]);
        }
        if ($data->status == 2) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hóa đơn đã được thanh toán, không đánh dấu tiếp'
            ]);
        }
        if ($data->status == 3) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hóa đơn đã bị hủy, không thể đánh dấu hoàn thành'
            ]);
        }
        $data->status = 2;
        if ($data->save()) {
            $myFunction = new MyFunction();
            $ip = $myFunction->getIP();
            $add_history = $myFunction->addHistory(Auth::user()->username, 'Đánh dấu hoàn thành hóa đơn thành công từ IP: ' . $ip);
            return response()->json([
                'status' => 'success',
                'message' => 'Đánh dấu hoàn thành hóa đơn thành công'
            ]);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi truy vấn cơ sở dữ liệu'
            ]);
        }
    }
    public function unpay_bill(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn chưa đăng nhập hoặc thiếu token xác thực'
            ]);
        }
        $user = Auth::user();
        $username = $user->username;
        $id_hoadon = $request->input('id_hoadon');
        if (!$request->filled('id_hoadon')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thiếu id hóa đơn'
            ]);
        }
        $data = Bill::getfirstBill($id_hoadon);
        if ($data == null) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hóa đơn không tồn tại'
            ]);
        }
        if ($data->username != $username) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn không có quyền hoàn thành hóa đơn này'
            ]);
        }
        if ($data->status == 1) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hóa đơn chưa thanh toán, không thể đánh dấu lại'
            ]);
        }
        if ($data->status == 3) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hóa đơn đã bị hủy, không thể đánh dấu chưa hoàn thành'
            ]);
        }
        $data->status = 1;
        if ($data->save()) {
            $myFunction = new MyFunction();
            $ip = $myFunction->getIP();
            $add_history = $myFunction->addHistory(Auth::user()->username, 'Đánh dấu chưa hoàn thành hóa đơn thành công từ IP: ' . $ip);
            return response()->json([
                'status' => 'success',
                'message' => 'Đánh dấu chưa hoàn thành hóa đơn thành công'
            ]);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi truy vấn cơ sở dữ liệu'
            ]);
        }
    }
    public function cancel_bill(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn chưa đăng nhập hoặc thiếu token xác thực'
            ]);
        }
        $user = Auth::user();
        $username = $user->username;
        $id_hoadon = $request->input('id_hoadon');
        if (!$request->filled('id_hoadon')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thiếu id hóa đơn'
            ]);
        }
        $data = Bill::getfirstBill($id_hoadon);
        if ($data == null) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hóa đơn không tồn tại'
            ]);
        }
        if ($data->username != $username) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn không có quyền hủy hóa đơn này'
            ]);
        }
        if ($data->status == 2) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hóa đơn đã được thanh toán, không thể hủy'
            ]);
        }
        if ($data->status == 3) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hóa đơn đã bị hủy, không thể hủy'
            ]);
        }
        $data->status = 3;
        if ($data->save()) {
            $myFunction = new MyFunction();
            $ip = $myFunction->getIP();
            $add_history = $myFunction->addHistory(Auth::user()->username, 'Hủy hóa đơn thành công từ IP: ' . $ip);
            return response()->json([
                'status' => 'success',
                'message' => 'Hủy hóa đơn thành công'
            ]);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi truy vấn cơ sở dữ liệu'
            ]);
        }
    }
}
