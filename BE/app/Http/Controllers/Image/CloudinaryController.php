<?php

namespace App\Http\Controllers\Image;

use Illuminate\Http\Request;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

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
}
