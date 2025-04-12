<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Medicine;
use App\Models\Category;

use App\Http\Requests\StoreMedicineRequest;
use App\Http\Requests\UpdateMedicineRequest;

class MedicineController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $medicines = Medicine::with('category')->paginate(10);

        return Inertia::render('Medicines/Index', [
            'medicines' => $medicines,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::all();

        return Inertia::render('Medicines/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMedicineRequest $request)
    {
        $validatedData = $request->validated();

        // Create the medicine
        $medicine = Medicine::create($validatedData);

        // Redirect to the medicine index page with a success message
        return redirect()->route('medicines.index')->with('success', 'Medicine created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $medicine = Medicine::with('category')->findOrFail($id);

        return Inertia::render('Medicines/Show', [
            'medicine' => $medicine,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $medicine = Medicine::findOrFail($id);
        $categories = Category::all();

        return Inertia::render('Medicines/Edit', [
            'medicine' => $medicine,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMedicineRequest $request, string $id)
    {
        $validatedData = $request->validated();

        // Find the medicine and update it
        $medicine = Medicine::findOrFail($id);
        $medicine->update($validatedData);

        // Redirect to the medicine index page with a success message
        return redirect()->route('medicines.index')->with('success', 'Medicine updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Find the medicine and delete it
        $medicine = Medicine::findOrFail($id);
        $medicine->delete();

        // Redirect to the medicine index page with a success message
        return redirect()->route('medicines.index')->with('success', 'Medicine deleted successfully.');
    }
}
