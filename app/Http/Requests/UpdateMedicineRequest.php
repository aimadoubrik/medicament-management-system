<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMedicineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Change to true to allow authenticated users
    }

    public function rules(): array
    {
        return [
            'name' => 'string|max:255',
            'manufacturer/distributor' => 'string|max:255',
            'dosage' => 'string|max:255',
            'form' => 'string|max:255',
            'unit_of_measure' => 'string|max:255',
            'description' => 'nullable|string',
            'reorder_level' => 'required|numeric|min:0',
        ];
    }
}
