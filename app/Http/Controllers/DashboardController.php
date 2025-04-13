<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Batch;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Define threshold values as constants or config values
        $LOW_STOCK_THRESHOLD = 10;
        $EXPIRING_SOON_DAYS = 30;

        // Get current date once
        $now = now();
        $thirtyDaysFromNow = $now->copy()->addDays($EXPIRING_SOON_DAYS);

        // Combine queries to reduce database calls
        $batches = Batch::with('medicine')
            ->select('*')
            ->selectRaw('
            CASE 
                WHEN current_quantity <= ? THEN 1 
                ELSE 0 
            END as is_low_stock,
            CASE 
                WHEN expiry_date <= ? AND expiry_date > ? THEN 1 
                ELSE 0 
            END as is_expiring_soon,
            CASE 
                WHEN expiry_date < ? THEN 1 
                ELSE 0 
            END as is_expired
            ', [$LOW_STOCK_THRESHOLD, $thirtyDaysFromNow, $now, $now])
            ->get();

        // Filter results
        $lowStockMedicines = $batches->where('is_low_stock', 1);
        $expiringSoonMedicines = $batches->where('is_expiring_soon', 1);
        $expiredMedicines = $batches->where('is_expired', 1);

        $summaryData = [
            'lowStockMedicines' => $lowStockMedicines->count(),
            'expiringSoonMedicines' => $expiringSoonMedicines->count(),
            'expiredMedicines' => $expiredMedicines->count(),
            'totalMedicines' => $batches->count(),
        ];

        return Inertia::render('Dashboard', [
            'summaryData' => $summaryData,
            'lowStockMedicines' => $lowStockMedicines->values(),
            'expiringSoonMedicines' => $expiringSoonMedicines->values(),
            'expiredMedicines' => $expiredMedicines->values(),
        ]);
    }
}
