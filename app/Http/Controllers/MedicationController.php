<?php

namespace App\Http\Controllers;

use App\Models\Medication;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MedicationController extends Controller
{

    public function index()
    {
        $medications = Medication::all()->map(function ($medication) {
            $medication->is_expiring = false;

            if ($medication->end_date) {
                $endDate = \Carbon\Carbon::parse($medication->end_date);
                $medication->is_expiring = $endDate->isBetween(now(), now()->addDays(3));
            }

            return $medication;
        });

        $role = auth()->user()->role->name;

        return Inertia::render('Medications/Index', [
            'medications' => $medications,
            'canNotify' => in_array($role, ['admin', 'superuser']),
        ]);
    }


    public function create()
    {
        return Inertia::render('Medications/Create', [
            'suppliers' => Supplier::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'type' => 'required|string',
            'category' => 'required|string',
            'reason' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'supplier_id' => 'nullable|exists:suppliers,id',
        ]);

        Medication::create([
            ...$request->all(),
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('medications.index')->with('success', 'Medication added!');
    }

    public function edit(Medication $medication)
    {
        return Inertia::render('Medications/Edit', [
            'medication' => $medication,
            'suppliers' => Supplier::all(),
        ]);
    }

    public function update(Request $request, Medication $medication)
    {
        $request->validate([
            'name' => 'required|string',
            'type' => 'required|string',
            'category' => 'required|string',
            'reason' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'supplier_id' => 'nullable|exists:suppliers,id',
        ]);

        $medication->update($request->all());

        return redirect()->route('medications.index')->with('success', 'Medication updated!');
    }

    public function destroy(Medication $medication)
    {
        $medication->delete();
        return redirect()->route('medications.index')->with('success', 'Medication deleted!');
    }
}

