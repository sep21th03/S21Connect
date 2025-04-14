<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class RegisterRequest extends FormRequest
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
            'username'   => 'required|string|max:50|unique:users,username',
            'email'      => 'required|email|unique:users,email',
            'password'   => 'required|min:8|confirmed', 
            'first_name' => 'required|string|max:50',
            'last_name'  => 'required|string|max:50',
        ];
    }

    public function messages()
    {
        return [
            'username.required'  => 'Vui lòng nhập tên người dùng.',
            'username.unique'    => 'Tên người dùng đã tồn tại.',
            'email.required'     => 'Vui lòng nhập email.',
            'email.email'        => 'Email không hợp lệ.',
            'email.unique'       => 'Email đã tồn tại.',
            'password.required'  => 'Vui lòng nhập mật khẩu.',
            'password.min'       => 'Mật khẩu phải có ít nhất 8 ký tự.',
            'password.confirmed' => 'Mật khẩu xác nhận không khớp.',
            'first_name.required'=> 'Vui lòng nhập họ.',
            'last_name.required' => 'Vui lòng nhập tên.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        $errors = $validator->errors()->all();

        throw new HttpResponseException(response()->json(['errors' => $errors], 422));
    }

}
