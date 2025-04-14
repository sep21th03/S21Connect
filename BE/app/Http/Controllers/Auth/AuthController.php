<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Password;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $this->authService->register($request->validated());

        return response()->json(['message' => 'Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.'], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        return $this->authService->login($request->validated());
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::logout();

        return response()->json(['message' => 'Đăng xuất thành công!']);
    }

    public function refreshToken()
    {
        try {
            $newToken = JWTAuth::refresh(JWTAuth::getToken());

            return response()->json([
                'token'   => $newToken,
                'expires' => JWTAuth::factory()->getTTL() * 60
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Không thể refresh token'], 401);
        }
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);
    
        $status = Password::broker()->sendResetLink(
            $request->only('email')
        );
    
        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => 'Email khôi phục mật khẩu đã được gửi.'])
            : response()->json(['error' => trans($status)], 500);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:6|confirmed',
        ]);
    
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );
    
        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => 'Mật khẩu đã được đặt lại thành công.'])
            : response()->json(['error' => trans($status)], 400);
    }


    public function verifyEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);
        
        return $this->authService->verifyEmail($request->email);
    }


    public function userInfo(Request $request)
    {
        if (Auth::check()) {
            return response()->json(['message' => 'You are logged in', 'user' => Auth::user()]);
        } else {
            return response()->json(['message' => 'You are not logged in']);
        }
    }
}
