<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\Medication;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockController extends Controller
{

    public function index()
    {
        $stocks = Stock::with('medication')->get()->map(function ($stock) {
            $stock->is_expiring = false;

            if ($stock->end_time) {
                $endTime = \Carbon\Carbon::parse($stock->end_time);
                $stock->is_expiring = $endTime->isBetween(now(), now()->addDays(3));
            }

            return $stock;
        });

        $role = auth()->user()->role->name;

        return Inertia::render('Stocks/Index', [
            'stocks' => $stocks,
            'canNotify' => in_array($role, ['admin', 'superuser']),
        ]);
    }

    

    public function create()
    {
        return Inertia::render('Stocks/Create', [
            'medications' => Medication::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'medication_id' => 'required|exists:medications,id',
            'quantity' => 'required|integer|min:1',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'notes' => 'nullable|string',
        ]);

        Stock::create([
            ...$request->all(),
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('stocks.index')->with('success', 'Stock added!');
    }

    public function edit(Stock $stock)
    {
        return Inertia::render('Stocks/Edit', [
            'stock' => $stock,
            'medications' => Medication::all(),
        ]);
    }

    public function update(Request $request, Stock $stock)
    {
        $request->validate([
            'medication_id' => 'required|exists:medications,id',
            'quantity' => 'required|integer|min:1',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'notes' => 'nullable|string',
        ]);

        $stock->update($request->all());

        return redirect()->route('stocks.index')->with('success', 'Stock updated!');
    }

    public function destroy(Stock $stock)
    {
        $stock->delete();
        return redirect()->route('stocks.index')->with('success', 'Stock deleted!');
    }
}

