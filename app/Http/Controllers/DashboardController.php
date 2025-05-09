<?php

namespace App\Http\Controllers;

use App\Models\Batch; // Added Request type hint
use Carbon\Carbon; // Added DB Facade
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // Added Inertia Response type hint
use Inertia\Inertia;
use Inertia\Response as InertiaResponse; // Explicitly use Carbon for clarity

class DashboardController extends Controller
{
    /**
     * Display the dashboard with inventory summaries.
     */
    public function index(Request $request): InertiaResponse // Added type hints
    {
        // --- Configuration ---
        // Get thresholds from config (provide defaults if not set)
        // Example: Put these in config/inventory.php or config/app.php
        $lowStockThreshold = config('inventory.reorder_level', 10);
        $expiringSoonDays = config('inventory.expiring_soon_days', 30);

        // --- Date Calculation ---
        $now = Carbon::now(); // Use Carbon directly for clarity
        $expiryThresholdDate = $now->copy()->addDays($expiringSoonDays);

        // --- Database Query ---
        // Fetch batches with calculated status flags directly from the database
        $batches = Batch::with('medicine') // Eager load medicine relationship
            ->select(
                'batches.*', // Select all columns from the batches table explicitly
                DB::raw('CASE WHEN current_quantity <= ? THEN 1 ELSE 0 END as is_low_stock'),
                DB::raw('CASE WHEN expiry_date <= ? AND expiry_date > ? THEN 1 ELSE 0 END as is_expiring_soon'),
                DB::raw('CASE WHEN expiry_date < ? THEN 1 ELSE 0 END as is_expired')
            )
            ->addBinding($lowStockThreshold, 'select') // Bind parameters for CASE statements
            ->addBinding($expiryThresholdDate, 'select')
            ->addBinding($now, 'select') // Binding for expiring soon lower bound
            ->addBinding($now, 'select') // Binding for is_expired check
            ->get();

        // --- Data Processing & Filtering ---
        // Filter the results based on the flags calculated by the database
        // This filtering happens in memory on the fetched collection, which is fast.
        $lowStockMedicines = $batches->where('is_low_stock', 1);
        $expiringSoonMedicines = $batches->where('is_expiring_soon', 1);
        $expiredMedicines = $batches->where('is_expired', 1);

        // --- Prepare Data for View ---
        $summaryData = [
            'lowStockCount' => $lowStockMedicines->count(),
            'expiringSoonCount' => $expiringSoonMedicines->count(),
            'expiredCount' => $expiredMedicines->count(),
            'totalBatches' => $batches->count(), // Total relevant batches fetched
        ];

        // Pass data to the Inertia view
        return Inertia::render('dashboard', [
            'summaryData' => $summaryData,
            // Use ->values() to reset collection keys for proper JSON array serialization
            'lowStockMedicines' => $lowStockMedicines->values(),
            'expiringSoonMedicines' => $expiringSoonMedicines->values(),
            'expiredMedicines' => $expiredMedicines->values(),
        ]);
    }
}
