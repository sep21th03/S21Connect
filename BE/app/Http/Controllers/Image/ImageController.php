<?php

namespace App\Http\Controllers\Image;

use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;

class ImageController extends Controller
{
    public function getAlbums($userId)
    {
        $albums = Image::where('user_id', $userId)
            ->selectRaw('folder, COUNT(*) as count, MAX(created_at) as latest')
            ->groupBy('folder')
            ->get()
            ->map(function ($album) use ($userId) {
                $thumbnail = Image::where('user_id', $userId)
                    ->where('folder', $album->folder)
                    ->orderByDesc('created_at')
                    ->first();

                return [
                    'folder' => $album->folder,
                    'count' => $album->count,
                    'latest' => $album->latest,
                    'thumbnail' => $thumbnail?->url,
                ];
            });

        return response()->json($albums);
    }

    public function getAlbumImages($userId, $folder)
    {
        $decodedFolder = urldecode($folder);
        $images = Image::where('user_id', $userId)
            ->where('folder', $decodedFolder)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($images);
    }

    public function getAllPhotos($userId)
    {
        $images = Image::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($images);
    }
}
