<?php

namespace App\Console\Commands;

// Removed: use App\Events\NewNotificationEvent;
use App\Models\Batch;
use App\Models\Medicine;
use App\Models\Role;
use App\Models\User;
use App\Notifications\ExpiryWarningNotification; // Added
use App\Notifications\LowStockNotification;         // Added
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification; // Added Notification facade

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
    protected $description = 'Check for low stock and expiring medicines and send notifications to admins';

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

            return self::SUCCESS;
        }

        $lowStockThreshold = config('inventory.low_stock_threshold', 10); // Default threshold

        // --- Check for Low Stock ---
        $this->info('Checking for low stock medicines...');
        // Fetch medicines and calculate total stock across batches
        $potentiallyLowStock = Medicine::whereHas('batches', function ($q) {
            $q->where('current_quantity', '>', 0); // Only consider batches with stock
        })
            ->withSum('batches as current_total_stock', 'current_quantity')
            ->get();

        // Filter medicines whose total stock is at or below their threshold
        $lowStockMedicines = $potentiallyLowStock->filter(function ($medicine) use ($lowStockThreshold) {
            $threshold = $medicine->low_stock_threshold ?? $lowStockThreshold; // Use specific or default threshold

            return $medicine->current_total_stock !== null && $medicine->current_total_stock <= $threshold;
        });

        if ($lowStockMedicines->isNotEmpty()) {
            $this->info("Found {$lowStockMedicines->count()} low stock medicines. Notifying admins...");
            foreach ($lowStockMedicines as $medicine) {
                $threshold = $medicine->low_stock_threshold ?? $lowStockThreshold;

                // Optional: Add logic here to prevent sending the *same* notification too frequently
                // (e.g., check the last notification time for this medicine)

                // Send the LowStockNotification to all admins
                Notification::send($admins, new LowStockNotification($medicine, $threshold));
                Log::info("Sent LowStockNotification for Medicine ID: {$medicine->id} (Stock: {$medicine->current_total_stock}, Threshold: {$threshold}) to relevant admins.");
            }
        } else {
            $this->info('No low stock medicines found.');
        }

        // --- Check for Expiring Batches ---
        $this->info('Checking for expiring batches...');
        $warningDays = config('inventory.expiry_warning_days', 30); // Default warning period
        $expiryThresholdDate = Carbon::now()->addDays($warningDays);

        $expiringBatches = Batch::with('medicine') // Eager load medicine
            ->where('current_quantity', '>', 0)
            ->whereDate('expiry_date', '<=', $expiryThresholdDate)
            ->whereDate('expiry_date', '>', Carbon::now()) // Ensure it hasn't already expired
            ->get();

        if ($expiringBatches->isNotEmpty()) {
            $this->info("Found {$expiringBatches->count()} expiring batches. Notifying admins...");
            foreach ($expiringBatches as $batch) {
                // Ensure medicine relationship is loaded (though `with` should handle this)
                if (! $batch->relationLoaded('medicine') && $batch->medicine_id) {
                    $batch->load('medicine');
                }

                // Optional: Add logic here to prevent sending the *same* expiry notification too frequently
                // (e.g., check the last notification time for this batch)

                // Send the ExpiryWarningNotification to all admins
                Notification::send($admins, new ExpiryWarningNotification($batch));
                $expiryDateFormatted = Carbon::parse($batch->expiry_date)->format('Y-m-d');
                Log::info("Sent ExpiryWarningNotification for Batch ID: {$batch->id} (Expires: {$expiryDateFormatted}) to relevant admins.");
            }
        } else {
            $this->info('No expiring batches found within the warning period.');
        }

        $this->info('Inventory notification check completed.');
        Log::info('CheckInventoryNotifications command finished.');

        return self::SUCCESS;
    }
}
