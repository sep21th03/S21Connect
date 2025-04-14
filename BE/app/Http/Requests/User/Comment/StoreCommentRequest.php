<?php

namespace App\Http\Requests\User\Comment;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommentRequest extends FormRequest
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
            'post_id' => 'required|exists:posts,id',
            'content' => 'nullable|string',
        ];
    }

    public function messages()
    {
        return [
            'post_id.required' => 'Bài viết không tồn tại.',
            'post_id.exists' => 'Bài viết không tồn tại.',
            'content.string' => 'Nội dung không hợp lệ.',
        ];
    }
}
