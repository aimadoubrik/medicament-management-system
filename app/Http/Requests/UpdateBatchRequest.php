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
            'quantity_received' => 'sometimes|numeric|min:0',
            'current_quantity' => 'sometimes|numeric|min:0',
            'cost_price' => 'sometimes|numeric|min:0',
            'selling_price' => 'sometimes|numeric|min:0',
            'manufacture_date' => 'sometimes|date',
            'expiry_date' => 'sometimes|date|after:manufacture_date',
        ];
    }
}
