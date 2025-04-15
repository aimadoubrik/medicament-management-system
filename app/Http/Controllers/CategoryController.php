<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;
use Illuminate\Support\Facades\Schema;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $request->validate([
            'page' => 'integer|min:1',
            'perPage' => 'integer|min:1|max:100', // Add max limit
            'sort' => 'nullable|string|max:50',
            'direction' => 'nullable|in:asc,desc',
            'filter' => 'nullable|string|max:100',
            'filterBy' => 'nullable|string|max:50',
        ]);

        $query = Category::query();


        // --- Filtering ---
        $filterValue = $request->input('filter');
        $filterColumn = $request->input('filterBy', 'name'); // Default filter column

        // Basic global filter (adjust as needed for complexity)
        // Ensure the filter column exists to prevent errors
        if ($filterValue && $filterColumn && Schema::hasColumn('categories', $filterColumn)) {
            // Use 'where' for exact match or 'like' for partial match
            $query->where($filterColumn, 'like', '%' . $filterValue . '%');
        }

        // --- Sorting ---
        $sortColumn = $request->input('sort', 'name'); // Default sort column
        $sortDirection = $request->input('direction', 'desc'); // Default direction

        // Ensure the sort column exists
        if ($sortColumn && Schema::hasColumn('categories', $sortColumn)) {
            $query->orderBy($sortColumn, $sortDirection);
        } else {
            // Fallback sorting if provided column is invalid
            $query->orderBy('name', 'desc');
        }

        // --- Pagination ---
        $perPage = $request->input('perPage', 10); // Default page size

        // Use paginate() which includes total counts needed for React Table
        $categories = $query->paginate($perPage)
            // Important: Append the query string parameters to pagination links
            ->withQueryString();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Categories/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|text',
        ]);

        Category::create($validatedData);

        return redirect()->route('categories.index')->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $category = Category::findOrFail($id);

        return Inertia::render('Categories/Show', [
            'category' => $category,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $category = Category::findOrFail($id);

        return Inertia::render('Categories/Edit', [
            'category' => $category,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|text',
        ]);

        $category = Category::findOrFail($id);
        $category->update($validatedData);

        return redirect()->route('categories.index')->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return redirect()->route('categories.index')->with('success', 'Category deleted successfully.');
    }
}
