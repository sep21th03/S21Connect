<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Cloudinary\Transformation\Transformation;

class CloudinaryService
{
    protected Cloudinary $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                'api_key'    => env('CLOUDINARY_API_KEY'),
                'api_secret' => env('CLOUDINARY_API_SECRET'),
            ],
            'url' => [
                'secure' => true,
            ],
        ]);
    }

    // Upload ảnh
    public function uploadImage(string $filePath, string $folder = 'images')
    {
        $uploadOptions = [
            'folder' => $folder,
            'resource_type' => 'image',
        ];

        $uploadResult = $this->cloudinary->uploadApi()->upload($filePath, $uploadOptions);

        return $uploadResult;
    }

    // Upload video với audio overlay hoặc mute audio
    public function uploadVideoWithAudio(
        string $filePath,
        bool $muted = false,
        ?string $audioUrl = null,
        string $folder = 'stories'
    ): array {
        $uploadOptions = [
            'folder' => $folder,
            'resource_type' => 'video',
        ];

        $uploadResult = $this->cloudinary->uploadApi()->upload($filePath, $uploadOptions);

        $publicId = $uploadResult['public_id'] ?? null;
        $resourceType = $uploadResult['resource_type'] ?? null;

        if ($resourceType !== 'video' || !$publicId) {
            return $uploadResult;
        }

        $transformationString = '';

        // Nếu mute
        if ($muted) {
            $transformationString = 'audio_codec:none';
        }

        // Nếu chèn audio overlay
        if ($audioUrl) {
            $tempAudioPath = tempnam(sys_get_temp_dir(), 'audio_');
            $audioContent = file_get_contents($audioUrl);

            if ($audioContent !== false) {
                file_put_contents($tempAudioPath, $audioContent);

                $audioUploadResult = $this->cloudinary->uploadApi()->upload($tempAudioPath, [
                    'resource_type' => 'video',
                    'folder' => 'audio_tracks',
                ]);
                unlink($tempAudioPath);

                $audioPublicId = $audioUploadResult['public_id'] ?? null;

                if ($audioPublicId) {
                    // Nếu có mute, gộp thêm transformation overlay
                    if ($muted) {
                        $transformationString .= "/l_audio:audio_tracks:$audioPublicId,fl_layer_apply,audio_codec:aac";
                    } else {
                        $transformationString = "l_audio:audio_tracks:$audioPublicId,fl_layer_apply,audio_codec:aac";
                    }
                }
            }
        }

        // Nếu không có transformation nào thì trả về video gốc
        if (empty($transformationString)) {
            return $uploadResult;
        }

        // Áp dụng transformation
        $videoWithAudioUrl = $this->cloudinary
            ->video($publicId)
            ->addTransformation(['raw_transformation' => $transformationString])
            ->toUrl();

        return [
            'secure_url' => $videoWithAudioUrl,
            'public_id' => $publicId,
            'resource_type' => $resourceType,
            'duration' => $uploadResult['duration'] ?? null,
        ];
    }
}
