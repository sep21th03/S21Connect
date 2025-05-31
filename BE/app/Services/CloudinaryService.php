<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Cloudinary\Transformation\Transformation;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Api\Admin\AdminApi;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Cloudinary\Configuration\Configuration;

class CloudinaryService
{
    protected Cloudinary $cloudinary;
    protected $uploadApi;
    protected $adminApi;
    public function __construct()
    {
        $config = Configuration::instance([
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                'api_key'    => env('CLOUDINARY_API_KEY'),
                'api_secret' => env('CLOUDINARY_API_SECRET'),
            ],
            'url' => [
                'secure' => true
            ]
        ]);

        $this->uploadApi = new UploadApi($config);
        $this->adminApi = new AdminApi($config);
    }

    public function uploadImage(string $filePath, string $folder = 'images')
    {
        $uploadOptions = [
            'folder' => $folder,
            'resource_type' => 'image',
        ];

        $uploadResult = $this->cloudinary->uploadApi()->upload($filePath, $uploadOptions);

        return $uploadResult;
    }

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

        if ($muted) {
            $transformationString = 'audio_codec:none';
        }

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
                    if ($muted) {
                        $transformationString .= "/l_audio:audio_tracks:$audioPublicId,fl_layer_apply,audio_codec:aac";
                    } else {
                        $transformationString = "l_audio:audio_tracks:$audioPublicId,fl_layer_apply,audio_codec:aac";
                    }
                }
            }
        }

        if (empty($transformationString)) {
            return $uploadResult;
        }

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

    public function uploadFile(UploadedFile $file, string $resourceType = 'auto', array $options = []): ?array
    {
        try {
            $defaultOptions = [
                'resource_type' => $resourceType,
                'quality' => 'auto',
                'fetch_format' => 'auto',
            ];

            if ($resourceType === 'video') {
                $defaultOptions = array_merge($defaultOptions, [
                    'video_codec' => 'auto',
                    'quality' => 'auto:good',
                ]);
            }

            $uploadOptions = array_merge($defaultOptions, $options);

            // Sử dụng $this->uploadApi thay vì $this->uploadApi
            $result = $this->uploadApi->upload($file->getRealPath(), $uploadOptions);

            return $result->getIterator()->getArrayCopy();
        } catch (\Exception $e) {
            \Log::error('Cloudinary upload error: ' . $e->getMessage());
            return null;
        }
    }


    public function uploadFromUrl(string $url, string $resourceType = 'auto', array $options = []): ?array
    {
        try {
            $uploadOptions = array_merge([
                'resource_type' => $resourceType,
                'quality' => 'auto',
                'fetch_format' => 'auto',
            ], $options);

            $result = $this->uploadApi->upload($url, $uploadOptions);

            return $result;
        } catch (\Exception $e) {
            \Log::error('Cloudinary URL upload error: ' . $e->getMessage());
            return null;
        }
    }

    public function deleteFile(string $publicId, string $resourceType = 'image'): ?array
    {
        try {
            $result = $this->uploadApi->destroy($publicId, [
                'resource_type' => $resourceType
            ]);

            return $result;
        } catch (\Exception $e) {
            \Log::error('Cloudinary delete error: ' . $e->getMessage());
            return null;
        }
    }

    public function deleteMultipleFiles(array $publicIds, string $resourceType = 'image'): ?array
    {
        try {
            $result = $this->adminApi->deleteAssets($publicIds, [
                'resource_type' => $resourceType
            ]);

            return $result;
        } catch (\Exception $e) {
            \Log::error('Cloudinary bulk delete error: ' . $e->getMessage());
            return null;
        }
    }

    public function getTransformationUrl(string $publicId, array $transformations = [], string $resourceType = 'image'): string
    {
        try {
            $options = array_merge([
                'resource_type' => $resourceType,
                'secure' => true,
            ], $transformations);

            return $this->cloudinary->image($publicId)->toUrl($options);
        } catch (\Exception $e) {
            \Log::error('Cloudinary transformation error: ' . $e->getMessage());
            return '';
        }
    }

    public function getFileInfo(string $publicId, string $resourceType = 'image'): ?array
    {
        try {
            $result = $this->adminApi->asset($publicId, [
                'resource_type' => $resourceType
            ]);

            return $result;
        } catch (\Exception $e) {
            \Log::error('Cloudinary get info error: ' . $e->getMessage());
            return null;
        }
    }
}
