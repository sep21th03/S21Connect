<?php

namespace App\Http\Requests\User\Post;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'post_id' => 'required|string|exists:posts,post_id',
            'content' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'url',
            'videos' => 'nullable|array',
            'videos.*' => 'url',
            'visibility' => 'required|in:public,friends,private',
            'tagfriends' => 'nullable|array',
            'bg_id' => 'nullable|string',
            'feeling' => 'nullable|string',
            'checkin' => 'nullable|string',
            'is_comment_disabled' => 'nullable|boolean',
        ];
    }

    public function messages()
    {
        return [
            'id.required' => 'ID không hợp lệ.',
            'id.exists' => 'ID không tồn tại.',
            'content.string' => 'Nội dung không hợp lệ.',
            'images.array' => 'Ảnh không hợp lệ.',
            'images.*.url' => 'Ảnh không hợp lệ.',
            'videos.array' => 'Video không hợp lệ.',
            'videos.*.url' => 'Video không hợp lệ.',
            'visibility.required' => 'Vui lòng chọn quyền riêng tư.',
            'visibility.in' => 'Quyền riêng tư không hợp lệ.'
        ];
    }
}
