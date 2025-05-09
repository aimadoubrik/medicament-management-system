<?php

namespace App\Http\Requests;

use App\Models\Batch;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DispenseStockRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Add your authorization logic here, e.g., check user permissions
        return true; // Or auth()->user()->can('dispense stock');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'batch_id' => [
                'required',
                Rule::exists('batches', 'id'),
                // Custom rule to check if batch has enough stock
                function ($attribute, $value, $fail) {
                    $batch = Batch::find($value);
                    if ($batch) {
                        $quantityToDispense = (int) $this->input('quantity', 0);
                        // Access the current_quantity accessor you should have defined on Batch model
                        if ($batch->current_quantity < $quantityToDispense) {
                            $fail("The selected batch does not have enough stock. Available: {$batch->current_quantity}.");
                        }
                    } else {
                        $fail('The selected batch is invalid.');
                    }
                },
            ],
            'medicine_id' => ['required', Rule::exists('medicines', 'id')], // Good to also validate medicine_id
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:1000',
            'transaction_date' => 'nullable|date', // Optional: if you want to allow backdating
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'batch_id.required' => 'A batch must be selected for dispensing.',
            'batch_id.exists' => 'The selected batch is invalid.',
            'quantity.required' => 'The quantity to dispense is required.',
            'quantity.integer' => 'The quantity must be a whole number.',
            'quantity.min' => 'The quantity must be at least 1.',
        ];
    }
}
