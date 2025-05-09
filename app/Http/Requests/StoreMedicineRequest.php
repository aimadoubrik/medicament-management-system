<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMedicineRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Changed to true to allow authenticated users
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'manufacturer_distributor' => 'required|string|max:255',
            'dosage' => 'required|string|max:255',
            'form' => 'required|string|max:255',
            'unit_of_measure' => 'required|string|max:255',
            'reorder_level' => 'required|numeric|integer|min:0',
            'description' => 'nullable|string',
        ];
    }
}
