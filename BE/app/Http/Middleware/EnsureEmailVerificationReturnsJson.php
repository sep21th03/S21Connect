<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureEmailVerificationReturnsJson
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->expectsJson()) {
            return response()->json(['message' => 'Email xác minh thành công! Bạn có thể đăng nhập ngay.']);
        }

        return $next($request);
    }
}
