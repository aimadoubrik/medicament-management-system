<?php

namespace App\Http\Requests;

use App\Enums\StockTransactionType;
use App\Models\Batch;
use Illuminate\Foundation\Http\FormRequest; // Use Laravel's Enum validation rule
use Illuminate\Validation\Rule; // Your Enum
use Illuminate\Validation\Rules\Enum as EnumRule; // For custom rule to check stock availability

class HandleStockTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Implement your authorization logic here.
        // For now, returning true to allow requests.
        // Example: return $this->user()->can('perform_stock_transaction');
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Get the transaction type from the input.
        // It's good to try and cast it to your Enum early if you'll use the Enum object in logic,
        // but for direct comparison with ->value in rules, the string input is also fine.
        $transactionTypeInput = $this->input('transaction_type');
        // $transactionTypeEnum = StockTransactionType::tryFrom($transactionTypeInput); // Optional: for logic using Enum object

        // Base rules applicable to most or all transactions
        $rules = [
            'transaction_type' => ['required', new EnumRule(StockTransactionType::class)],
            'medicine_id' => [
                // Generally required, except when IN_NEW_BATCH might imply creating a medicine (though your current rules require existing medicine for IN_NEW_BATCH)
                Rule::requiredIf(
                    fn () => $transactionTypeInput !== StockTransactionType::IN_NEW_BATCH->value ||
                        ($transactionTypeInput === StockTransactionType::IN_NEW_BATCH->value && ! $this->input('create_new_medicine_flag')) // Example flag
                ),
                'nullable', // Overall nullable to allow specific condition overrides
                'exists:medicines,id',
            ],
            'batch_id' => [
                Rule::requiredIf(fn () => in_array($transactionTypeInput, [
                    StockTransactionType::OUT_DISPENSE->value,
                    StockTransactionType::ADJUST_ADD->value, // Usually on an existing batch
                    StockTransactionType::ADJUST_SUB->value,
                    StockTransactionType::DISPOSAL_EXPIRED->value,
                    StockTransactionType::DISPOSAL_DAMAGED->value,
                    StockTransactionType::RETURN_SUPPLIER->value, // If returning a specific batch
                ])),
                'nullable',
                'exists:batches,id',
            ],
            'notes' => ['nullable', 'string', 'max:1000'],
            'transaction_date' => ['nullable', 'date_format:Y-m-d H:i:s', 'before_or_equal:now'], // More specific date format
            'related_transaction_id' => ['nullable', 'exists:stock_ledger,id'],
            // This 'quantity_change_input' is what the user types (always positive for amounts)
            // The actual 'quantity_change' for the ledger will be signed in the service.
            'quantity_change_input' => ['nullable', 'integer', 'min:0'],
        ];

        // --- Conditional Rules based on Transaction Type ---

        // Rules for IN_NEW_BATCH (Receiving new stock / creating a new batch)
        if ($transactionTypeInput === StockTransactionType::IN_NEW_BATCH->value) {
            $rules['medicine_id'] = ['required', 'exists:medicines,id']; // Medicine must be selected/exist
            $rules['supplier_id'] = ['required', 'exists:suppliers,id'];
            $rules['batch_number'] = ['required', 'string', 'max:255', Rule::unique('batches')->where(function ($query) {
                return $query->where('medicine_id', $this->input('medicine_id'));
            })->whereNull('deleted_at')]; // Unique batch number per medicine (active batches)
            $rules['quantity_change_input'] = ['required', 'integer', 'min:1']; // Represents quantity_received
            $rules['manufacture_date'] = ['nullable', 'date_format:Y-m-d', 'before_or_equal:today'];
            $rules['expiry_date'] = [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:today', // Can be today if it expires end of day
                // 'after:manufacture_date' // This can be tricky if mfg date is optional and not provided
                Rule::when($this->filled('manufacture_date'), ['after:manufacture_date']),
            ];
        }

        // Rules for OUT_DISPENSE
        if ($transactionTypeInput === StockTransactionType::OUT_DISPENSE->value) {
            $rules['quantity_change_input'] = [ // User enters a positive dispense quantity
                'required',
                'integer',
                'min:1',
                function ($attribute, $value, $fail) {
                    $batch = Batch::find($this->input('batch_id'));
                    if ($batch && $value > $batch->current_quantity) {
                        $fail("The dispense quantity ({$value}) cannot exceed the current stock of {$batch->current_quantity} for this batch.");
                    }
                },
            ];
            $rules['notes'] = ['required', 'string', 'max:1000']; // Notes often important for dispense
        }

        // Rules for ADJUST_ADD
        if ($transactionTypeInput === StockTransactionType::ADJUST_ADD->value) {
            $rules['quantity_change_input'] = ['required', 'integer', 'min:1']; // Positive quantity for adding
            $rules['notes'] = ['required', 'string', 'max:1000']; // Reason for adjustment
        }

        // Rules for ADJUST_SUB
        if ($transactionTypeInput === StockTransactionType::ADJUST_SUB->value) {
            $rules['quantity_change_input'] = [ // User enters a positive quantity to subtract
                'required',
                'integer',
                'min:1',
                function ($attribute, $value, $fail) {
                    $batch = Batch::find($this->input('batch_id'));
                    if ($batch && $value > $batch->current_quantity) {
                        $fail("The subtracted quantity ({$value}) cannot exceed the current stock of {$batch->current_quantity} for this batch.");
                    }
                },
            ];
            $rules['notes'] = ['required', 'string', 'max:1000']; // Reason for adjustment
        }

        // Rules for DISPOSAL_EXPIRED or DISPOSAL_DAMAGED
        if (in_array($transactionTypeInput, [StockTransactionType::DISPOSAL_EXPIRED->value, StockTransactionType::DISPOSAL_DAMAGED->value])) {
            $rules['quantity_change_input'] = [ // User enters a positive quantity to dispose
                'required',
                'integer',
                'min:1',
                function ($attribute, $value, $fail) {
                    $batch = Batch::find($this->input('batch_id'));
                    if ($batch && $value > $batch->current_quantity) {
                        $fail("The disposal quantity ({$value}) cannot exceed the current stock of {$batch->current_quantity} for this batch.");
                    }
                },
            ];
            $rules['notes'] = ['required', 'string', 'max:1000']; // Reason for disposal
        }

        // Rules for RETURN_SUPPLIER (Assuming returning a specific batch)
        if ($transactionTypeInput === StockTransactionType::RETURN_SUPPLIER->value) {
            $rules['batch_id'] = ['required', 'exists:batches,id']; // Specific batch being returned
            $rules['quantity_change_input'] = [ // User enters a positive quantity being returned
                'required',
                'integer',
                'min:1',
                function ($attribute, $value, $fail) {
                    $batch = Batch::find($this->input('batch_id'));
                    if ($batch && $value > $batch->current_quantity) {
                        $fail("The return quantity ({$value}) cannot exceed the current stock of {$batch->current_quantity} for this batch.");
                    }
                },
            ];
            $rules['notes'] = ['required', 'string', 'max:1000']; // Reason/documentation for return
        }

        // Rules for INITIAL_STOCK
        if ($transactionTypeInput === StockTransactionType::INITIAL_STOCK->value) {
            $rules['medicine_id'] = ['required', 'exists:medicines,id'];
            $rules['batch_id'] = ['nullable', 'exists:batches,id']; // Can be for general medicine or specific existing batch

            // Optional fields if creating a NEW batch specifically for this initial stock count
            $rules['create_new_batch_for_initial_stock'] = ['sometimes', 'boolean']; // Flag from frontend
            $rules['supplier_id'] = [
                Rule::requiredIf(fn () => $this->input('create_new_batch_for_initial_stock') === true || $this->input('create_new_batch_for_initial_stock') === 'true'),
                'nullable',
                'exists:suppliers,id',
            ];
            $rules['batch_number'] = [
                Rule::requiredIf(fn () => $this->input('create_new_batch_for_initial_stock') === true || $this->input('create_new_batch_for_initial_stock') === 'true'),
                'nullable',
                'string',
                'max:255',
                Rule::unique('batches')->where(function ($query) {
                    return $query->where('medicine_id', $this->input('medicine_id'));
                })->whereNull('deleted_at'), // Only consider active batches for uniqueness
            ];
            $rules['manufacture_date'] = [
                Rule::requiredIf(fn () => $this->input('create_new_batch_for_initial_stock') === true || $this->input('create_new_batch_for_initial_stock') === 'true'),
                'nullable',
                'date_format:Y-m-d',
                'before_or_equal:today',
            ];
            $rules['expiry_date'] = [
                Rule::requiredIf(fn () => $this->input('create_new_batch_for_initial_stock') === true || $this->input('create_new_batch_for_initial_stock') === 'true'),
                'nullable',
                'date_format:Y-m-d',
                'after_or_equal:today',
                Rule::when($this->filled('manufacture_date'), ['after:manufacture_date']),
            ];
            $rules['quantity_change_input'] = ['required', 'integer', 'min:0']; // Initial stock can be 0.
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'transaction_type.required' => 'Please select a transaction type.',
            'medicine_id.required' => 'Please select a medicine.',
            'medicine_id.required_if' => 'Please select a medicine for this transaction type.',
            'medicine_id.exists' => 'The selected medicine does not exist.',
            'batch_id.required_if' => 'Please select a batch for this transaction type.',
            'batch_id.exists' => 'The selected batch does not exist.',
            'supplier_id.required' => 'Please select a supplier for the new batch.',
            'supplier_id.required_if' => 'Please select a supplier when creating a new batch for initial stock.',
            'supplier_id.exists' => 'The selected supplier does not exist.',
            'batch_number.required' => 'Batch number is required for a new batch.',
            'batch_number.required_if' => 'Batch number is required when creating a new batch for initial stock.',
            'batch_number.unique' => 'This batch number already exists for the selected medicine.',
            'quantity_change_input.required' => 'Quantity is required for this transaction.',
            'quantity_change_input.integer' => 'Quantity must be a whole number.',
            'quantity_change_input.min' => 'Quantity must be at least :min.',
            'manufacture_date.date_format' => 'Manufacture date must be in YYYY-MM-DD format.',
            'manufacture_date.before_or_equal' => 'Manufacture date cannot be in the future.',
            'manufacture_date.required_if' => 'Manufacture date is required when creating a new batch for initial stock.',
            'expiry_date.required' => 'Expiry date is required for a new batch.',
            'expiry_date.required_if' => 'Expiry date is required when creating a new batch for initial stock.',
            'expiry_date.date_format' => 'Expiry date must be in YYYY-MM-DD format.',
            'expiry_date.after_or_equal' => 'Expiry date must be today or in the future.',
            'expiry_date.after' => 'Expiry date must be after the manufacture date.',
            'notes.required' => 'Notes or a reason are required for this transaction type.',
            'transaction_date.date_format' => 'Transaction date must be in YYYY-MM-DD HH:MM:SS format.',
            'transaction_date.before_or_equal' => 'Transaction date cannot be in the future.',
            'create_new_batch_for_initial_stock.boolean' => 'Invalid input for create new batch flag.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure boolean flags are actual booleans if they come from the form as strings
        if ($this->has('create_new_batch_for_initial_stock')) {
            $this->merge([
                'create_new_batch_for_initial_stock' => filter_var($this->input('create_new_batch_for_initial_stock'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            ]);
        }

        // Convert specific input field names to a common 'quantity_change_input' if needed
        // For example, if IN_NEW_BATCH sends 'quantity_received' instead of 'quantity_change_input'
        if ($this->input('transaction_type') === StockTransactionType::IN_NEW_BATCH->value && $this->has('quantity_received')) {
            if (! $this->has('quantity_change_input')) { // Only merge if quantity_change_input isn't already set
                $this->merge(['quantity_change_input' => $this->input('quantity_received')]);
            }
        }
        // Add similar merges if other transaction types use different field names for the quantity from the UI
    }

    /**
     * Get the validated data from the request.
     *
     * @return array
     */
    public function validated($key = null, $default = null)
    {
        $validatedData = parent::validated($key, $default);

        // The service layer will handle converting 'quantity_change_input' (always positive from user)
        // to a signed 'quantity_change' for the stock_ledger based on the transaction_type.
        // So, 'quantity_change_input' itself is what we pass on from validation.
        // If 'quantity_received' was specifically validated for IN_NEW_BATCH, ensure it's distinctly available if needed.
        if ($this->input('transaction_type') === StockTransactionType::IN_NEW_BATCH->value && isset($validatedData['quantity_change_input'])) {
            $validatedData['quantity_received'] = $validatedData['quantity_change_input'];
        }

        return $validatedData;
    }
}
