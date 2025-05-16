<?php

namespace App\Services;

use App\Models\UserProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Models\Friendship;

class ProfileService
{
    public function getProfile($userId)
    {
        try {
            return User::with('profile')->findOrFail($userId);
        } catch (ModelNotFoundException $e) {
            return null;
        }
    }

    public function getProfileAbout($userId)
    {
        try {
            $user = User::with('profile')->findOrFail($userId);
            $following = Friendship::where('user_id', $userId)->count();

            $followers = Friendship::where('friend_id', $userId)->count();

            $friends = Friendship::where('status', 'accepted')
                ->where(function ($query) use ($userId) {
                    $query->where('user_id', $userId)
                        ->orWhere('friend_id', $userId);
                })
                ->get();

            $uniqueFriendPairs = $friends->map(function ($friend) {
                $ids = [$friend->user_id, $friend->friend_id];
                sort($ids);
                return implode('-', $ids);
            })->unique();

            $friendCount = $uniqueFriendPairs->count();

            return [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'bio' => $user->bio,
                'avatar' => $user->avatar,
                'user_data' => [
                    'following' => $following,
                    'followers' => $followers,
                    'friends' => $friendCount,
                ]
            ];
        } catch (ModelNotFoundException $e) {
            return null;
        }
    }

    public function getProfileByUsername($username)
    {
        try {
            $user = User::with('profile')->where('username', $username)->firstOrFail();

            $profileData = [];
            if ($user->profile) {
                $profileData = [
                    'id' => $user->profile->id,
                    'user_id' => $user->profile->user_id,
                    'phone_number' => $user->profile->is_phone_number_visible ? $user->profile->phone_number : null,
                    'location' => $user->profile->is_location_visible ? $user->profile->location : null,
                    'workplace' => $user->profile->is_workplace_visible ? $user->profile->workplace : null,
                    'current_school' => $user->profile->is_school_visible ? $user->profile->current_school : null,
                    'past_school' => $user->profile->is_past_school_visible ? $user->profile->past_school : null,
                    'relationship_status' => $user->profile->is_relationship_status_visible ? $user->profile->relationship_status : null,
                    'is_phone_number_visible' => $user->profile->is_phone_number_visible,
                    'is_location_visible' => $user->profile->is_location_visible,
                    'is_workplace_visible' => $user->profile->is_workplace_visible,
                    'is_school_visible' => $user->profile->is_school_visible,
                    'is_past_school_visible' => $user->profile->is_past_school_visible,
                    'is_relationship_status_visible' => $user->profile->is_relationship_status_visible,
                    'created_at' => $user->profile->created_at,
                    'updated_at' => $user->profile->updated_at,
                ];
            }

            return [
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'gender' => $user->gender,
                    'avatar' => $user->avatar,
                    'cover_image' => $user->cover_image,
                    'birthday' => $user->birthday,
                    'bio' => $user->bio,
                    'status' => $user->status,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ],
                'profile' => $profileData
            ];
        } catch (ModelNotFoundException $e) {
            return null;
        }
    }

    public function updateProfile($userId, array $data)
    {
        try {
            DB::beginTransaction();

            $profile = UserProfile::where('user_id', $userId)->firstOrFail();

            $profile->update([
                'phone_number' => $data['phone_number'] ?? $profile->phone_number,
                'location' => $data['location'] ?? $profile->location,
                'workplace' => $data['workplace'] ?? $profile->workplace,
                'current_school' => $data['current_school'] ?? $profile->current_school,
                'past_school' => $data['past_school'] ?? $profile->past_school,
                'relationship_status' => $data['relationship_status'] ?? $profile->relationship_status,
                'is_phone_number_visible' => $data['is_phone_number_visible'] ?? $profile->is_phone_number_visible,
                'is_location_visible' => $data['is_location_visible'] ?? $profile->is_location_visible,
                'is_workplace_visible' => $data['is_workplace_visible'] ?? $profile->is_workplace_visible,
                'is_school_visible' => $data['is_school_visible'] ?? $profile->is_school_visible,
                'is_past_school_visible' => $data['is_past_school_visible'] ?? $profile->is_past_school_visible,
                'is_relationship_status_visible' => $data['is_relationship_status_visible'] ?? $profile->is_relationship_status_visible,
            ]);

            DB::commit();
            return $profile;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Profile update failed: ' . $e->getMessage());
            throw $e;
        }
    }

    public function createProfile($userId, array $data)
    {
        try {
            DB::beginTransaction();

            $profile = UserProfile::create([
                'user_id' => $userId,
                'phone_number' => $data['phone_number'] ?? null,
                'location' => $data['location'] ?? null,
                'workplace' => $data['workplace'] ?? null,
                'current_school' => $data['current_school'] ?? null,
                'past_school' => $data['past_school'] ?? null,
                'relationship_status' => $data['relationship_status'] ?? null,
            ]);

            DB::commit();
            return $profile;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Profile creation failed: ' . $e->getMessage());
            throw $e;
        }
    }


    public function updateProfileAbout($userId, array $data)
    {
        try {
            return DB::transaction(function () use ($userId, $data) {
                $profile = UserProfile::where('user_id', $userId)->firstOrFail();
                $user = User::where('id', $userId)->firstOrFail();

                $profile->update([
                    'phone_number' => $data['phone_number'] ?? $profile->phone_number,
                    'location' => $data['location'] ?? $profile->location,
                    'workplace' => $data['workplace'] ?? $profile->workplace,
                    'current_school' => $data['current_school'] ?? $profile->current_school,
                    'past_school' => $data['past_school'] ?? $profile->past_school,
                    'relationship_status' => $data['relationship_status'] ?? $profile->relationship_status,
                ]);

                $user->update([
                    'bio' => $data['bio'],
                    'birthday' => $data['birthday'],
                    'gender' => $data['gender'],
                ]);

                return [
                    'user' => $user->fresh(),
                    'profile' => $profile->fresh()
                ];
            });
        } catch (\Exception $e) {
            Log::error('Profile update failed: ' . $e->getMessage());
            throw $e;
        }
    }

    public function updateAvatar($userId, $avatarUrl)
    {
        try {
            $user = User::findOrFail($userId);
            $user->avatar = $avatarUrl;
            $user->save();

            return $user;
        } catch (\Exception $e) {
            Log::error('Avatar update failed: ' . $e->getMessage());
            throw $e;
        }
    }
}
