<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\Medicine;
use App\Models\Supplier;
use App\Http\Requests\StoreBatchRequest;
use App\Http\Requests\UpdateBatchRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockController extends Controller
{
    public function index(Request $request)
    {
        $batches = Batch::with(['medicine', 'supplier'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('medicine', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhere('batch_number', 'like', "%{$search}%");
            })
            ->when($request->expiry_from, function ($query, $date) {
                $query->where('expiry_date', '>=', $date);
            })
            ->when($request->expiry_to, function ($query, $date) {
                $query->where('expiry_date', '<=', $date);
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Stock/Index', [
            'batches' => $batches,
            'filters' => $request->only(['search', 'expiry_from', 'expiry_to']),
            'medicines' => Medicine::select('id', 'name')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Stock/Create', [
            'medicines' => Medicine::select('id', 'name')->get(),
            'suppliers' => Supplier::select('id', 'name')->get(),
        ]);
    }

    public function store(StoreBatchRequest $request)
    {
        Batch::create($request->validated());

        return redirect()->route('stock.index')
            ->with('success', 'Batch created successfully.');
    }

    public function edit(Batch $batch)
    {
        return Inertia::render('Stock/Edit', [
            'batch' => $batch->load(['medicine', 'supplier']),
            'medicines' => Medicine::select('id', 'name')->get(),
            'suppliers' => Supplier::select('id', 'name')->get(),
        ]);
    }

    public function update(UpdateBatchRequest $request, Batch $batch)
    {
        $batch->update($request->validated());

        return redirect()->route('stock.index')
            ->with('success', 'Batch updated successfully.');
    }

    public function adjust(Request $request, Batch $batch)
    {
        $request->validate([
            'adjustment' => 'required|integer',
            'reason' => 'required|string|max:255',
        ]);

        $newQuantity = $batch->quantity + $request->adjustment;
        
        if ($newQuantity < 0) {
            return back()->withErrors(['adjustment' => 'Cannot adjust to negative stock.']);
        }

        $batch->update([
            'quantity' => $newQuantity
        ]);

        // Log the adjustment if you have a StockAdjustment model
        // StockAdjustment::create([...]);

        return redirect()->route('stock.index')
            ->with('success', 'Stock adjusted successfully.');
    }
}
