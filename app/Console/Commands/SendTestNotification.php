<?php

namespace App\Console\Commands;

use App\Events\NewNotificationEvent; // Event for real-time
use App\Models\Batch;
use App\Models\Medicine;
use App\Models\User;
use App\Notifications\ExpiryWarningNotification; // Notification for DB/Mail
use App\Notifications\LowStockNotification;    // Notification for DB/Mail
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
// Add Notification facade back if preferred, or use $user->notify()
// use Illuminate\Support\Facades\Notification;

class SendTestNotification extends Command
{
    /**
     * The name and signature of the console command.
     * Example: php artisan notification:test low-stock --user=1 --medicine=5
     * Example: php artisan notification:test expiry --user=1 --batch=10
     *
     * @var string
     */
    protected $signature = 'notification:test
                            {type : The type of notification (low-stock|expiry)}
                            {--U|user= : The ID of the user to notify (required)}
                            {--P|medicine= : The ID of the medicine (for low-stock)}
                            {--B|batch= : The ID of the batch (for expiry)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sends a test real-time UI event AND a database notification to a specific user.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $type = $this->argument('type');
        $userId = $this->option('user');
        $medicineId = $this->option('medicine');
        $batchId = $this->option('batch');

        if (!$userId) {
            $this->error('User ID (--user) is required.');
            return self::FAILURE;
        }

        $user = User::find($userId);
        if (!$user) {
            $this->error("User with ID {$userId} not found.");
            return self::FAILURE;
        }

        $this->info("Processing test notification for user: {$user->name} (ID: {$user->id})");

        $message = '';
        $messageType = 'info';
        $databaseNotification = null;

        try {
            if ($type === 'low-stock') {
                if (!$medicineId) {
                    $this->error('Medicine ID (--medicine) is required for low-stock type.');
                    return self::FAILURE;
                }
                $medicine = Medicine::find($medicineId);
                if (!$medicine) {
                    $this->error("Medicine with ID {$medicineId} not found.");
                    return self::FAILURE;
                }
                // Prepare data for both event and notification
                $threshold = $medicine->low_stock_threshold ?? config('inventory.default_stock_alert_threshold', 5);
                $currentStock = $medicine->totalStock; // Assuming accessor exists
                $message = "TEST: Low stock for '{$medicine->name}' ({$currentStock}/{$threshold}).";
                $messageType = 'warning';
                $databaseNotification = new LowStockNotification($medicine); // Prepare DB notification

                $this->info("Dispatching Event and sending DB Notification (Low Stock)...");
            } elseif ($type === 'expiry') {
                if (!$batchId) {
                    $this->error('Batch ID (--batch) is required for expiry type.');
                    return self::FAILURE;
                }
                $batch = Batch::with('medicine')->find($batchId);
                if (!$batch) {
                    $this->error("Batch with ID {$batchId} not found.");
                    return self::FAILURE;
                }
                // Prepare data for both event and notification
                $medicineName = $batch->medicine->name ?? 'N/A';
                $expiryDateFormatted = optional($batch->expiry_date)->format('Y-m-d') ?? 'N/A';
                $message = "TEST: Batch #{$batch->batch_number} of '{$medicineName}' expires on {$expiryDateFormatted}.";
                $messageType = 'warning';
                $databaseNotification = new ExpiryWarningNotification($batch); // Prepare DB notification

                $this->info("Dispatching Event and sending DB Notification (Expiry Warning)...");
            } else {
                $this->error("Invalid notification type '{$type}'. Use 'low-stock' or 'expiry'.");
                return self::FAILURE;
            }

            // --- Perform both actions ---

            // 1. Dispatch the real-time event via Reverb
            Log::info("Dispatching NewNotificationEvent: UserID={$user->id}, Type='{$messageType}', Msg='{$message}'");
            NewNotificationEvent::dispatch($message, $messageType, $user->id);
            $this->info("-> NewNotificationEvent dispatched.");

            // 2. Send the database notification
            if ($databaseNotification) {
                Log::info("Sending Database Notification: UserID={$user->id}, NotificationClass=" . get_class($databaseNotification));
                $user->notify($databaseNotification->onQueue('notifications')); // Ensure it uses the queue if desired
                $this->info("-> Database notification sent.");
            }
            // --- ---

        } catch (\Exception $e) {
            $this->error("Failed processing notification: " . $e->getMessage());
            Log::error("Error in SendTestNotification command: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            return self::FAILURE;
        }

        $this->info("Test notification processing complete for User ID: {$user->id}.");
        return self::SUCCESS;
    }
}
