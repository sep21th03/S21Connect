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
use App\Http\Controllers\Messenger\MessengerController;
use App\Http\Controllers\Messenger\ChatGroupController;
use App\Http\Controllers\Messenger\ConversationController;
use App\Http\Controllers\Image\ImageController;

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
    Route::post('/refresh-token', [AuthController::class, 'refreshToken']);
});

Route::middleware(['auth:api'])->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
    });


    //user
    Route::get('/user', [UserController::class, 'me']);

    //post
    Route::prefix('posts')->group(function () {
        Route::post('/', [PostController::class, 'store']);
        Route::get('/public_post', [PostController::class, 'public_post']);
        Route::get('/my_post', [PostController::class, 'getMyPost']);
        Route::post('/edit', [PostController::class, 'editPost']);
        Route::post('/{id}', [PostController::class, 'destroy']);
        Route::get('/get_friend/{id}', [PostController::class, 'getFriendPost']); // GET /posts/{id}

        Route::post('/{id}/toggle-comments', [PostController::class, 'toggleComments']);
        Route::post('/{id}/reactions', [PostController::class, 'toggleReactions']);

        Route::prefix('/comments')->group(function () {
            Route::post('/add', [CommentController::class, 'store']);
            Route::get('/{postId}', [CommentController::class, 'getCommentsByPostId']);
            Route::delete('/{id}', [CommentController::class, 'destroy']);
        });

        Route::prefix('{postId}/reactions')->group(function () {
            Route::post('/toggle', [ReactionController::class, 'toggleReaction']);
            Route::get('/get', [ReactionController::class, 'getPostReactions']);
        });

        Route::prefix('/shares')->group(function () {
            Route::post('/post', [ShareController::class, 'share']);      
            Route::get('/{postId}', [ShareController::class, 'getSharesByPost']);   
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
        Route::post('/user/avatar', [ProfileController::class, 'updateAvatar']);
    });

    //hovercard

    Route::prefix('user')->group(function () {
        Route::get('{userId}/hovercard', [UserController::class, 'hoverCardData']);
        Route::get('{userId}/list_friends', [UserController::class, 'getListFriend']);
        Route::get('{userId}/list_friends_limit', [UserController::class, 'getListFriendLimit']);
        Route::get('{userId}/friends', [UserController::class, 'getFriendsWithMutualCount']);
        Route::post('/update-last-active', [UserController::class, 'updateLastActive']);
    });

    //messenger
    Route::prefix('messages')->group(function () {
        // Route::post('/send', [MessengerController::class, 'send']);
        // Route::post('/mark-as-read', [MessengerController::class, 'markAsRead']);
        // Route::get('/conversation', [MessengerController::class, 'getConversation']);
        // Route::get('/recent-conversations', [MessengerController::class, 'getRecentConversations']);


        Route::post('/send', [MessengerController::class, 'send']);
        Route::post('/read', [MessengerController::class, 'markAsRead']);
        Route::get('/conversation/{conversationId}', [MessengerController::class, 'getMessages']);
        Route::get('/recent-conversations', [MessengerController::class, 'getRecentConversations']);
        Route::get('/{id}', [MessengerController::class, 'getMessage']);
        Route::delete('/{id}', [MessengerController::class, 'delete']);
        Route::post('/upload', [MessengerController::class, 'uploadFiles']);
        Route::get('/search/{conversationId}', [MessengerController::class, 'search']);
    });

    Route::prefix('conversations')->group(function () {
        Route::get('/', [ConversationController::class, 'index']);
        Route::post('/', [ConversationController::class, 'create']);
        Route::get('/{id}', [ConversationController::class, 'show']);
        Route::put('/{id}', [ConversationController::class, 'update']);
        Route::post('/{id}/users', [ConversationController::class, 'addUsers']);
        Route::delete('/{id}/users/{userId}', [ConversationController::class, 'removeUser']);
        Route::put('/{id}/users/{userId}/nickname', [ConversationController::class, 'updateNickname']);
        Route::delete('/{id}/leave', [ConversationController::class, 'leave']);
        Route::get('/{id}/media', [ConversationController::class, 'getMedia']);
    });
    //image
    Route::prefix('images')->group(function () {
        Route::post('/upload', [ImageController::class, 'store']);
        Route::get('/{id}', [ImageController::class, 'show']);
        Route::delete('/{id}', [ImageController::class, 'destroy']);
        Route::get('/', [ImageController::class, 'index']);
    });


    Route::prefix('chat-groups')->group(function () {
        Route::post('/', [ChatGroupController::class, 'create']);

        // Lấy thông tin nhóm
        Route::get('/{id}', [ChatGroupController::class, 'show']);

        // Cập nhật thông tin nhóm
        Route::put('/{id}', [ChatGroupController::class, 'update']);

        // Thêm thành viên vào nhóm
        Route::post('/{id}/add-members', [ChatGroupController::class, 'addMembers']);

        // Xoá thành viên khỏi nhóm
        Route::post('/{id}/remove-members', [ChatGroupController::class, 'removeMembers']);

        // Rời nhóm
        Route::post('/{id}/leave', [ChatGroupController::class, 'leaveGroup']);

        // Chuyển quyền chủ nhóm
        Route::post('/{id}/transfer-ownership', [ChatGroupController::class, 'transferOwnership']);

        // Xoá nhóm
        Route::delete('/{id}', [ChatGroupController::class, 'delete']);

        // Lấy danh sách nhóm của người dùng
        Route::get('/', [ChatGroupController::class, 'getUserGroups']);
    });
    // Route::get('/profile/{id}', [Controller::class, 'getProfile'])->middleware('check.blocked');
    // Route::get('/messages/{id}', [Controller::class, 'getMessages'])->middleware('check.blocked');
});
