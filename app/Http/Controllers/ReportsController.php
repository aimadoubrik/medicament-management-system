<?php

namespace App\Http\Controllers;

use App\Models\StockLedgerEntry;
use App\Models\Batch;
use App\Models\Medicine;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class ReportsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $validatedIndexRequest = $request->validate([
            'page' => 'sometimes|integer|min:1',
            'perPage' => 'sometimes|integer|min:1|max:100',
            'sort' => 'nullable|string|max:50',
            'direction' => 'nullable|string|in:asc,desc',
            'filter' => 'nullable|string|max:100',
            'filterBy' => 'nullable|string|in:medicine_name,batch_name,user_name',
        ]);

        $query = StockLedgerEntry::query()
            ->leftJoin('medicines', 'stock_ledger.medicine_id', '=', 'medicines.id')
            ->leftJoin('batches', 'stock_ledger.batch_id', '=', 'batches.id')
            ->leftJoin('users', 'stock_ledger.user_id', '=', 'users.id')
            ->select('stock_ledger.*', 'medicines.name as medicine_name', 'batches.batch_number as batch_number', 'users.name as user_name');

        // --- Filtering ---
        $filterValue = $request->input('filter');
        $filterColumn = $request->input('filterBy', 'medicine_name'); // Default filter column

        // Basic global filter (adjust as needed for complexity)
        // Ensure the filter column exists to prevent errors
        if ($filterValue && $filterColumn && Schema::hasColumn('medicines', $filterColumn)) {
            // Use 'where' for exact match or 'like' for partial match
            $query->where($filterColumn, 'like', '%' . $filterValue . '%');
        }

        // Whitelist sortable columns for security and clarity
        $allowedSortColumns = array_merge(
            Schema::getColumnListing('stock_ledger'),
            ['medicine_name', 'batch_name', 'user_name']
        );

        $sortColumn = $request->input('sort', 'medicine_name'); // Default sort column
        $sortDirection = $request->input('direction', 'desc'); // Default direction

        if ($sortColumn && in_array($sortColumn, $allowedSortColumns)) {
            $query->orderBy($sortColumn, $sortDirection);
        } else {
            $query->orderBy('transaction_date', 'asc');
        }

        $perPage = $validatedIndexRequest['perPage'] ?? 20;
        $stockLedgerEntries = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Reports/Index', [
            'stockLedgerEntries' => $stockLedgerEntries,
            'filters' => $validatedIndexRequest
        ]);
    }
}
