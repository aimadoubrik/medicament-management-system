<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBatchRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Changed to true to allow the request
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'batch_number' => 'required|string|unique:batches',
            'medicine_id' => 'required|exists:medicines,id',
            'supplier_id' => 'required|exists:suppliers,id',
            'quantity_received' => 'required|integer|min:1',
            'current_quantity' => 'required|integer|min:0',
            'manufacture_date' => 'required|date|before:expiry_date',
            'expiry_date' => 'required|date|after:manufacture_date',
        ];
    }
}
