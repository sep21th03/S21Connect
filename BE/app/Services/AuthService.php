<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\MyController\MyFunction;
use App\Models\LoginLog;


class AuthService
{
    public function register(array $data)
    {
        $user = User::create([
            'id' => Str::uuid(),
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'gender' => $data['gender'],
            'birthday' => $data['birthday'],
        ]);

        $user->sendEmailVerificationNotification();

        return $user;
    }

    public function login($data)
    {
        $credentials = $data;
        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $refreshToken = JWTAuth::fromUser(Auth::user());
        $user = Auth::user();
        if (is_null($user->email_verified_at)) {
            return response()->json(['error' => 'Email chưa được xác minh'], 403);
        }
        $my_function = new MyFunction();
        $ip = $my_function->getIP();
        LoginLog::create([
            'user_id' => $user->id,
            'ip_address' => $ip,
            'device_hash' => $data['device_hash'] ?? request()->header('User-Agent'),
            'device_info' => $data['device_info'] ?? null,
        ]);

        return response()->json(['token' => $token, 'refresh_token' => $refreshToken, 'expires_in' => JWTAuth::factory()->getTTL() * 60]);
    }

    public function verifyEmail($email)
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json(['error' => 'Không tìm thấy người dùng với email này'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email đã được xác minh'], 200);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Email xác minh đã được gửi']);
    }
}
