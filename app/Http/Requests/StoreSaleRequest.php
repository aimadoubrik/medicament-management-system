<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSaleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Change to true to allow authenticated users
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:users,id',
            'customer_name' => 'required|string|max:255',
            'total_amount' => 'required|numeric|min:0',
            'sale_date' => 'required|date',
            'payment_method' => 'required|string|max:255',
            'prescription_reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'sale_items' => 'required|array|min:1', // Assuming you'll send sale items
            'sale_items.*.product_id' => 'required|exists:products,id',
            'sale_items.*.quantity' => 'required|integer|min:1',
            'sale_items.*.price' => 'required|numeric|min:0'
        ];
    }
}
