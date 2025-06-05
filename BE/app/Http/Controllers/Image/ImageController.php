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
    /**
     * Lưu thông tin ảnh vào database
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|url',
            'public_id' => 'required|string',
            'folder' => 'nullable|string',
            'type' => 'nullable|string',
            'width' => 'nullable|integer',
            'height' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $cloudinaryData = $this->parseCloudinaryUrl($request->url);
            
            $image = new Image();
            $image->id = Str::uuid();
            $image->user_id = Auth::id();
            $image->url = $request->url;
            $image->public_id = $request->public_id;
            $image->folder = $cloudinaryData['folder'] ?? $request->folder;
            $image->type = $cloudinaryData['type'] ?? $request->type;
            $image->width = $request->width;
            $image->height = $request->height;
            $image->save();

            return response()->json([
                'success' => true,
                'message' => 'Image saved successfully',
                'data' => $image
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save image information',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Phân tích URL Cloudinary để lấy thông tin
     * 
     * @param string $url
     * @return array
     */
    private function parseCloudinaryUrl($url)
    {
        $data = [];
        
        if (preg_match('/\/avatars\/([^\/]+)\//', $url, $matches)) {
            $data['folder'] = '/avatars';
            $data['type'] = $matches[1];
        }
        
        return $data;
    }

    /**
     * Lấy danh sách ảnh của user hiện tại
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request)
    {
        $type = $request->query('type');
        $query = Image::where('user_id', Auth::id());
        
        if ($type) {
            $query->where('type', $type);
        }
        
        $images = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $images
        ]);
    }

    /**
     * Xóa ảnh từ database và Cloudinary
     * 
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $image = Image::where('id', $id)
                ->where('user_id', Auth::id())
                ->firstOrFail();
            $image->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Image deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete image',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}