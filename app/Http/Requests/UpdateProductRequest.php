<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Change to true to allow authenticated users
    }

    public function rules(): array
    {
        return [
            'name' => 'string|max:255',
            'generic_name' => 'string|max:255',
            'manufacturer' => 'string|max:255',
            'strength' => 'string|max:255',
            'form' => 'string|max:255',
            'description' => 'nullable|string',
            'requires_prescription' => 'boolean',
            'low_stock_threshold' => 'integer|min:0',
            'category_id' => 'exists:categories,id'
        ];
    }
}
