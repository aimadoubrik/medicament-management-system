<?php

namespace App\Console\Commands;

use App\Models\Batch;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use App\Notifications\ExpiryWarningNotification;
use App\Notifications\LowStockNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Carbon; // Import Carbon

class CheckInventoryNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inventory:check-notifications'; // Changed command signature

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for low stock and expiring products and send notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking inventory notifications...');
        Log::info('Running CheckInventoryNotifications command...');

        // Find Admin and Superadmin users
        $adminRoles = Role::whereIn('name', ['Admin', 'Superadmin'])->pluck('id');
        $admins = User::whereIn('role_id', $adminRoles)->get();

        if ($admins->isEmpty()) {
            $this->warn('No Admin or Superadmin users found. Skipping notification checks.');
            Log::warning('CheckInventoryNotifications: No Admin/Superadmin users found.');
            return self::SUCCESS; // Use Command constants
        }

        // --- Check for Low Stock ---
        $this->info('Checking for low stock products...');
        $lowStockProducts = Product::lowStock(config('inventory.low_stock_threshold', 10))->get(); // Use configured threshold or default to 10

        if ($lowStockProducts->isNotEmpty()) {
            $this->info("Found {$lowStockProducts->count()} low stock products. Notifying admins...");
            foreach ($lowStockProducts as $product) {
                // Optional: Add logic here to prevent sending the *same* notification too frequently
                // e.g., check the timestamp of the last 'LowStockNotification' for this product/admin combo.
                Log::info("Dispatching LowStockNotification for Product ID: {$product->id} to {$admins->count()} admins.");
                Notification::send($admins, (new LowStockNotification($product))->onQueue('notifications'));
            }
        } else {
            $this->info('No low stock products found.');
        }


        // --- Check for Expiring Batches ---
        $this->info('Checking for expiring batches...');
        // Define expiry warning period (e.g., 30 days from now)
        $warningDays = config('inventory.expiry_warning_days', 30);
        $expiryThresholdDate = Carbon::now()->addDays($warningDays);

        $expiringBatches = Batch::with('product') // Eager load product
            ->where('quantity', '>', 0)
            ->whereDate('expiry_date', '<=', $expiryThresholdDate)
            ->whereDate('expiry_date', '>', Carbon::now()) // Ensure it hasn't already expired
            ->get();

        if ($expiringBatches->isNotEmpty()) {
            $this->info("Found {$expiringBatches->count()} expiring batches. Notifying admins...");
            foreach ($expiringBatches as $batch) {
                // Optional: Add logic to prevent sending the *same* expiry notification too frequently.
                Log::info("Dispatching ExpiryWarningNotification for Batch ID: {$batch->id} (Product ID: {$batch->product_id}) to {$admins->count()} admins.");
                Notification::send($admins, (new ExpiryWarningNotification($batch))->onQueue('notifications'));
            }
        } else {
            $this->info('No expiring batches found within the warning period.');
        }


        $this->info('Inventory notification check completed.');
        Log::info('CheckInventoryNotifications command finished.');
        return self::SUCCESS;
    }
}
