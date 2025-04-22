<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBatchRequest extends FormRequest
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
            'batch_number' => 'sometimes|string|max:255',
            'medicine_id' => 'sometimes|exists:medicines,id',
            'supplier_id' => 'sometimes|exists:suppliers,id',
            'quantity_received' => 'sometimes|integer|min:0',
            'current_quantity' => 'sometimes|integer|min:0',
            'manufacture_date' => 'sometimes|date|before_or_equal:today',
            'expiry_date' => 'sometimes|date|after:manufacture_date',
        ];
    }
}
