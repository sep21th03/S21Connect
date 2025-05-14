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
            'id' => 'required|exists:posts,id',
            'content' => 'nullable|string',
            'parent_id' => 'nullable|exists:comments,id'
        ];
    }

    public function messages()
    {
        return [
            'id.required' => 'Bài viết không tồn tại.',
            'id.exists' => 'Bài viết không tồn tại.',
            'content.string' => 'Nội dung không hợp lệ.',
        ];
    }
}
