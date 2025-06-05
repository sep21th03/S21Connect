<?php

namespace App\Http\Controllers\Image;

use Illuminate\Http\Request;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;


class CloudinaryController extends ImageController
{
    public function __construct(protected CloudinaryService $cloudinaryService) {}

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|string',
            'muted' => 'nullable|string',
            'audio_url' => 'nullable|string',
        ]);

        $dataUri = $request->input('file');

        if (!preg_match('/^data:(\w+)\/(\w+);base64,/', $dataUri, $matches)) {
            return response()->json(['message' => 'File format không hợp lệ'], 422);
        }

        $mimeType = $matches[1];
        $extension = $matches[2];

        $base64String = preg_replace('/^data:\w+\/\w+;base64,/', '', $dataUri);
        $fileContent = base64_decode($base64String);

        $maxFileSize = 30 * 1024 * 1024;
        if (strlen($fileContent) > $maxFileSize) {
            return response()->json([
                'message' => 'Tệp quá lớn, tối đa 30MB',
            ], 422);
        }

        $tempPath = tempnam(sys_get_temp_dir(), 'upload_') . '.' . $extension;
        file_put_contents($tempPath, $fileContent);

        if ($mimeType === 'video') {
            $muted = filter_var($request->input('muted'), FILTER_VALIDATE_BOOLEAN);
            $audioUrl = $request->input('audio_url');

            $result = $this->cloudinaryService->uploadVideoWithAudio($tempPath, $muted, $audioUrl);
        } else if ($mimeType === 'image') {
            $result = $this->cloudinaryService->uploadImage($tempPath);
        } else {
            unlink($tempPath);
            return response()->json(['message' => 'Chỉ hỗ trợ upload file ảnh hoặc video'], 422);
        }

        unlink($tempPath);

        return response()->json([
            'message' => 'Uploaded successfully',
            'url' => $result['secure_url'] ?? null,
            'resource_type' => $result['resource_type'] ?? null,
            'duration' => $result['duration'] ?? null,
        ]);
    }

    public function uploadFiles(Request $request): JsonResponse
    {
        try {

            $validator = Validator::make($request->all(), [
                'files' => 'required|array|max:10',
                'files.*' => 'file|mimes:jpg,jpeg,png,gif,mp4,mov,avi,wmv,flv,webm,webp|max:50000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $files = $request->file('files');
            $uploadedUrls = [];
            $errors = [];

            foreach ($files as $index => $file) {
                try {
                    $mimeType = $file->getMimeType();
                    $resourceType = str_starts_with($mimeType, 'video/') ? 'video' : 'image';

                    \Log::info("Uploading file {$index}:", [
                        'mime_type' => $mimeType,
                        'resource_type' => $resourceType,
                        'size' => $file->getSize()
                    ]);

                    $result = $this->cloudinaryService->uploadFile(
                        $file,
                        $resourceType,
                        [
                            'folder' => 'posts/' . $resourceType,
                            'quality' => 'auto',
                            'fetch_format' => 'auto',
                        ]
                    );

                    if ($result && isset($result['secure_url'])) {
                        $uploadedUrls[] = [
                            'url' => $result['secure_url'],
                            'public_id' => $result['public_id'],
                            'resource_type' => $resourceType,
                            'format' => $result['format'] ?? null,
                            'width' => $result['width'] ?? null,
                            'height' => $result['height'] ?? null,
                            'duration' => $result['duration'] ?? null,
                        ];
                    } else {
                        $errors[] = "Tải lên file {$index} thất bại - Không có kết quả trả về hợp lệ";
                    }
                } catch (\Exception $e) {
                    \Log::error("Trả về thất bại: {$index}:", [
                        'message' => $e->getMessage(),
                        'file' => $e->getFile(),
                        'line' => $e->getLine()
                    ]);
                    $errors[] = "Error file {$index}: " . $e->getMessage();
                }
            }

            if (empty($uploadedUrls)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tải lên không thành công',
                    'errors' => $errors
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Tải lên thành công',
                'urls' => $uploadedUrls,
                'errors' => $errors
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Tải lên thất bại:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error: Tải lên không thành công',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteFiles(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'public_ids' => 'required|array',
                'public_ids.*' => 'string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $publicIds = $request->input('public_ids');
            $deletedIds = [];
            $errors = [];

            foreach ($publicIds as $publicId) {
                try {
                    $result = $this->cloudinaryService->deleteFile($publicId);
                    if ($result && $result['result'] === 'ok') {
                        $deletedIds[] = $publicId;
                    } else {
                        $errors[] = "Xóa thất bại: {$publicId}";
                    }
                } catch (\Exception $e) {
                    $errors[] = "Xóa thất bại {$publicId}: " . $e->getMessage();
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Xóa thành công',
                'deleted_ids' => $deletedIds,
                'errors' => $errors
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: Xóa không thành công',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    //profile
    public function getImagesByUserId(): JsonResponse
    {
        try {
            $userId = Auth::id() ?? request()->input('user_id');
            $result = $this->cloudinaryService->getImagesByUserId($userId);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'data' => $result['data'],
                    'message' => 'Images retrieved successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $result['error'] ?? 'Failed to retrieve images'
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function uploadAvatar(Request $request): JsonResponse
    {

        try {
            $validator = Validator::make($request->all(), [
                'file' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB
            ]);

            if ($validator->fails()) {
                \Log::error('Validation errors:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('file');
            $userId = Auth::id() ?? $request->input('user_id');

            if (!$userId) {
                \Log::error('User ID missing');
                return response()->json([
                    'success' => false,
                    'message' => 'User ID is required'
                ], 400);
            }

            $result = $this->cloudinaryService->uploadAndSave($file, $userId);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'data' => $result['data'],
                    'message' => 'Avatar uploaded successfully'
                ], 201);
            }

            \Log::error('Upload failed:', [$result['error'] ?? 'Unknown error']);
            return response()->json([
                'success' => false,
                'message' => $result['error'] ?? 'Failed to upload avatar'
            ], 400);
        } catch (\Exception $e) {
            \Log::error('Server error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteImage(string $imageId): JsonResponse
    {
        try {
            $result = $this->cloudinaryService->deleteImageCompletely($imageId);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => $result['message']
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $result['error'] ?? 'Failed to delete image'
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getImageById(string $imageId): JsonResponse
    {
        try {
            $image = \App\Models\Image::find($imageId);

            if (!$image) {
                return response()->json([
                    'success' => false,
                    'message' => 'Image not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $image->toArray(),
                'message' => 'Image retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }
    public function getImagesByType(Request $request, string $userId, string $type): JsonResponse
    {
        try {
            $result = $this->cloudinaryService->getImagesByUserId($userId, $type);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'data' => $result['data'],
                    'message' => 'Images retrieved successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $result['error'] ?? 'Failed to retrieve images'
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }
    public function bulkUpload(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'files' => 'required|array|max:10',
                'files.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
                'type' => 'sometimes|string|in:avatar,post,banner,gallery',
                'folder' => 'sometimes|string|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $files = $request->file('files');
            $userId = Auth::id() ?? $request->input('user_id');
            $type = $request->input('type', 'post');
            $folder = $request->input('folder');

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID is required'
                ], 400);
            }

            $results = [];
            $errors = [];

            foreach ($files as $index => $file) {
                $result = $this->cloudinaryService->uploadAndSave($file, $userId, $type, $folder);

                if ($result['success']) {
                    $results[] = $result['data'];
                } else {
                    $errors[] = [
                        'file_index' => $index,
                        'error' => $result['error']
                    ];
                }
            }

            return response()->json([
                'success' => count($results) > 0,
                'data' => $results,
                'errors' => $errors,
                'message' => count($results) . ' images uploaded successfully'
            ], count($results) > 0 ? 201 : 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }
}
