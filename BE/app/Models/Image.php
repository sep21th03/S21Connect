<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Image extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'post_id',
        'url',
        'public_id',
        'folder',
        'type',
        'width',
        'height',
    ];

    protected $casts = [
        'width' => 'integer',
        'height' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }
    public function scopeForUser($query, string $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function getTransformedUrl(int $width = null, int $height = null, string $quality = 'auto'): string
    {
        if (!$width && !$height) {
            return $this->url;
        }

        $transformations = [];

        if ($width) {
            $transformations['width'] = $width;
        }

        if ($height) {
            $transformations['height'] = $height;
        }

        $transformations['quality'] = $quality;
        $transformations['crop'] = 'fill';

        $baseUrl = str_replace('/upload/', '/upload/', $this->url);
        $transformationString = '';

        foreach ($transformations as $key => $value) {
            $transformationString .= $key . '_' . $value . ',';
        }

        $transformationString = rtrim($transformationString, ',');

        return str_replace('/upload/', '/upload/' . $transformationString . '/', $this->url);
    }
    public function getThumbnailAttribute(): string
    {
        return $this->getTransformedUrl(300, 300);
    }
    public function existsOnCloudinary(): bool
    {
        try {
            $headers = get_headers($this->url, 1);
            return strpos($headers[0], '200') !== false;
        } catch (\Exception $e) {
            return false;
        }
    }
    public function getFileSizeAttribute(): string
    {

        return 'Unknown';
    }

    public function getAspectRatioAttribute(): ?float
    {
        if ($this->width && $this->height) {
            return round($this->width / $this->height, 2);
        }

        return null;
    }
    public function getIsLandscapeAttribute(): ?bool
    {
        if ($this->aspect_ratio) {
            return $this->aspect_ratio > 1;
        }

        return null;
    }
    public function getIsPortraitAttribute(): ?bool
    {
        if ($this->aspect_ratio) {
            return $this->aspect_ratio < 1;
        }

        return null;
    }
    public function getIsSquareAttribute(): ?bool
    {
        if ($this->aspect_ratio) {
            return $this->aspect_ratio == 1;
        }

        return null;
    }
}
