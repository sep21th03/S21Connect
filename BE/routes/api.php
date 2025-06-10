<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Post\PostController;
use App\Http\Controllers\Post\CommentController;
use App\Http\Controllers\Post\ShareController;
use App\Http\Controllers\Post\ReactionController;
use App\Http\Controllers\Post\ProfilePostController;
use App\Http\Controllers\User\FriendController;
use App\Http\Controllers\User\BlockController;
use App\Http\Controllers\User\ProfileController;
use App\Http\Controllers\User\UserController;
use App\Http\Controllers\User\ActivityController;
use App\Http\Controllers\Messenger\MessengerController;
use App\Http\Controllers\Messenger\ChatGroupController;
use App\Http\Controllers\Messenger\ConversationController;
use App\Http\Controllers\Image\ImageController;
use App\Http\Controllers\MyController\MyFunction;
use App\Http\Controllers\Notification\NotificationController;
use App\Http\Controllers\Pay\PaymentController;
use App\Http\Controllers\Pay\BillController;
use App\Http\Controllers\Pay\UserBillController;
use App\Http\Controllers\Report\ReportController;
use App\Http\Controllers\Admin\AdminStatsController;
use App\Http\Controllers\Story\StoryController;
use App\Http\Controllers\Image\CloudinaryController;
use App\Http\Controllers\User\ContactController;
use App\Http\Controllers\FanpageController\PageController;


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
//cổng thông tin
Route::post('/get-info-bill', [BillController::class, 'get_info']);
Route::post('/check-bill', [BillController::class, 'check']);
Route::post('/check-id', [BillController::class, 'check_id'])->middleware('throttle');
// Route::post('/lixi/check', [LixiController::class, 'check']);
// Route::post('/lixi/get-info', [LixiController::class, 'get_info']);
Route::get('/cancel-payment', [PaymentController::class, 'cancel_payment']);
Route::post('/create-url', [PaymentController::class, 'create_url']);
Route::get('/process-payment', [PaymentController::class, 'processing_payment']);
Route::post('/get_notification', [PaymentController::class, 'get_notification']);
Route::post('/payos/webhook', [PaymentController::class, 'webhook_payos']);

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
    Route::post('/change-password', [AuthController::class, 'changePassword']);
});

Route::prefix('admin')->middleware(['auth:api', 'admin'])->group(function () {
    Route::get('/get-stats', [AdminStatsController::class, 'getStats']);
    Route::get('/get-report-post', [ReportController::class, 'getReportPost']);
    Route::get('/get-report-user', [ReportController::class, 'getReportUser']);
    Route::get('/get-report-all', [ReportController::class, 'getReportAll']);
    Route::get('/users', [AdminStatsController::class, 'manageUser']);
});

