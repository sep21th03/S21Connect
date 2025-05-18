<?php

namespace App\Http\Controllers\User;

use App\Services\ProfileService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\User\Profile\StoreProfileRequest;
use App\Http\Controllers\Controller;

class ProfileController extends Controller
{
    protected $profileService;

    public function __construct(ProfileService $profileService)
    {
        $this->profileService = $profileService;
    }

    public function getMeProfile(): JsonResponse
    {
        try {
            $userId = Auth::id();
            $profile = $this->profileService->getProfile($userId);

            if (!$profile) {
                return response()->json([
                    'message' => 'Hồ sơ không tồn tại',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'message' => 'Lấy hồ sơ thành công',
                'data' => $profile
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi lấy hồ sơ',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getMeProfileAbout(): JsonResponse
    {
        try {
            $userId = Auth::id();
            $profile = $this->profileService->getProfileAbout($userId);

            if (!$profile) {
                return response()->json([
                    'message' => 'Hồ sơ không tồn tại',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'message' => 'Lấy hồ sơ thành công',
                'data' => $profile
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi lấy hồ sơ',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateMeProfile(Request $request): JsonResponse
    {
        try {
            $userId = Auth::id();
            $data = $request->validate([
                'phone_number' => 'nullable|string|max:20',
                'location' => 'nullable|string|max:255',
                'workplace' => 'nullable|string|max:255',
                'current_school' => 'nullable|string|max:255',
                'past_school' => 'nullable|string|max:255',
                'relationship_status' => 'nullable|in:single,in_a_relationship,engaged,married,complicated,separated,divorced,widowed',
                'is_phone_number_visible' => 'nullable',
                'is_location_visible' => 'nullable',
                'is_workplace_visible' => 'nullable',
                'is_school_visible' => 'nullable',
                'is_past_school_visible' => 'nullable',
                'is_relationship_status_visible' => 'nullable',
            ]);

            $profile = $this->profileService->updateProfile($userId, $data);

            return response()->json([
                'message' => 'Cập nhật hồ sơ thành công',
                'data' => $profile
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi cập nhật hồ sơ',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function createMeProfile(Request $request): JsonResponse
    {
        try {
            $userId = Auth::id();
            $data = $request->validate([
                'phone_number' => 'nullable|string|max:20',
                'location' => 'nullable|string|max:255',
                'workplace' => 'nullable|string|max:255',
                'current_school' => 'nullable|string|max:255',
                'past_school' => 'nullable|string|max:255',
                'relationship_status' => 'nullable|in:single,in_a_relationship,engaged,married,complicated,separated,divorced,widowed',
            ]);

            $profile = $this->profileService->createProfile($userId, $data);

            return response()->json([
                'message' => 'Tạo hồ sơ thành công',
                'data' => $profile
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi tạo hồ sơ',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUserProfile(string $username): JsonResponse
    {
        try {
            $profile = $this->profileService->getProfileByUsername($username);

            if (!$profile) {
                return response()->json([
                    'message' => 'Hồ sơ không tồn tại',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'message' => 'Lấy hồ sơ thành công',
                'data' => $profile
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi lấy hồ sơ',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateProfileAbout() {
        try {
            $userId = Auth::id();
            $data = request()->validate([
                'phone_number' => 'nullable|string|max:20',
                'location' => 'nullable|string|max:255',
                'workplace' => 'nullable|string|max:255',
                'current_school' => 'nullable|string|max:255',
                'past_school' => 'nullable|string|max:255',
                'relationship_status' => 'nullable|in:single,in_a_relationship,engaged,married,complicated,separated,divorced,widowed',
                'bio' => 'nullable|string|max:255',
                'birthday' => 'nullable|date_format:Y-m-d',
                'gender' => 'nullable',
            ]);

            $result = $this->profileService->updateProfileAbout($userId, $data);

            return response()->json([
                'message' => 'Cập nhật hồ sơ thành công',
                'data' => [
                    'user' => $result['user'],
                    'profile' => $result['profile'],
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi cập nhật hồ sơ',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateAvatar(Request $request): JsonResponse
    {
        try {
            $userId = Auth::id();
            $data = $request->validate([
                'avatar' => 'required|url',
            ]);

            $profile = $this->profileService->updateAvatar($userId, $data['avatar']);

            return response()->json([
                'message' => 'Cập nhật ảnh đại diện thành công',
                'data' => $profile
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi cập nhật ảnh đại diện',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
