<?php

namespace App\Http\Controllers\MyController;

use App\Http\Controllers\Controller;
use App\Models\History;
use Illuminate\Support\Facades\Http;

class MyFunction extends Controller
{
    public function addHistory($user_id, $message)
    {
        $history = new History;
        $history->username = $user_id;
        $history->message = $message;
        $history->time = time();
        $history->save();
        if ($history->save()) {
            return true;
        } else {
            return false;
        }
    }
    public function getIP()
    {
        if (isset($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        } elseif (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            return $_SERVER['HTTP_X_FORWARDED_FOR'];
        } elseif (isset($_SERVER['HTTP_X_FORWARDED'])) {
            return $_SERVER['HTTP_X_FORWARDED'];
        } elseif (isset($_SERVER['HTTP_FORWARDED_FOR'])) {
            return $_SERVER['HTTP_FORWARDED_FOR'];
        } elseif (isset($_SERVER['HTTP_FORWARDED'])) {
            return $_SERVER['HTTP_FORWARDED'];
        } else {
            return $_SERVER['REMOTE_ADDR'];
        }
    }
    public function generateRandomString()
    {
        $letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $numbers = '0123456789';
        $result = '';
        for ($i = 0; $i < 2; $i++) {
            $result .= $letters[rand(0, strlen($letters) - 1)];
        }
        for ($i = 0; $i < 8; $i++) {
            $result .= $numbers[rand(0, strlen($numbers) - 1)];
        }
        return $result;
    }
    public function generateSignature($amount, $cancelUrl, $description, $orderCode, $returnUrl, $checksumKey)
    {
        $data = "amount=$amount&cancelUrl=$cancelUrl&description=$description&orderCode=$orderCode&returnUrl=$returnUrl";

        $signature = hash_hmac('sha256', $data, $checksumKey);

        return $signature;
    }
    public function randomID($number)
    {
        $numbers = '0123456789';
        $result = '';
        for ($i = 0; $i < $number; $i++) {
            $result .= $numbers[rand(0, strlen($numbers) - 1)];
        }
        return $result;
    }
    public function randomToken($number)
    {
        $letters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        $result = '';
        for ($i = 0; $i < $number; $i++) {
            $result .= $letters[rand(0, strlen($letters) - 1)];
        }
        return $result;
    }
    public function create_api_bill($amount, $order_id, $description, $return_url, $cancel_url)
    {
        $checksumKey = env('CHECK_SUM_KEY');
        $signature = $this->generateSignature($amount, $cancel_url, $description, $order_id, $return_url, $checksumKey);
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
            return $result->json();
        } else {
            return false;
        }
    }
    public static function checkvalidemail($email)
    {
        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $response = Http::get('http://api.eva.pingutil.com/email', ['email' => $email]);
            $result = $response->json();
            if ($result['data']['disposable'] == true) {
                return false;
            } elseif ($result['data']['deliverable'] == false) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
    public static function checkvalidphone($phone)
    {
        if (preg_match('/^[0-9]{10}$/', $phone)) {
            return true;
        } else {
            return false;
        }
    }
    public static function checkvalidusername($username)
    {
        if (preg_match('/^[a-zA-Z0-9]{6,20}$/', $username)) {
            return true;
        } else {
            return false;
        }
    }
    public static function isPasswordStrong($password)
    {
        $uppercase = preg_match('@[A-Z]@', $password);
        $lowercase = preg_match('@[a-z]@', $password);
        $number    = preg_match('@[0-9]@', $password);
        $specialChars = preg_match('@[^\w]@', $password);

        if (!$uppercase || !$lowercase || !$number || !$specialChars || strlen($password) < 8) {
            return false;
        }

        return true;
    }
}