Route::middleware(['auth:api', 'throttle:10000,1'])->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
    });


    //user
    Route::get('/user', [UserController::class, 'me']);

    //post
    Route::prefix('posts')->group(function () {
        Route::post('/', [PostController::class, 'store']);
        // Route::get('/public_post', [PostController::class, 'public_post']);
        Route::get('/my_post', [PostController::class, 'getMyPost']);
        Route::get('/get_friend', [PostController::class, 'getFriendPost']);
        Route::post('/edit', [PostController::class, 'editPost']);
        Route::post('/{id}', [PostController::class, 'destroy']);
        Route::get('/newsfeed', [PostController::class, 'getNewsFeed']);
        // Route::get('/{id}', [PostController::class, 'getPostById']);
        Route::get('/show/{id}', [PostController::class, 'show']);

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
        Route::get('/birthday', [FriendController::class, 'upcomingBirthdays']);
        Route::get('/requests', [FriendController::class, 'getListRequestFriends']);
        Route::get('/search-friend', [UserController::class, 'searchFriend']);
        Route::get('/count_new_requests', [FriendController::class, 'countNewFriendRequests']);
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
        Route::post('/user/background', [ProfileController::class, 'updateBackground']);
        Route::get('/user/about', [ProfileController::class, 'getMeProfileAbout']);
    });



    //user
    Route::prefix('user')->group(function () {
        Route::get('/user-profile', [UserController::class, 'userProfile']);
        Route::get('{userId}/hovercard', [UserController::class, 'hoverCardData']);
        Route::get('{userId}/list_friends', [UserController::class, 'getListFriend']);
        Route::get('{userId}/list_friends_limit', [UserController::class, 'getListFriendLimit']);
        Route::get('{username}/list_friends_by_username', [UserController::class, 'getListFriendByUsername']);
        Route::post('/update-last-active', [UserController::class, 'updateLastActive']);
        Route::get('/get_stats', [UserController::class, 'getStats']);
        Route::get('/search-friend', [UserController::class, 'searchFriends']);
        Route::get('/suggest_friends', [UserController::class, 'suggestFriends']);
        Route::get('/activity_logs', [ActivityController::class, 'index']);
        Route::get('/activity_profile/{id}', [ActivityController::class, 'activityProfile']);
    });

    //story
    Route::prefix('stories')->group(function () {
        Route::get('/', [StoryController::class, 'index']);
        Route::post('/create', [StoryController::class, 'store']);
        Route::post('/mark-as-seen', [StoryController::class, 'markAsSeen']);
    });

    //messenger
    Route::prefix('messages')->group(function () {
        Route::post('/send', [MessengerController::class, 'send']);
        Route::post('/read', [MessengerController::class, 'markAsRead']);
        Route::get('/conversation/{conversationId}', [MessengerController::class, 'getMessages']);
        Route::get('/recent-conversations', [MessengerController::class, 'getRecentConversations']);
        Route::get('/{id}', [MessengerController::class, 'getMessage']);
        Route::delete('/{id}', [MessengerController::class, 'delete']);
        Route::post('/upload', [MessengerController::class, 'uploadFiles']);
        Route::get('/search/{conversationId}', [MessengerController::class, 'search']);
        Route::get('/conversations/{conversationId}/messages/search', [MessengerController::class, 'searchMessages']);
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
        Route::get('/message/count', [ConversationController::class, 'new_message_count']);
        Route::post('/archive/{id}', [MessengerController::class, 'archive']);
        Route::get('/getNickname/{conversationId}', [ConversationController::class, 'getNicknames']);
        Route::post('/updateNickname/{conversationId}/{userid}', [ConversationController::class, 'updateNickname']);
        Route::get('/getMembers/{conversationId}', [ConversationController::class, 'getMembers']);
    });
    //image
    Route::prefix('images')->group(function () {
        Route::get('/user', [CloudinaryController::class, 'getImagesByUserId']);

        Route::get('/user/{userId}/type/{type}', [CloudinaryController::class, 'getImagesByType']);

        Route::get('/{imageId}', [CloudinaryController::class, 'getImageById']);

        Route::post('/upload-avatar', [CloudinaryController::class, 'uploadAvatar']);

        Route::post('/bulk-upload', [CloudinaryController::class, 'bulkUpload']);

        Route::delete('/{imageId}', [CloudinaryController::class, 'deleteImage']);

        Route::put('/{imageId}', [CloudinaryController::class, 'updateImage']);

        Route::get('/users/{id}/photos', [ImageController::class, 'getAllPhotos']);   
        Route::get('/users/{id}/albums', [ImageController::class, 'getAlbums']);    
        Route::get('/users/{id}/album/{folder}', [ImageController::class, 'getAlbumImages']);
    });

    //notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'getNotifications']);
        Route::post('/read/{id}', [NotificationController::class, 'markAsRead']);
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'deleteNotification']);
    });

    Route::prefix('chat-groups')->group(function () {});

    //Cổng thanh toán
    Route::prefix('pay')->group(function () {
        Route::post('/create-bill', [BillController::class, 'create_bill']);
        Route::get('/get-bill', [UserBillController::class, 'get_bill']);
        Route::get('/get-history', [UserBillController::class, 'get_history']);
        Route::post('/create_api_bill', [PaymentController::class, 'create_api_bill']);
        Route::get('/get_info', [UserBillController::class, 'get_info']);
    });

    //report
    Route::prefix('report')->group(function () {
        Route::post('/{type}/{id}', [ReportController::class, 'report']);
        Route::get('/get-reasons/{type}', [ReportController::class, 'getReasons']);
    });

    Route::prefix('cloudinary')->group(function () {
        Route::post('/upload', [CloudinaryController::class, 'upload']);
        Route::post('/upload-post', [CloudinaryController::class, 'uploadFiles']);
        Route::delete('/delete-post', [CloudinaryController::class, 'deleteFiles']);
        Route::post('/upload-image-fanpage', [CloudinaryController::class, 'uploadImageFanpage']);
    });

    Route::prefix('settings')->group(function () {
        Route::get('/get-info', [ProfileController::class, 'getSettingsInfoUser']);
        Route::post('/contact-us', [ContactController::class, 'send']);
    });

   Route::prefix('pages')->group(function () {
        Route::get('/', [PageController::class, 'index']);
        Route::post('/create', [PageController::class, 'store']); 
        Route::post('{page}/follow', [PageController::class, 'follow']); 
        Route::post('{page}/unfollow', [PageController::class, 'unfollow']); 
        Route::post('{page}/admins', [PageController::class, 'addAdmin']);
        Route::get('{slug}/detail', [PageController::class, 'show']);
    });
});
