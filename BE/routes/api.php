<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Post\PostController;
use App\Http\Controllers\Post\CommentController;
use App\Http\Controllers\Post\ShareController;
use App\Http\Controllers\Post\ReactionController;
use App\Http\Controllers\User\FriendController;
use App\Http\Controllers\User\BlockController;
use App\Http\Controllers\User\ProfileController;
use App\Http\Controllers\Post\ProfilePostController;
use App\Http\Controllers\User\UserController;

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
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/login', function () {
        return redirect(env('FRONTEND_URL') . '/auth/login');
    })->name('login');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    Route::get('/email/verify/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed'])
        ->name('verification.verify');

    Route::post('/email/resend', [AuthController::class, 'verifyEmail'])->name('verification.notice');
});

Route::middleware(['auth:api'])->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh-token', [AuthController::class, 'refreshToken']);
    });


    //user
    Route::get('/user', [UserController::class, 'me']);

    //post
    Route::prefix('posts')->group(function () {
        // 📌 Post resource
        Route::apiResource('/', PostController::class)->parameters(['' => 'post']);

        // 🔧 Toggle options
        Route::post('/{id}/toggle-comments', [PostController::class, 'toggleComments']);
        Route::post('/{id}/reactions', [PostController::class, 'toggleReactions']);

        // 💬 Comments on a post
        Route::prefix('{postId}/comments')->group(function () {
            Route::post('/', [CommentController::class, 'store']);      // POST /posts/{postId}/comments
            Route::delete('/{id}', [CommentController::class, 'destroy']); // DELETE /posts/{postId}/comments/{id}
        });

        // 😊 Reactions on a post
        Route::prefix('{postId}/reactions')->group(function () {
            Route::post('/', [ReactionController::class, 'store']);       // POST /posts/{postId}/reactions
            Route::delete('/{id}', [ReactionController::class, 'destroy']); // DELETE /posts/{postId}/reactions/{id}
        });

        // 🔁 Shares of a post
        Route::prefix('{postId}/shares')->group(function () {
            Route::post('/', [ShareController::class, 'store']);        // POST /posts/{postId}/shares
            Route::get('/', [ShareController::class, 'getShares']);     // GET  /posts/{postId}/shares
        });
    });

    //friend
    Route::prefix('friends')->group(function () {
        Route::post('/request/{id}', [FriendController::class, 'sendRequest']);
        Route::post('/accept/{id}', [FriendController::class, 'acceptRequest']);
        Route::delete('/cancel/{id}', [FriendController::class, 'cancelRequest']);
        Route::delete('/remove/{id}', [FriendController::class, 'unfriend']);
        Route::get('/status/{friendId}', [FriendController::class, 'checkStatus']);
    });


    //block
    Route::post('/block/{id}', [BlockController::class, 'blockUser']);
    Route::delete('/unblock/{id}', [BlockController::class, 'unblockUser']);
    Route::get('/blocked-users', [BlockController::class, 'getBlockedUsers']);


    // Profile routes
    Route::prefix('profile')->group(function () {
        Route::get('/me', [ProfileController::class, 'getMeProfile']);
        Route::patch('/me', [ProfileController::class, 'updateMeProfile']);
        Route::post('/me', [ProfileController::class, 'createMeProfile']);
        Route::get('/{username}', [ProfileController::class, 'getUserProfile']);
        Route::get('/{userId}/posts', [ProfilePostController::class, 'getProfilePosts']);
        Route::post('/about/info', [ProfileController::class, 'updateProfileAbout']);
        Route::get('/user/data/{id}', [FriendController::class, 'getFriendStats']);
    });

    //hovercard

    Route::prefix('user')->group(function () {
        Route::get('{userId}/hovercard', [UserController::class, 'hoverCardData']);
        Route::get('{userId}/list_friends', [UserController::class, 'getListFriend']);
        Route::get('{userId}/friends', [UserController::class, 'getFriendsWithMutualCount']);
    });
    // Route::get('/profile/{id}', [Controller::class, 'getProfile'])->middleware('check.blocked');
    // Route::get('/messages/{id}', [Controller::class, 'getMessages'])->middleware('check.blocked');
});
