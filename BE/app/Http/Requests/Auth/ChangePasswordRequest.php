<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ChangePasswordRequest extends FormRequest
{
    public function authorize()
    {
        return true; // Hoặc kiểm tra quyền nếu cần
    }

    public function rules()
    {
        return [
            'current_password' => ['required'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed', 'different:current_password', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).+$/',],
        ];
    }

    public function messages()
    {
        return [
            'current_password.required' => 'Vui lòng nhập mật khẩu hiện tại.',
            'new_password.required' => 'Vui lòng nhập mật khẩu mới.',
            'new_password.min' => 'Mật khẩu mới phải có ít nhất 8 ký tự.',
            'new_password.confirmed' => 'Xác nhận mật khẩu không khớp.',
            'new_password.different' => 'Mật khẩu mới phải khác mật khẩu hiện tại.',
            'new_password.regex' => 'Mật khẩu mới phải chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường, một số hoặc ký tự đặc biệt.',
        ];
    }
}
