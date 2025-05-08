<?php

namespace App\Http\Requests\User\Messenger;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessengerRequest extends FormRequest
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
            'receiver_id' => 'nullable|uuid',
            'group_id' => 'nullable|uuid',
            'content' => 'nullable|string',
            'type' => 'required|in:text,image,video,sticker,file',
            'file_paths' => 'nullable|string',
        ];
    }

    public function messages()
    {
        return [
            'receiver_id.uuid' => 'Người nhận không hợp lệ',
            'group_id.uuid' => 'Nhóm không hợp lệ',
            'content.string' => 'Nội dung không hợp lệ',
            'type.required' => 'Loại tin nhắn là bắt buộc',
            'type.in' => 'Loại tin nhắn không hợp lệ',
            'file_paths.string' => 'Đường dẫn tệp không hợp lệ',
        ];
    }
}
