<?php

namespace App\Http\Requests\User\Post;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
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
            'content' => 'nullable|string',
            'media' => 'nullable|array',
            'media.*.url' => 'required|url',
            'media.*.public_id' => 'required|string',
            'media.*.type' => 'required|in:image,video',
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
            'content.string' => 'Nội dung không hợp lệ.',
            'visibility.required' => 'Vui lòng chọn quyền riêng tư.',
            'visibility.in' => 'Quyền riêng tư không hợp lệ.'
        ];
    }
}
