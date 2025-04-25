<?php

namespace App\Console\Commands;

use App\Events\NewNotificationEvent;
use App\Models\Batch;
use App\Models\Medicine;
use App\Models\Role;
// Remove direct Notification imports if they are only handled by listeners now
// use App\Notifications\ExpiryWarningNotification;
// use App\Notifications\LowStockNotification;
use App\Models\User;
use Illuminate\Console\Command;
// Remove direct Notification facade import if not used here anymore
// use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log; // <-- Keep this for broadcasting

class CheckInventoryNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inventory:check-notifications';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for low stock and expiring medicines and dispatch real-time notifications to admins';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking inventory notifications...');
        Log::info('Running CheckInventoryNotifications command...');

        // Find Admin and Superadmin users
        $adminRoles = Role::whereIn('name', ['admin', 'superadmin'])->pluck('id');
        $admins = User::whereIn('role_id', $adminRoles)->get();

        if ($admins->isEmpty()) {
            $this->warn('No Admin or Superadmin users found. Skipping notification checks.');
            Log::warning('CheckInventoryNotifications: No Admin/Superadmin users found.');

            return self::SUCCESS; // Use Command constants
        }

        $lowStockThreshold = config('inventory.low_stock_threshold', 10); // Use configured threshold or default to 10

        // --- Check for Low Stock ---
        $this->info('Checking for low stock medicines...');
        // Adjust the query if the Medicine model's lowStock scope is fixed,
        // otherwise, fetch medicines and check stock manually for now.
        // Example: Fetching all potentially low stock and checking manually
        $potentiallyLowStock = Medicine::whereHas('batches', function ($q) {
            $q->where('current_quantity', '>', 0); // Only consider batches with stock
        })
            ->withSum('batches as current_total_stock', 'current_quantity')
            ->get();

        $lowStockMedicines = $potentiallyLowStock->filter(function ($medicine) use ($lowStockThreshold) {
            // Use the actual threshold from the medicine if available, otherwise the default
            $threshold = $medicine->low_stock_threshold ?? $lowStockThreshold;

            return $medicine->current_total_stock !== null && $medicine->current_total_stock <= $threshold;
        });

        if ($lowStockMedicines->isNotEmpty()) {
            $this->info("Found {$lowStockMedicines->count()} low stock medicines. Notifying admins...");
            foreach ($lowStockMedicines as $medicine) {
                $threshold = $medicine->low_stock_threshold ?? $lowStockThreshold;
                $message = "Low stock: '{$medicine->name}' ({$medicine->current_total_stock}/{$threshold}).";
                $type = 'warning'; // Or a more specific type like 'low_stock'

                // Optional: Add logic here to prevent sending the *same* notification too frequently

                foreach ($admins as $admin) {
                    Log::info("Dispatching Low Stock Event to User ID: {$admin->id} for Medicine ID: {$medicine->id}");
                    // Dispatch the event to the specific admin's private channel
                    NewNotificationEvent::dispatch($message, $type, $admin->id);
                }

                // If you still need Mail/DB notifications, ensure an Event Listener
                // is set up to listen for NewNotificationEvent (or a more specific event)
                // and send the LowStockNotification from there.
                // Example: event(new StockLevelLow($medicine, $admins));
            }
        } else {
            $this->info('No low stock medicines found.');
        }

        // --- Check for Expiring Batches ---
        $this->info('Checking for expiring batches...');
        $warningDays = config('inventory.expiry_warning_days', 30);
        $expiryThresholdDate = Carbon::now()->addDays($warningDays);

        $expiringBatches = Batch::with('medicine') // Eager load medicine
            ->where('current_quantity', '>', 0) // Use current_quantity
            ->whereDate('expiry_date', '<=', $expiryThresholdDate)
            ->whereDate('expiry_date', '>', Carbon::now()) // Ensure it hasn't already expired
            ->get();

        if ($expiringBatches->isNotEmpty()) {
            $this->info("Found {$expiringBatches->count()} expiring batches. Notifying admins...");
            foreach ($expiringBatches as $batch) {
                // Ensure medicine relationship is loaded
                if (! $batch->relationLoaded('medicine')) {
                    $batch->load('medicine');
                }
                $medicineName = $batch->medicine->name ?? 'N/A'; // Handle potential missing medicine relation
                $expiryDateFormatted = Carbon::parse($batch->expiry_date)->format('Y-m-d');
                $message = "Expiring soon: '{$medicineName}' Batch #{$batch->batch_number} on {$expiryDateFormatted}.";
                $type = 'warning'; // Or 'expiry_warning'

                // Optional: Add logic to prevent sending the *same* expiry notification too frequently.

                foreach ($admins as $admin) {
                    Log::info("Dispatching Expiry Warning Event to User ID: {$admin->id} for Batch ID: {$batch->id}");
                    // Dispatch the event to the specific admin's private channel
                    NewNotificationEvent::dispatch($message, $type, $admin->id);
                }

                // Again, handle Mail/DB notifications via a separate Event Listener if needed.
                // Example: event(new BatchExpiringSoon($batch, $admins));
            }
        } else {
            $this->info('No expiring batches found within the warning period.');
        }

        $this->info('Inventory notification check completed.');
        Log::info('CheckInventoryNotifications command finished.');

        return self::SUCCESS;
    }
}
