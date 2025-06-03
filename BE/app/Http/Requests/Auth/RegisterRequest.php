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
            'gender'      => 'required|in:male,female,other',
            'birthday'    => 'nullable|date_format:Y-m-d|before:today',
        ];
    }

    public function messages()
    {
        return [
            'username.required'     => 'Vui lòng nhập tên người dùng.',
            'username.string'       => 'Tên người dùng phải là chuỗi.',
            'username.max'          => 'Tên người dùng không được vượt quá 50 ký tự.',
            'username.unique'       => 'Tên người dùng đã tồn tại.',

            'email.required'        => 'Vui lòng nhập email.',
            'email.email'           => 'Email không hợp lệ.',
            'email.max'             => 'Email không được vượt quá 100 ký tự.',
            'email.unique'          => 'Email đã được sử dụng.',

            'password.required'     => 'Vui lòng nhập mật khẩu.',
            'password.string'       => 'Mật khẩu phải là chuỗi.',
            'password.min'          => 'Mật khẩu phải có ít nhất 8 ký tự.',
            'password.confirmed'    => 'Mật khẩu xác nhận không khớp.',

            'first_name.required'   => 'Vui lòng nhập họ.',
            'first_name.string'     => 'Họ phải là chuỗi.',
            'first_name.max'        => 'Họ không được vượt quá 50 ký tự.',

            'last_name.required'    => 'Vui lòng nhập tên.',
            'last_name.string'      => 'Tên phải là chuỗi.',
            'last_name.max'         => 'Tên không được vượt quá 50 ký tự.',

            'gender.required'       => 'Vui lòng chọn giới tính.',
            'gender.in'             => 'Giới tính không hợp lệ. Vui lòng chọn nam, nữ hoặc khác.',

            'birthday.date_format'  => 'Ngày sinh không đúng định dạng (Y-m-d).',
            'birthday.before'       => 'Ngày sinh phải nhỏ hơn ngày hiện tại.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        $errors = $validator->errors()->all();

        throw new HttpResponseException(response()->json(['errors' => $errors], 422));
    }
}
