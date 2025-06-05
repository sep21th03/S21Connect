<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Cloudinary\Transformation\Transformation;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Api\Admin\AdminApi;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Cloudinary\Configuration\Configuration;
use App\Models\Image;
use Illuminate\Support\Str;

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
        $this->cloudinary = new Cloudinary($config);
        $this->uploadApi = new UploadApi($config);
        $this->adminApi = new AdminApi($config);
    }

    public function uploadImage(string $filePath): array
    {
        try {
            $uploadOptions = [
                'resource_type' => 'image',
            ];

            $uploadResult = $this->uploadApi->upload($filePath, $uploadOptions);

            return [
                'success' => true,
                'data' => [
                    'url' => $uploadResult['secure_url'],
                    'public_id' => $uploadResult['public_id'],
                    'width' => $uploadResult['width'] ?? null,
                    'height' => $uploadResult['height'] ?? null,
                    'folder' => $uploadResult['folder'] ?? null,
                ]
            ];
        } catch (\Exception $e) {
            \Log::error('Cloudinary upload error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
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


    // profile


    public function deleteImage(string $publicId): array
    {
        try {
            $result = $this->uploadApi->destroy($publicId);

            return [
                'success' => $result['result'] === 'ok',
                'result' => $result['result']
            ];
        } catch (\Exception $e) {
            Log::error('Cloudinary delete error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public function saveImageRecord(array $imageData, string $userId): Image
    {
        return Image::create([
            'id' => Str::uuid(),
            'user_id' => $userId,
            'url' => $imageData['url'],
            'type' => 'avatar',
            'folder' => 'album',
            'public_id' => $imageData['public_id'],
            'width' => $imageData['width'] ?? null,
            'height' => $imageData['height'] ?? null,
        ]);
    }



    public function uploadAndSave(UploadedFile $file, string $userId): array
    {
        try {
            $uploadResult = $this->uploadImage($file);

            if (!$uploadResult['success']) {
                \Log::error('Cloudinary upload failed:', [$uploadResult]);
                return $uploadResult;
            }

            $image = $this->saveImageRecord($uploadResult['data'], $userId);

            return [
                'success' => true,
                'data' => $image->toArray()
            ];
        } catch (\Exception $e) {
            \Log::error('Upload and save error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public function deleteImageCompletely(string $imageId): array
    {
        try {
            $image = Image::find($imageId);

            if (!$image) {
                return [
                    'success' => false,
                    'error' => 'Image not found'
                ];
            }

            $cloudinaryResult = $this->deleteImage($image->public_id);

            if ($cloudinaryResult['success']) {
                $image->delete();

                return [
                    'success' => true,
                    'message' => 'Image deleted successfully'
                ];
            }

            return $cloudinaryResult;
        } catch (\Exception $e) {
            Log::error('Complete delete error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    public function getImagesByUserId(string $userId, string $type = null): array
    {
        try {
            $query = Image::where('user_id', $userId);

            if ($type) {
                $query->where('type', $type);
            }

            $images = $query->orderBy('created_at', 'desc')->get();

            return [
                'success' => true,
                'data' => $images->toArray()
            ];
        } catch (\Exception $e) {
            Log::error('Get images error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    public function getTransformedUrl(string $publicId, array $transformations = []): string
    {
        try {
            $transformation = new Transformation();

            foreach ($transformations as $key => $value) {
                $transformation->$key($value);
            }

            return cloudinary_url($publicId, [
                'transformation' => $transformation,
                'secure' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Transformation error: ' . $e->getMessage());
            return '';
        }
    }
}
