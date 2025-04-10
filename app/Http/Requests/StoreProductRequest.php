<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
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
            'generic_name' => 'required|string|max:255',
            'manufacturer' => 'required|string|max:255',
            'strength' => 'required|string|max:255',
            'form' => 'required|string|max:255',
            'description' => 'nullable|string',
            'requires_prescription' => 'required|boolean',
            'low_stock_threshold' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
        ];
    }
}
