<?php

namespace App\Services;

use App\Models\UserProfile;
use App\Models\User;
use App\Models\Post;
use App\Models\Image;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Models\Friendship;
use Illuminate\Support\Facades\Cache;

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
            $user = Cache::remember("user_profile_{$username}", 60, function () use ($username) {
                return User::with(['profile' => function ($q) {
                    $q->select([
                        'id',
                        'user_id',
                        'phone_number',
                        'is_phone_number_visible',
                        'location',
                        'is_location_visible',
                        'workplace',
                        'is_workplace_visible',
                        'current_school',
                        'is_school_visible',
                        'past_school',
                        'is_past_school_visible',
                        'relationship_status',
                        'is_relationship_status_visible',
                        'created_at',
                        'updated_at',
                    ]);
                }])
                    ->select([
                        'id',
                        'username',
                        'email',
                        'first_name',
                        'last_name',
                        'gender',
                        'avatar',
                        'cover_photo',
                        'birthday',
                        'bio',
                        'status',
                        'created_at',
                        'updated_at',
                    ])
                    ->where('username', $username)
                    ->firstOrFail();
            });

            $profileData = [];

            if ($user->profile) {
                $profile = $user->profile;

                $profileData = [
                    'id' => $profile->id,
                    'user_id' => $profile->user_id,
                    'phone_number' => $profile->is_phone_number_visible ? $profile->phone_number : null,
                    'location' => $profile->is_location_visible ? $profile->location : null,
                    'workplace' => $profile->is_workplace_visible ? $profile->workplace : null,
                    'current_school' => $profile->is_school_visible ? $profile->current_school : null,
                    'past_school' => $profile->is_past_school_visible ? $profile->past_school : null,
                    'relationship_status' => $profile->is_relationship_status_visible ? $profile->relationship_status : null,
                    'is_phone_number_visible' => $profile->is_phone_number_visible,
                    'is_location_visible' => $profile->is_location_visible,
                    'is_workplace_visible' => $profile->is_workplace_visible,
                    'is_school_visible' => $profile->is_school_visible,
                    'is_past_school_visible' => $profile->is_past_school_visible,
                    'is_relationship_status_visible' => $profile->is_relationship_status_visible,
                    'created_at' => $profile->created_at,
                    'updated_at' => $profile->updated_at,
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
                    'cover_photo' => $user->cover_photo,
                    'birthday' => $user->birthday,
                    'bio' => $user->bio,
                    'status' => $user->status,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ],
                'profile' => $profileData
            ];
        } catch (ModelNotFoundException $e) {
            Log::warning("User with username '{$username}' not found.");
            return null;
        } catch (\Exception $e) {
            Log::error('getProfileByUsername error: ' . $e->getMessage());
            throw $e;
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

    public function updateAvatar($userId, $avatarUrl, $id)
    {
        $user = User::findOrFail($userId);
        $user->avatar = $avatarUrl;
        $user->save();

        Post::create(
            [
                'user_id' => $user->id,
                'post_id' => Str::uuid(),
                'type' => 'first',
                'images' => $user->avatar,
                'post_format' => 'avatar',
                'visibility' => 'public',
            ]
        );

        Image::where('id', $id)->update(
            [
                'url' => $user->avatar,
                'type' => 'image',
                'folder' => 'avatars',
            ]
        );

        return $user->avatar;
    }
    public function updateBackground($userId, $backgroundUrl, $id)
    {
        $user = User::findOrFail($userId);
        $user->cover_photo = $backgroundUrl;
        $user->save();

        Post::create(
            [
                'user_id' => $user->id,
                'post_id' => Str::uuid(),
                'type' => 'first',
                'images' => $user->cover_photo,
                'post_format' => 'cover_photo',
                'visibility' => 'public',
            ]
        );

        Image::where('id', $id)->update(
            [
                'url' => $user->cover_photo,
                'type' => 'image',
                'folder' => 'cover_photos',
            ]
        );

        return $user->cover_photo;
    }

    public function getSettingsInfoUser($userId)
    {
        $user = User::where('id', $userId)
            ->select(['id', 'username', 'email', 'first_name', 'last_name', 'avatar', 'birthday', 'gender'])
            ->first();
        if ($user->profile) {
            $user->phonenumber = $user->profile->phone_number;
            unset($user->profile);
        }

        return $user;
    }
}
