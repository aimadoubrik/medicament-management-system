<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Batch;
use App\Http\Requests\StoreSaleRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Notification;

use App\Notifications\LowStockNotification;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $sales = Sale::with(['items.product', 'items.batch'])
            ->when($request->search, function ($query, $search) {
                $query->where('reference', 'like', "%{$search}%");
            })
            ->when($request->date_from, function ($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($request->date_to, function ($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Sales/Index', [
            'sales' => $sales,
            'filters' => $request->only(['search', 'date_from', 'date_to'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Sales/Create', [
            'products' => \App\Models\Product::with(['batches' => function ($query) {
                $query->where('quantity', '>', 0);
            }])->get()
        ]);
    }

    public function store(StoreSaleRequest $request)
    {
        try {
            $result = DB::transaction(function () use ($request) {
                $sale = Sale::create([
                    'reference' => 'SALE-' . time(),
                    'user_id' => Auth::id(),
                ]);

                foreach ($request->items as $item) {
                    $batch = Batch::findOrFail($item['batch_id']);
                    
                    if ($batch->quantity < $item['quantity']) {
                        throw new \Exception("Insufficient quantity for batch #{$batch->id}");
                    }

                    $sale->items()->create([
                        'product_id' => $item['product_id'],
                        'batch_id' => $item['batch_id'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'subtotal' => $item['quantity'] * $item['unit_price']
                    ]);

                    $batch->decrement('quantity', $item['quantity']);

                    // Check for low stock notification
                    if ($batch->quantity <= $batch->reorder_point) {
                        // Send low stock notification
                        Notification::send($batch->product->user, new LowStockNotification($batch->product, $batch->quantity));
                    }
                }

                return $sale;
            });

            return redirect()->route('sales.show', $result)
                ->with('success', 'Sale completed successfully.');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error processing sale: ' . $e->getMessage());
        }
    }

    public function show(Sale $sale)
    {
        $sale->load(['items.product', 'items.batch', 'user']);
        
        return Inertia::render('Sales/Show', [
            'sale' => $sale
        ]);
    }
}
