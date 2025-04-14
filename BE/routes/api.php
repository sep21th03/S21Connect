<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\User\PostController;
use App\Http\Controllers\User\CommentController;
use App\Http\Controllers\User\ShareController;
use App\Http\Controllers\User\ReactionController;
use App\Http\Controllers\User\FriendController;
use App\Http\Controllers\User\BlockController;
use App\Http\Controllers\Controller;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/
//auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:api', 'verified'])->get('/user', [AuthController::class, 'userInfo']);

Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/email/verify/{id}/{hash}', VerifyEmailController::class)
    ->middleware(['signed'])
    ->name('verification.verify');

Route::get('/email/verify', function (Request $request) {
    if ($request->user()->hasVerifiedEmail()) {
        return response()->json(['message' => 'Email đã được xác minh'], 200);
    }
    $request->user()->sendEmailVerificationNotification();
    return response()->json(['message' => 'Email xác minh đã được gửi']);
})->name('verification.notice');

Route::middleware(['auth:api'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/refresh-token', [AuthController::class, 'refreshToken']);

    // Route::get('/email/verify', function (Request $request) {
    //     if ($request->user()->hasVerifiedEmail()) {
    //         return response()->json(['message' => 'Email đã được xác minh'], 200);
    //     }
    //     $request->user()->sendEmailVerificationNotification();
    //     return response()->json(['message' => 'Email xác minh đã được gửi']);
    // })->name('verification.notice');

    Route::post('/email/resend', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Email xác minh đã được gửi lại']);
    })->name('verification.resend');



    //post
    Route::apiResource('posts', PostController::class);
    Route::post('/posts/{id}/toggle-comments', [PostController::class, 'toggleComments']);
    Route::post('/posts/{id}/reactions', [PostController::class, 'toggleReactions']);
    //comment
    Route::post('/comments', [CommentController::class, 'store']); // Thêm bình luận
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']); // Xóa bình luận

    // Routes cho cảm xúc
    Route::post('/reactions', [ReactionController::class, 'react']); // Thêm hoặc thay đổi cảm xúc
    Route::delete('/reactions/{postId}', [ReactionController::class, 'removeReaction']);

    //share
    Route::post('/shares', [ShareController::class, 'store']); // Chia sẻ bài viết
    Route::get('/shares/{postId}', [ShareController::class, 'getShares']);

    //friend
    Route::post('/friends/request/{id}', [FriendController::class, 'sendRequest']);
    Route::post('/friends/accept/{id}', [FriendController::class, 'acceptRequest']);
    Route::delete('/friends/cancel/{id}', [FriendController::class, 'cancelRequest']);
    Route::delete('/friends/remove/{id}', [FriendController::class, 'unfriend']);

    //block
    Route::post('/block/{id}', [BlockController::class, 'blockUser']);
    Route::delete('/unblock/{id}', [BlockController::class, 'unblockUser']);
    Route::get('/blocked-users', [BlockController::class, 'getBlockedUsers']);


    Route::get('/profile/{id}', [Controller::class, 'getProfile'])->middleware('check.blocked');
    Route::get('/messages/{id}', [Controller::class, 'getMessages'])->middleware('check.blocked');
});
