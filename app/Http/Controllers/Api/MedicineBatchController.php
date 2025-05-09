<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Batch; // Import the Medicine model
use App\Models\Medicine;    // Import the Batch model
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request; // For type hinting the response

class MedicineBatchController extends Controller
{
    /**
     * Display a listing of the batches for a specific medicine.
     *
     * @param  \App\Models\Medicine  $medicine  (Injected via Route Model Binding)
     */
    public function index(Medicine $medicine, Request $request): JsonResponse
    {
        // Query batches related to the injected medicine model
        $batchesQuery = $medicine->batches() // Use the relationship defined in Medicine model (if exists)
            ->select([ // Select only necessary fields for the dropdown
                'id',
                'batch_number',
                'expiry_date',
                'current_quantity',
            ])
            ->where('current_quantity', '>', 0) // Only show batches with stock
            ->whereDate('expiry_date', '>=', now()->format('Y-m-d')); // Only show non-expired batches

        // Optionally add ordering (e.g., First-Expiring, First-Out - FEFO)
        $batchesQuery->orderBy('expiry_date', 'asc');

        // You could add pagination if the list could be very long,
        // but for a dropdown, usually fetching all relevant ones is fine unless performance dictates otherwise.
        // Example without pagination:
        $batches = $batchesQuery->get();

        // Return the data as a JSON response
        // The structure { data: [...] } is common for APIs and matches what your frontend expects.
        return response()->json([
            'data' => $batches,
        ]);

        /*
        // --- Alternative using API Resources (Recommended for complex transformations) ---
        // 1. Create an API Resource: php artisan make:resource BatchResource
        // 2. Define the toArray method in app/Http/Resources/BatchResource.php
        //    return [
        //        'id' => $this->id,
        //        'batch_number' => $this->batch_number,
        //        'expiry_date' => $this->expiry_date, // Consider formatting if needed
        //        'current_quantity' => $this->current_quantity,
        //        // Add any other fields needed by the frontend select options logic
        //    ];
        // 3. Use the resource collection in the controller:
        // return \App\Http\Resources\BatchResource::collection($batches);
        */
    }
}
