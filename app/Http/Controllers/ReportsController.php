<?php

namespace App\Http\Controllers;

use App\Models\MedicineStockSummary;
use Inertia\Inertia;

class ReportsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $summary = MedicineStockSummary::all();

        return Inertia::render('Reports/Index', ['summary' => $summary]);
    }
}
