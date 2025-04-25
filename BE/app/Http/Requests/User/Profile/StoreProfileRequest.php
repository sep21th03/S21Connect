<?php

namespace App\Http\Requests\User\Profile;

use Illuminate\Foundation\Http\FormRequest;

class StoreProfileRequest extends FormRequest
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

            'phone_number' => 'nullable|string|max:20',
            'location' => 'nullable|string|max:255',
            'workplace' => 'nullable|string|max:255',
            'current_school' => 'nullable|string|max:255',
            'past_school' => 'nullable|string|max:255',
            'relationship_status' => 'nullable|in:single,in_a_relationship,engaged,married,complicated,separated,divorced,widowed',
        ];
    }

    public function messages()
    {
        return [
            'phone_number.max' => 'Số điện thoại không được vượt quá 20 ký tự.',
            'location.max' => 'Địa chỉ không được vượt quá 255 ký tự.',
            'workplace.max' => 'Công việc không được vượt quá 255 ký tự.',
            
        ];
    }
}
