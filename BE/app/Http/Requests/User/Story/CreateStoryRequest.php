<?php

namespace App\Http\Requests\User\Story;

use Illuminate\Foundation\Http\FormRequest;

class CreateStoryRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'expires_at' => 'required|date|after:now',
            'items' => 'required|array|min:1',
            'items.*.type' => 'required|in:image,video,text,image_with_text,video_with_text',
            'items.*.file_url' => 'nullable|string',
            'items.*.text' => 'nullable|string',
            'items.*.text_position' => 'nullable|array',
            'items.*.text_style' => 'nullable|array',
            'items.*.background' => 'nullable|string',
        ];
    }
}
