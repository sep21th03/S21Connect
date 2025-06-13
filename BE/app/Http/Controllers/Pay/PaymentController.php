<?php

namespace App\Http\Controllers\Pay;

use App\Models\Bill;
use App\Models\User;
use App\Models\Lixi;
use Illuminate\Http\Request;
use App\Http\Controllers\MyController\MyFunction;
use App\Http\Controllers\Controller;
use App\Models\LuckyMoney;
use Illuminate\Support\Facades\Http;


class PaymentController extends Controller
{
    public function cancel_payment(Request $request)
    {
        $id = $request->query('id');
        $code = $request->query('code');
        $cancel = $request->query('cancel');
        $status = $request->query('status');
        $orderCode = $request->query('orderCode');
        if (!$request->filled('id') || !$request->filled('code') || !$request->filled('cancel') || !$request->filled('status') || !$request->filled('orderCode')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thiếu thông tin'
            ]);
        }
        $data = Bill::getByOrderCodeAndPaymentLinkId($orderCode, $id);
        if ($data == null) {
            return redirect()->to(env('APP_URL') . '/hoadon/' . $data->id_hoadon);
        }
        if ($cancel == '1') {
            $data->status = 3;
            $data->save();
            return redirect()->to(env('APP_URL') . '/hoadon/' . $data->id_hoadon . '?success=false&message=Hóa đơn đã bị hủy, bạn đã hủy thanh toán!');
        } else {
            return redirect()->to(env('APP_URL') . '/hoadon/' . $data->id_hoadon);
        }
    }

    public function processing_payment(Request $request)
    {
        $id = $request->query('id');
        $code = $request->query('code');
        $cancel = $request->query('cancel');
        $status = $request->query('status');
        $orderCode = $request->query('orderCode');
        if (!$request->filled('id') || !$request->filled('code') || !$request->filled('cancel') || !$request->filled('status') || !$request->filled('orderCode')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thiếu thông tin'
            ]);
        }
        $data = Bill::getByOrderCodeAndPaymentLinkId($orderCode, $id);
        if ($data == null) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy hóa đơn'
            ]);
        }
        if ($status != '00' && $cancel != "false" && $status != "PAID") {
            return redirect()->to(env('APP_URL') . '/hoadon/' . $data->id_hoadon);
        } else {
            return redirect()->to(env('APP_URL') . '/hoadon/' . $data->id_hoadon);
        }
    }

    public function webhook_payos(Request $request)
    {
        try {
            $postData = $request->getContent();
            \Log::info('Webhook PayOS received: ', ['data' => $postData]);
            file_put_contents(storage_path('data.txt'), $postData);

            if ($postData == "") {
                return response()->json(['status' => 'error', 'message' => 'Empty post data'], 200);
            }

            $data = json_decode($postData, true);

            if ($data["code"] != "00") {
                return response()->json(['status' => 'error', 'message' => 'Invalid code'], 200);
            }

            $paymentLinkId = $data["data"]["paymentLinkId"];
            $signature = $data["signature"];
            $desc = $data["desc"];
            $description = $data["data"]["description"];
            $description = strtolower($description);
            $orderCode = $data["data"]["orderCode"];
            $success = $data["success"];

            if ($paymentLinkId == "" || $signature == "" || $desc == "" || $orderCode == "" || $success == "") {
                return response()->json(['status' => 'error', 'message' => 'Missing required fields'], 200);
            }

            if ($desc == 'success' && $success == true) {
                if (strpos($description, 'lixi') !== false) {
                    $order = LuckyMoney::where('data_orderCode', $orderCode)->where('paymentLinkId', $paymentLinkId)->first();
                    if ($order) {
                        $order->status = 2;
                        $order->payment_method = 'QRCode';
                        $order->save();

                        $get_user = $order->username;
                        $get_sotien = $order->sotien;
                        $update_user = User::where('username', $get_user)->first();
                        $update_user->vnd = $update_user->vnd + $get_sotien;
                        $update_user->save();

                        $history = new MyFunction;
                        $history->addHistory($get_user, "Bạn đã nhận được {$get_sotien} VNĐ từ lixi #{$order->id_hoadon}");

                        return response()->json(['status' => 'success', 'message' => 'Lixi payment processed'], 200);
                    }
                } else {
                    $order = Bill::where('data_orderCode', $orderCode)->where('paymentLinkId', $paymentLinkId)->first();
                    if ($order) {
                        $order->status = 2;
                        $order->payment_method = 'QRCode';
                        $order->save();

                        $get_user = $order->username;
                        $get_sotien = $order->amount;
                        $update_user = User::where('username', $get_user)->first();
                        $update_user->vnd = $update_user->vnd + $get_sotien;
                        $update_user->save();

                        $history = new MyFunction;
                        $history->addHistory($get_user, "Hóa đơn #{$order->id_hoadon} đã được thanh toán thành công bằng QR Code");

                        return response()->json(['status' => 'success', 'message' => 'Bill payment processed'], 200);
                    }
                }
            }

            return response()->json(['status' => 'error', 'message' => 'Payment not processed'], 200);
        } catch (\Exception $e) {
            \Log::error('Webhook PayOS error: ', ['message' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => 'Internal server error'], 200);
        }
    }

    public function create_api_bill(Request $request)
    {
        $amount = $request->input('amount');
        $order_id = $request->input('order_id');
        $description = $request->input('description');
        $return_url = env('RETURN_URL');
        $cancel_url =  env('CANCEL_URL');

        $checksumKey = env('CHECK_SUM_KEY');
        $myFunction = new MyFunction();
        $signature = $myFunction->generateSignature($amount, $cancel_url, $description, $order_id, $return_url, $checksumKey);

        $payload = [
            'orderCode' => $order_id,
            'amount' => $amount,
            'description' => $description,
            'cancelUrl' => $cancel_url,
            'returnUrl' => $return_url,
            'signature' => $signature,
        ];

        $result = Http::withHeaders([
            'x-client-id' => env('X_CLIENT_ID'),
            'x-api-key' => env('X_API_KEY'),
            'Content-Type' => 'application/json',
        ])->post('https://api-merchant.payos.vn/v2/payment-requests', $payload);

        if ($result->successful()) {
            return response()->json($result->json());
        } else {
            return response()->json(['error' => 'Create bill failed'], 500);
        }
    }
}
