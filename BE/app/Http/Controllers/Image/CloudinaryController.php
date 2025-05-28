<?php

namespace App\Http\Controllers\Image;

use Illuminate\Http\Request;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;

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

        // Kiểm tra data URI hợp lệ
        if (!preg_match('/^data:(\w+)\/(\w+);base64,/', $dataUri, $matches)) {
            return response()->json(['message' => 'File format không hợp lệ'], 422);
        }

        $mimeType = $matches[1];      // vd: image hoặc video
        $extension = $matches[2];     // vd: png, jpeg, mp4

        $base64String = preg_replace('/^data:\w+\/\w+;base64,/', '', $dataUri);
        $fileContent = base64_decode($base64String);

        $maxFileSize = 30 * 1024 * 1024; // 30MB
        if (strlen($fileContent) > $maxFileSize) {
            return response()->json([
                'message' => 'Tệp quá lớn, tối đa 30MB',
            ], 422);
        }

        // Tạo file tạm với đuôi file phù hợp
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
}
