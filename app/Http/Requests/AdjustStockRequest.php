<?php

namespace App\Http\Requests;

use App\Enums\StockTransactionType;
use App\Models\Batch;
use Illuminate\Foundation\Http\FormRequest; // Import the Enum
use Illuminate\Validation\Rule;

class AdjustStockRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Add your authorization logic here
        return true; // Or auth()->user()->can('adjust stock');
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
                function ($attribute, $value, $fail) {
                    $batch = Batch::find($value);
                    $transactionType = StockTransactionType::tryFrom($this->input('transaction_type'));
                    $quantityChange = (int) $this->input('quantity_change', 0);

                    if ($batch && $transactionType) {
                        // If it's a negative transaction type (reducing stock)
                        if (in_array($transactionType->value, StockTransactionType::getNegativeTransactionTypes())) {
                            // Ensure quantity_change is negative or convert it
                            if ($quantityChange > 0) {
                                $quantityChange = -$quantityChange;
                            }

                            if (($batch->current_quantity + $quantityChange) < 0) {
                                $fail("Adjustment would result in negative stock for the batch. Available: {$batch->current_quantity}. Trying to remove: ".abs($quantityChange));
                            }
                        }
                        // If it's a positive transaction type (adding stock)
                        elseif (in_array($transactionType->value, StockTransactionType::getPositiveTransactionTypes())) {
                            // Ensure quantity_change is positive or convert it
                            if ($quantityChange < 0) {
                                $quantityChange = abs($quantityChange);
                            }
                        }

                    } elseif (! $batch) {
                        $fail('The selected batch is invalid.');
                    } elseif (! $transactionType) {
                        $fail('Invalid transaction type provided.');
                    }
                },
            ],
            'medicine_id' => ['required', Rule::exists('medicines', 'id')],
            'transaction_type' => [
                'required',
                'string',
                Rule::in(array_column(StockTransactionType::cases(), 'value')), // Validate against Enum values
            ],
            'quantity_change' => 'required|integer|not_in:0', // Can be positive or negative
            'notes' => 'required|string|min:5|max:1000',
            'transaction_date' => 'nullable|date',
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * This is a good place to ensure quantity_change sign matches transaction_type intent if needed,
     * although the custom rule in rules() handles the final stock check.
     */
    protected function prepareForValidation(): void
    {
        $quantity = (int) $this->input('quantity_change', 0);
        $transactionType = StockTransactionType::tryFrom($this->input('transaction_type'));

        if ($transactionType && $quantity !== 0) {
            if (in_array($transactionType->value, StockTransactionType::getNegativeTransactionTypes()) && $quantity > 0) {
                $this->merge(['quantity_change' => -$quantity]);
            } elseif (in_array($transactionType->value, StockTransactionType::getPositiveTransactionTypes()) && $quantity < 0) {
                $this->merge(['quantity_change' => abs($quantity)]);
            }
        }
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'batch_id.required' => 'A batch must be selected for adjustment.',
            'transaction_type.required' => 'A transaction type is required.',
            'transaction_type.in' => 'Invalid transaction type selected.',
            'quantity_change.required' => 'The quantity for adjustment is required.',
            'quantity_change.integer' => 'The quantity must be a whole number.',
            'quantity_change.not_in' => 'The quantity cannot be zero.',
            'notes.required' => 'A reason/note for the adjustment is required.',
            'notes.min' => 'The reason/note must be at least 5 characters.',
        ];
    }
}
