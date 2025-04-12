<?php

namespace App\Console\Commands;

use App\Models\Batch;
use App\Models\Product;
use App\Models\User;
use App\Notifications\ExpiryWarningNotification;
use App\Notifications\LowStockNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification; // Use Facade for flexibility

class SendTestNotification extends Command
{
    /**
     * The name and signature of the console command.
     * Example: php artisan notification:test low-stock --user=1 --product=5
     * Example: php artisan notification:test expiry --user=1 --batch=10
     *
     * @var string
     */
    protected $signature = 'notification:test 
                            {type : The type of notification (low-stock|expiry)} 
                            {--U|user= : The ID of the user to notify (optional, defaults to first admin)} 
                            {--P|product= : The ID of the product (for low-stock)} 
                            {--B|batch= : The ID of the batch (for expiry)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sends a test notification to a user.';

    /**
     * Execute the console command.
     */
    public function handle(): int // Use return type hinting
    {
        $type = $this->argument('type');
        $userId = $this->option('user');
        $productId = $this->option('product');
        $batchId = $this->option('batch');

        // Find the user
        if ($userId) {
            $user = User::find($userId);
        } else {
            // Default to the first admin/superadmin if no user ID is provided
            $user = User::whereHas('role', fn($q) => $q->whereIn('name', ['Admin', 'Superadmin']))->first();
        }

        if (!$user) {
            $this->error('User not found.');
            return self::FAILURE;
        }

        $this->info("Sending notification to user: {$user->name} (ID: {$user->id})");

        try {
            if ($type === 'low-stock') {
                if (!$productId) {
                    $this->error('Product ID (--product) is required for low-stock notification.');
                    return self::FAILURE;
                }
                $product = Product::find($productId);
                if (!$product) {
                    $this->error("Product with ID {$productId} not found.");
                    return self::FAILURE;
                }
                $notification = new LowStockNotification($product);
                $user->notify($notification); // Or Notification::send($user, $notification);
                $this->info("LowStockNotification sent for Product ID: {$product->id}.");
            } elseif ($type === 'expiry') {
                if (!$batchId) {
                    $this->error('Batch ID (--batch) is required for expiry notification.');
                    return self::FAILURE;
                }
                $batch = Batch::find($batchId);
                if (!$batch) {
                    $this->error("Batch with ID {$batchId} not found.");
                    return self::FAILURE;
                }
                $notification = new ExpiryWarningNotification($batch);
                $user->notify($notification); // Or Notification::send($user, $notification);
                $this->info("ExpiryWarningNotification sent for Batch ID: {$batch->id}.");
            } else {
                $this->error("Invalid notification type '{$type}'. Use 'low-stock' or 'expiry'.");
                return self::FAILURE;
            }
        } catch (\Exception $e) {
            $this->error("Failed to send notification: " . $e->getMessage());
            return self::FAILURE;
        }


        return self::SUCCESS;
    }
}
