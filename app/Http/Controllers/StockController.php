<?php

namespace App\Http\Controllers;

use App\Enums\StockTransactionType; // Import your Enum
use App\Exceptions\InsufficientStockException; // Your new unified request
use App\Http\Requests\HandleStockTransactionRequest; // For batch metadata updates
use App\Http\Requests\UpdateBatchRequest;
use App\Models\Batch;
use App\Models\Medicine;
use App\Models\Supplier;
use App\Models\User;
use App\Services\StockManagementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia; // Your custom exception

class StockController extends Controller
{
    protected $stockManagementService;

    public function __construct(StockManagementService $stockManagementService)
    {
        $this->stockManagementService = $stockManagementService;

        // It's good practice to apply authorization here or via route definitions
        // Example:
        // $this->middleware('auth'); // Ensure user is authenticated
        // $this->authorizeResource(Batch::class, 'batch'); // If using resource controller & policies
        // Or per method:
        // $this->middleware('can:viewAny,App\Models\Batch')->only('index');
        // $this->middleware('can:create,App\Models\Batch')->only('handleTransaction'); // Assuming 'create' covers new batch via transaction
        // $this->middleware('can:update,batch')->only('update'); // 'batch' here is the route parameter name
        // $this->middleware('can:delete,batch')->only('destroy');
    }

