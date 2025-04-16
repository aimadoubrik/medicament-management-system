<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Schema;

use App\Models\Supplier;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Validate the request data
        $request->validate([
            'page' => 'integer|min:1',
            'perPage' => 'integer|min:1|max:100', // Add max limit
            'sort' => 'nullable|string|max:50',
            'direction' => 'nullable|in:asc,desc',
            'filter' => 'nullable|string|max:100',
            'filterBy' => 'nullable|string|max:50',
        ]);

        $query = Supplier::query();


        // --- Filtering ---
        $filterValue = $request->input('filter');
        $filterColumn = $request->input('filterBy', 'name'); // Default filter column

        // Basic global filter (adjust as needed for complexity)
        // Ensure the filter column exists to prevent errors
        if ($filterValue && $filterColumn && Schema::hasColumn('suppliers', $filterColumn)) {
            // Use 'where' for exact match or 'like' for partial match
            $query->where($filterColumn, 'like', '%' . $filterValue . '%');
        }

        // --- Sorting ---
        $sortColumn = $request->input('sort', 'name'); // Default sort column
        $sortDirection = $request->input('direction', 'desc'); // Default direction

        // Ensure the sort column exists
        if ($sortColumn && Schema::hasColumn('suppliers', $sortColumn)) {
            $query->orderBy($sortColumn, $sortDirection);
        } else {
            // Fallback sorting if provided column is invalid
            $query->orderBy('name', 'desc');
        }

        // --- Pagination ---
        $perPage = $request->input('perPage', 10); // Default page size

        // Use paginate() which includes total counts needed for React Table
        $suppliers = $query->paginate($perPage)
            // Important: Append the query string parameters to pagination links
            ->withQueryString();

        return Inertia::render('Suppliers/Index', [
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Return the create supplier form
        return Inertia::render('Suppliers/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the request data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        // Create a new supplier
        Supplier::create($validatedData);

        // Redirect to the supplier index page with a success message
        return redirect()->route('suppliers.index')->with('success', 'Supplier created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Fetch the supplier by ID
        $supplier = Supplier::findOrFail($id);

        // Return the supplier details to the view
        return Inertia::render('Suppliers/Show', [
            'supplier' => $supplier,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        // Fetch the supplier by ID
        $supplier = Supplier::findOrFail($id);
        // Return the edit supplier form
        return Inertia::render('Suppliers/Edit', [
            'supplier' => $supplier,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Validate the request data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        // Update the supplier
        Supplier::findOrFail($id)->update($validatedData);

        // Redirect to the supplier index page with a success message
        return redirect()->route('suppliers.index')->with('success', 'Supplier updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Find the supplier and delete it
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();

        // For Inertia, return either JSON response or redirect
        if (request()->wantsJson()) {
            return response()->json(['message' => 'Supplier deleted successfully']);
        }

        return redirect()->route('suppliers.index')
            ->with('success', 'Supplier deleted successfully.');
    }
}
