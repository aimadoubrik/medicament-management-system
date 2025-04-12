<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSaleRequest;
use App\Models\Batch;
use App\Models\Product;
use App\Models\Role; // Import Role model
use Illuminate\Support\Facades\Auth;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User; // Import User model
use App\Notifications\LowStockNotification;
use Illuminate\Database\QueryException; // Import QueryException
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification; // Import Notification facade
use Inertia\Inertia;

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


    public function show(Sale $sale)
    {
        $sale->load(['items.product', 'items.batch', 'user']);

        return Inertia::render('Sales/Show', [
            'sale' => $sale
        ]);
    }

    public function store(StoreSaleRequest $request)
    {
        $validated = $request->validated();

        DB::beginTransaction();
        try {
            // Create the sale record
            $sale = Sale::create([
                'user_id' => Auth::id(), // Associate sale with the logged-in user
                'total_amount' => 0, // Calculate later
                'total_amount' => 0, // Calculate later
                'sale_date' => now(),
                // Add other relevant sale fields if any (e.g., customer_id)
            ]);

            $totalSaleAmount = 0;

            foreach ($validated['sale_items'] as $item) {
                $product = Product::with('batches')->findOrFail($item['product_id']);
                $quantityToSell = $item['quantity'];

                // Check overall stock first (optional but good practice)
                if ($product->totalStock < $quantityToSell) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }

                // Implement FIFO (First-In, First-Out) logic for batches
                $batches = $product->batches()
                    ->where('quantity', '>', 0)
                    ->whereDate('expiry_date', '>', now()) // Only sell from non-expired batches
                    ->orderBy('expiry_date', 'asc') // Or orderBy('created_at', 'asc') for true FIFO
                    ->get();

                $soldQuantity = 0;
                foreach ($batches as $batch) {
                    if ($soldQuantity >= $quantityToSell) {
                        break;
                    }

                    $quantityFromThisBatch = min($quantityToSell - $soldQuantity, $batch->quantity);

                    if ($quantityFromThisBatch > 0) {
                        $batch->decrement('quantity', $quantityFromThisBatch);
                        $soldQuantity += $quantityFromThisBatch;

                        // Create Sale Item linked to this batch
                        SaleItem::create([
                            'sale_id' => $sale->id,
                            'batch_id' => $batch->id, // Link sale item to the specific batch
                            'product_id' => $product->id,
                            'quantity' => $quantityFromThisBatch,
                            'unit_price' => $item['price'], // Use validated price per item
                            'subtotal' => $quantityFromThisBatch * $item['price'],
                        ]);
                        $totalSaleAmount += ($quantityFromThisBatch * $item['price']);
                    }
                }

                // Verify all quantity was sold from available batches
                if ($soldQuantity < $quantityToSell) {
                    // This should theoretically not happen if initial check passed, but good failsafe
                    throw new \Exception("Could not fulfill order for product: {$product->name}. Stock discrepancy.");
                }

                // --- Low Stock Notification Logic ---
                // Refresh product model to get updated total stock
                $product->refresh();
                $threshold = $product->stock_alert_threshold ?? config('inventory.default_stock_alert_threshold', 5);

                Log::info("Checking stock for Product ID: {$product->id}. Current: {$product->totalStock}, Threshold: {$threshold}");

                if ($product->totalStock <= $threshold && $product->totalStock > 0) { // Only notify if stock is low but not zero
                    // Find Admin and Superadmin users
                    $adminRoles = Role::whereIn('name', ['Admin', 'Superadmin'])->pluck('id');
                    $admins = User::whereIn('role_id', $adminRoles)->get();

                    if ($admins->isNotEmpty()) {
                        Log::info("Sending LowStockNotification to {$admins->count()} admins for Product ID: {$product->id}");
                        // Send notification to all admins/superadmins
                        // Queue the notification to avoid blocking the request
                        Notification::send($admins, (new LowStockNotification($product))->onQueue('notifications'));
                    } else {
                        Log::warning("Low stock detected for Product ID: {$product->id}, but no Admin/Superadmin users found to notify.");
                    }
                }
                // --- End Low Stock Notification Logic ---
            }

            // Update the total amount for the sale
            $sale->update(['total_amount' => $totalSaleAmount]);

            DB::commit();

            return redirect()->route('sales.index')->with('success', 'Sale recorded successfully.');
        } catch (QueryException $e) {
            DB::rollBack();
            Log::error('Database error during sale processing: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Database error occurred while recording the sale. Please try again.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error during sale processing: ' . $e->getMessage());
            return back()->withInput()->with('error', 'An error occurred: ' . $e->getMessage());
        }
    }
}
