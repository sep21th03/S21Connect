<?php
namespace App\Http\Controllers\Auth;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Auth\Events\Verified;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;

class VerifyEmailController extends Controller
{
    // public function __invoke(Request $request)
    // {
    //     // Tìm người dùng theo ID trong URL
    //     $user = User::find($request->route('id'));
        
    //     if (!$user) {
    //         return response()->json(['message' => 'Người dùng không tồn tại'], 404);
    //     }
        
    //     // Kiểm tra hash có hợp lệ
    //     if (!hash_equals((string) $request->route('hash'), 
    //                       sha1($user->getEmailForVerification()))) {
    //         return response()->json(['message' => 'URL không hợp lệ'], 403);
    //     }
        
    //     // Kiểm tra nếu URL đã hết hạn
    //     if (Carbon::parse($user->created_at)->addMinutes(
    //             Config::get('auth.verification.expire', 60))->isPast()) {
    //         return response()->json(['message' => 'URL đã hết hạn'], 403);
    //     }
        
    //     // Xác minh email
    //     if (!$user->hasVerifiedEmail()) {
    //         $user->markEmailAsVerified();
    //         event(new Verified($user));
    //     }
        
    //     return response()->json(['message' => 'Email xác minh thành công! Bạn có thể đăng nhập ngay.']);
    // }
    public function __invoke(Request $request)
    {
        $user = User::findOrFail($request->route('id'));

        if (! hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Link không hợp lệ'], 403);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email đã được xác minh']);
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        return response()->json(['message' => 'Xác minh email thành công']);
    }
}