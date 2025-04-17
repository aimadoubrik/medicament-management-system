<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\Medicine;
use App\Models\Supplier;
use App\Http\Requests\StoreBatchRequest;
use App\Http\Requests\UpdateBatchRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class StockController extends Controller
{
    /**
     * Display a listing of the resource with server-side processing.
     */
    public function index(Request $request)
    {
        // 1. Validate incoming request parameters
        $request->validate([
            'page' => 'sometimes|integer|min:1',
            'perPage' => 'sometimes|integer|min:1|max:100',
            'sort' => 'nullable|string|max:50',
            'direction' => 'nullable|string|in:asc,desc',
            'filter' => 'nullable|string|max:100', // Global filter value
            // Column for global filter (e.g., 'medicine_name', 'batch_number')
            'filterBy' => 'nullable|string|max:50',
            'expiry_from' => 'nullable|date',
            'expiry_to' => 'nullable|date',
        ]);

        // 2. Start building the query
        // *** USE 'medicine' relationship name (assuming it exists in Batch model) ***
        $query = Batch::query()->with(['medicine', 'supplier']);

        // 3. Apply Filtering
        $filterValue = $request->input('filter');
        // Default filter column or get from request
        $filterColumn = $request->input('filterBy', 'medicine_name'); // Default to searching medicine name

        if ($filterValue) {
            if ($filterColumn === 'medicine_name') {
                // Search by related medicine name
                // *** USE 'medicine' relationship ***
                $query->whereHas('medicine', function ($q) use ($filterValue) {
                    $q->where('name', 'like', '%' . $filterValue . '%');
                });
            } elseif (Schema::hasColumn('batches', $filterColumn)) {
                // Search directly on batches table if column exists
                $query->where($filterColumn, 'like', '%' . $filterValue . '%');
            }
            // Add more specific filterBy conditions if needed (e.g., supplier name)
            // elseif ($filterColumn === 'supplier_name') {
            //     $query->whereHas('supplier', fn($q) => $q->where('name', 'like', "%{$filterValue}%"));
            // }
        }

        // Apply date range filters
        $query->when($request->expiry_from, function ($query, $date) {
            $query->where('expiry_date', '>=', $date);
        });
        $query->when($request->expiry_to, function ($query, $date) {
            $query->where('expiry_date', '<=', $date);
        });

        // 4. Apply Sorting
        $sortColumn = $request->input('sort', 'expiry_date'); // Default sort column
        $sortDirection = $request->input('direction', 'asc'); // Default direction

        // Check if the sort column exists on the 'batches' table directly
        if (Schema::hasColumn('batches', $sortColumn)) {
            $query->orderBy($sortColumn, $sortDirection);
        } elseif ($sortColumn === 'medicine_name') {
            // Sort by related medicine name
            // *** USE Medicine model and assume 'medicine_id' foreign key ***
            $query->orderBy(
                Medicine::select('name')->whereColumn('medicines.id', 'batches.medicine_id'),
                $sortDirection
            );
        } elseif ($sortColumn === 'supplier_name') {
            // Sort by related supplier name
            $query->orderBy(
                Supplier::select('name')->whereColumn('suppliers.id', 'batches.supplier_id'),
                $sortDirection
            );
        } else {
            // Fallback sorting
            $query->orderBy('expiry_date', 'asc');
        }

        // 5. Apply Pagination
        $perPage = $request->input('perPage', 10); // Default items per page

        $batches = $query->paginate($perPage)
            ->withQueryString(); // Append query string parameters

        // 6. Return Inertia response
        return Inertia::render('Stock/Index', [
            // *** Return the paginator object directly ***
            'batches' => $batches,
            // Pass back validated filters to potentially populate filter inputs
            'filters' => $request->only(['filter', 'filterBy', 'expiry_from', 'expiry_to', 'sort', 'direction', 'page', 'perPage']),
            // Pass medicines for dropdowns if needed for filtering UI
            // 'medicines' => Medicine::select('id', 'name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Stock/Create', [
            // *** USE Medicine model ***
            'medicines' => Medicine::select('id', 'name')->get(),
            'suppliers' => Supplier::select('id', 'name')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBatchRequest $request)
    {
        // Ensure current_quantity is set correctly, often same as quantity_received on store
        $validatedData = $request->validated();
        // *** Ensure StoreBatchRequest validates 'medicine_id' instead of 'product_id' ***
        if (!isset($validatedData['current_quantity'])) {
            $validatedData['current_quantity'] = $validatedData['quantity_received'];
        }

        Batch::create($validatedData);

        return redirect()->route('stock.index')
            ->with('success', 'Batch created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Batch $batch) // Route model binding
    {
        return Inertia::render('Stock/Edit', [
            // *** USE 'medicine' relationship ***
            'batch' => $batch->load(['medicine', 'supplier']),
            // *** USE Medicine model ***
            'medicines' => Medicine::select('id', 'name')->get(),
            'suppliers' => Supplier::select('id', 'name')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBatchRequest $request, Batch $batch) // Route model binding
    {
        // *** Ensure UpdateBatchRequest validates 'medicine_id' if it can be updated ***
        $batch->update($request->validated());

        return redirect()->route('stock.index')
            ->with('success', 'Batch updated successfully.');
    }

    /**
     * Adjust the stock quantity for a specific batch.
     */
    public function adjust(Request $request, Batch $batch) // Route model binding
    {
        $request->validate([
            'adjustment' => 'required|integer', // Can be positive or negative
            'reason' => 'required|string|max:255',
        ]);

        // *** USE current_quantity ***
        $newQuantity = $batch->current_quantity + $request->adjustment;

        if ($newQuantity < 0) {
            return back()->withErrors(['adjustment' => 'Adjustment results in negative stock.'])->withInput();
        }

        $batch->update([
            // *** USE current_quantity ***
            'current_quantity' => $newQuantity
        ]);

        // TODO: Consider logging the adjustment
        // StockAdjustment::create([...]);

        return redirect()->route('stock.index')
            ->with('success', 'Stock adjusted successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id) // Route model binding
    {
        $batch = Batch::findOrFail($id);
        $batch->delete();

        // For Inertia, you can either redirect or return a JSON response
        if (request()->wantsJson()) {
            return response()->json(['message' => 'Batch deleted successfully']);
        }

        return redirect()->route('stock.index')
            ->with('success', 'Batch deleted successfully.');
    }
}
