<?php

namespace App\Http\Controllers;

use App\Models\StockLedgerEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $filterValue = $validatedIndexRequest['filter'] ?? null;
        $filterColumn = $validatedIndexRequest['filterBy'] ?? 'medicine_name';

        if ($filterValue) {
            if ($filterColumn === 'medicine_name') {
                $query->whereHas('medicine', fn($q) => $q->where('name', 'like', "%{$filterValue}%"));
            } elseif ($filterColumn === 'user_name') {
                $query->whereHas('user', fn($q) => $q->where('name', 'like', "%{$filterValue}%"));
            } elseif ($filterColumn === 'batch_number') {
                $query->whereHas('batch', fn($q) => $q->where('batch_number', 'like', "%{$filterValue}%"));
            } elseif (Schema::hasColumn('stock_ledger', $filterColumn)) { // e.g., batch_number
                $query->where($filterColumn, 'like', "%{$filterValue}%");
            }
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
            'filters' => $validatedIndexRequest,
        ]);
    }


    /**
     * Export a yearly report.
     */
    /**
     * Export a yearly report.
     */
    public function getYearlyReport(Request $request): JsonResponse
    {
        $validatedYearlyReportRequest = $request->validate([
            'year' => 'required|integer|min:2000|max:2100',
        ]);

        $year = $validatedYearlyReportRequest['year'];

        // Define transaction types for in/out
        $inTypes = [
            'IN_NEW_BATCH',
            'ADJUST_ADD',
            'INITIAL_STOCK',
        ];
        $outTypes = [
            'OUT_DISPENSE',
            'ADJUST_SUB',
            'DISPOSAL_EXPIRED',
            'DISPOSAL_DAMAGED',
            'RETURN_SUPPLIER',
        ];

        // Months array
        $months = [
            1 => 'January',
            2 => 'February',
            3 => 'March',
            4 => 'April',
            5 => 'May',
            6 => 'June',
            7 => 'July',
            8 => 'August',
            9 => 'September',
            10 => 'October',
            11 => 'November',
            12 => 'December',
        ];

        // Get all medicine names
        $allMedicines = DB::table('medicines')->pluck('name')->toArray();

        // Query: group by medicine and month
        $rawReport = DB::table('stock_ledger')
            ->join('medicines', 'stock_ledger.medicine_id', '=', 'medicines.id')
            ->selectRaw('
            medicines.name as medicine_name,
            MONTH(stock_ledger.transaction_date) as month,
            SUM(CASE WHEN stock_ledger.transaction_type IN ("' . implode('","', $inTypes) . '") THEN stock_ledger.quantity_change ELSE 0 END) as received,
            SUM(CASE WHEN stock_ledger.transaction_type IN ("' . implode('","', $outTypes) . '") THEN ABS(stock_ledger.quantity_change) ELSE 0 END) as `out`
        ')
            ->whereYear('stock_ledger.transaction_date', $year)
            ->groupBy('medicines.name', DB::raw('MONTH(stock_ledger.transaction_date)'))
            ->orderBy('medicines.name')
            ->orderBy('month')
            ->get();

        // Group results by medicine
        $grouped = [];
        foreach ($rawReport as $row) {
            $grouped[$row->medicine_name][$row->month] = [
                'received' => $row->received,
                'out' => $row->out,
            ];
        }

        // Build final result: for each medicine, for each month, fill missing months with zeros and calculate running quantity
        $report = [];
        foreach ($allMedicines as $medicine) {
            $medicineRow = ['medicine_name' => $medicine];

            // Get initial stock before the selected year, INCLUDING INITIAL_STOCK
            $initialStock = DB::table('stock_ledger')
                ->join('medicines', 'stock_ledger.medicine_id', '=', 'medicines.id')
                ->where('medicines.name', $medicine)
                ->where('stock_ledger.transaction_date', '<', $year . '-01-01')
                ->selectRaw('SUM(
        CASE WHEN stock_ledger.transaction_type IN ("IN_NEW_BATCH","ADJUST_ADD","INITIAL_STOCK") THEN stock_ledger.quantity_change
             WHEN stock_ledger.transaction_type IN ("' . implode('","', $outTypes) . '") THEN -ABS(stock_ledger.quantity_change)
             ELSE 0 END
    ) as qty')
                ->value('qty') ?? 0;

            $runningQty = $initialStock;

            foreach ($months as $num => $name) {
                $received = (int) ($grouped[$medicine][$num]['received'] ?? 0);
                $out = (int) ($grouped[$medicine][$num]['out'] ?? 0);
                $runningQty += $received - $out;

                $medicineRow['months'][] = [
                    'month' => $name,
                    'received' => $received,
                    'out' => $out,
                    'quantity' => $runningQty,
                ];
            }
            $report[] = $medicineRow;
        }

        return response()->json($report);
    }
}