    /**
     * Display a listing of the resource with server-side processing.
     */
    public function index(Request $request)
    {
        $validatedIndexRequest = $request->validate([
            'page' => 'sometimes|integer|min:1',
            'perPage' => 'sometimes|integer|min:1|max:100',
            'sort' => 'nullable|string|max:50',
            'direction' => 'nullable|string|in:asc,desc',
            'filter' => 'nullable|string|max:100',
            'filterBy' => 'nullable|string|in:medicine_name,supplier_name,batch_number,expiry_date', // Be explicit
            'expiry_from' => 'nullable|date_format:Y-m-d',
            'expiry_to' => 'nullable|date_format:Y-m-d|after_or_equal:expiry_from',
        ]);

        $query = Batch::query()
            ->leftJoin('medicines', 'batches.medicine_id', '=', 'medicines.id')
            ->leftJoin('suppliers', 'batches.supplier_id', '=', 'suppliers.id')
            ->select('batches.*', 'medicines.name as medicine_name', 'suppliers.name as supplier_name');

        $filterValue = $validatedIndexRequest['filter'] ?? null;
        $filterColumn = $validatedIndexRequest['filterBy'] ?? 'medicine_name';

        if ($filterValue) {
            if ($filterColumn === 'medicine_name') {
                $query->whereHas('medicine', fn ($q) => $q->where('name', 'like', "%{$filterValue}%"));
            } elseif ($filterColumn === 'supplier_name') {
                $query->whereHas('supplier', fn ($q) => $q->where('name', 'like', "%{$filterValue}%"));
            } elseif (Schema::hasColumn('batches', $filterColumn)) { // e.g., batch_number
                $query->where($filterColumn, 'like', "%{$filterValue}%");
            }
        }

        $query->when($validatedIndexRequest['expiry_from'] ?? null, fn ($q, $date) => $q->where('expiry_date', '>=', $date));
        $query->when($validatedIndexRequest['expiry_to'] ?? null, fn ($q, $date) => $q->where('expiry_date', '<=', $date));

        $sortColumn = $validatedIndexRequest['sort'] ?? 'expiry_date';
        $sortDirection = $validatedIndexRequest['direction'] ?? 'asc';

        // Whitelist sortable columns for security and clarity
        $allowedSortColumns = array_merge(
            Schema::getColumnListing('batches'),
            ['medicine_name', 'supplier_name']
        );

        if ($sortColumn && in_array($sortColumn, $allowedSortColumns)) {
            $query->orderBy($sortColumn, $sortDirection);
        } else {
            $query->orderBy('expiry_date', 'asc');
        }

        $perPage = $validatedIndexRequest['perPage'] ?? 10;
        $batches = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Stock/Index', [
            'batches' => $batches,
            'filters' => $validatedIndexRequest,
            'medicines' => Medicine::select('id', 'name', 'dosage')->orderBy('name')->get(),
            'suppliers' => Supplier::select('id', 'name')->orderBy('name')->get(),
            'transactionTypes' => StockTransactionType::asSelectArray(), // For the unified transaction modal
        ]);
    }

    /**
     * Handle various stock transactions.
     */
    public function handleTransaction(HandleStockTransactionRequest $request)
    {
        Log::info('Handling stock transaction.', ['user_id' => Auth::id(), 'request_data' => $request->all()]);
        $validatedData = $request->validated();
        $user = $request->user(); // Or Auth::user() if middleware ensures authentication

        // The Form Request (HandleStockTransactionRequest) handles validation.
        // If validation fails, Laravel automatically redirects back with errors.
        // Thus, we only reach here if validation passes.

        try {
            // It's good practice for the service method to handle its own DB transaction
            // if it performs multiple database operations. If not, wrap it here.
            // Assuming StockManagementService->processTransaction handles its own atomicity.
            $result = $this->stockManagementService->processTransaction($validatedData, $user);

            $successMessage = $result['message'] ?? 'Transaction processed successfully.';

            return redirect()->route('stock.index')->with('success', $successMessage);
        } catch (InsufficientStockException $e) {
            // The form request key for quantity is 'quantity_change_input'
            return back()->withErrors(['quantity_change_input' => $e->getMessage()])->withInput();
        } catch (\Illuminate\Database\QueryException $e) { // More specific DB errors
            Log::error('Stock transaction database error: '.$e->getMessage(), ['sql' => $e->getSql(), 'bindings' => $e->getBindings(), 'request_data' => $validatedData]);

            return back()->with('error', 'A database error occurred. Please try again.')->withInput();
        } catch (\Exception $e) {
            Log::error('Stock transaction failed: '.$e->getMessage(), [
                'file' => $e->getFile().':'.$e->getLine(),
                'request_data' => $validatedData,
                // 'trace' => $e->getTraceAsString(), // Optionally log trace for non-production
            ]);

            return back()->with('error', 'An unexpected error occurred: '.$e->getMessage())->withInput();
        }
    }

    /**
     * Update the specified batch's metadata in storage.
     * This should NOT be used for quantity adjustments.
     */
    public function update(UpdateBatchRequest $request, Batch $batch)
    {
        // Consider authorization: $this->authorize('update', $batch);
        $validatedData = $request->validated();

        if (empty($validatedData)) {

            Log::warning('No changes were provided to update.', ['batch_id' => $batch->id, 'user_id' => Auth::id()]);

            return redirect()->route('stock.index')->with('info', 'No changes were provided to update.');
        }

        // Explicitly prevent direct updates to quantity fields through this metadata update method
        if (isset($validatedData['quantity_received']) || isset($validatedData['current_quantity'])) {

            Log::warning('Redirecting back with error message.', ['batch_id' => $batch->id, 'user_id' => Auth::id()]);

            // You could choose to return an error or just ignore these fields
            return redirect()->back()->withErrors(['message' => 'Quantity fields cannot be updated here. Please use a stock transaction.'])->withInput();
        }

        try {
            $batch->update($validatedData);

            Log::info('Batch metadata updated successfully.', ['batch_id' => $batch->id, 'user_id' => Auth::id()]);

            return redirect()->route('stock.index')->with('success', 'Batch metadata updated successfully.');
        } catch (\Exception $e) {
            Log::error('Batch metadata update failed: '.$e->getMessage(), ['batch_id' => $batch->id]);

            return redirect()->back()->withInput()->with('error', 'An error occurred while updating batch metadata.');
        }
    }

    /**
     * Remove the specified batch from storage (soft delete).
     */
    public function destroy(Batch $batch)
    {
        // Consider authorization: $this->authorize('delete', $batch);
        $message = '';

        try {
            if ($batch->current_quantity > 0) {
                // Log a final disposal transaction before deleting if stock exists
                Log::info("Attempting to delete batch {$batch->id} with current stock {$batch->current_quantity}. Performing disposal first.");
                $this->stockManagementService->processTransaction([
                    'transaction_type' => StockTransactionType::DISPOSAL_DAMAGED->value, // Or a more specific "DISPOSAL_ON_DELETE"
                    'medicine_id' => $batch->medicine_id,
                    'batch_id' => $batch->id,
                    'quantity_change_input' => $batch->current_quantity,
                    'notes' => 'System disposal: Batch record deleted with remaining stock of '.$batch->current_quantity.' units.',
                    'transaction_date' => now()->toDateTimeString(), // Explicitly set transaction date
                ], Auth::user() ?? User::first() /* Fallback user if needed for system actions, ensure this is handled */);

                // Verify stock is now zero before proceeding (optional safety check)
                $batch->refresh(); // Get the latest state after service call
                if ($batch->current_quantity > 0) {
                    throw new \Exception("Failed to zero out stock for batch {$batch->id} before deletion.");
                }
                $message = 'Batch stock zeroed out and record deleted successfully.';
            } else {
                $message = 'Batch with zero stock deleted successfully.';
            }

            $batch->delete(); // Soft delete

            if (request()->wantsJson()) {
                return response()->json(['message' => $message]);
            }

            return redirect()->route('stock.index')->with('success', $message);
        } catch (InsufficientStockException $e) { // Should not happen if logic is correct for disposal
            Log::error('Insufficient stock during batch deletion disposal: '.$e->getMessage(), ['batch_id' => $batch->id]);

            return redirect()->route('stock.index')->with('error', 'Error during pre-deletion stock disposal: '.$e->getMessage());
        } catch (\Exception $e) {
            Log::error("Batch deletion failed for batch {$batch->id}: ".$e->getMessage());

            return redirect()->route('stock.index')->with('error', 'Could not delete batch: '.$e->getMessage());
        }
    }
}
