<?php

namespace App\Notifications;

use App\Models\Medicine;
use App\Models\User; // Import User model
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log; // Import Log facade

class LowStockNotification extends Notification implements ShouldQueue // Implement ShouldQueue for background processing
{
    use Queueable;

    public Medicine $medicine;
    public int $currentStock;

    /**
     * Create a new notification instance.
     */
    public function __construct(Medicine $medicine)
    {
        $this->medicine = $medicine;
        // Eager load batches to calculate total stock efficiently if not already loaded
        $this->medicine->loadMissing('batches');
        $this->currentStock = $this->medicine->totalStock; // Use the accessor
        Log::info("LowStockNotification created for Medicine ID: {$medicine->id} with stock: {$this->currentStock}"); // Add logging
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // Send via email and store in the database
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $threshold = $this->medicine->stock_alert_threshold ?? config('inventory.default_stock_alert_threshold', 5); // Use medicine specific or default threshold

        return (new MailMessage)
            ->subject('Low Stock Alert: ' . $this->medicine->name)
            ->line("Warning: The stock for medicine '{$this->medicine->name}' (ID: {$this->medicine->id}) is low.")
            ->line("Current Stock: {$this->currentStock}")
            ->line("Alert Threshold: {$threshold}")
            ->action('View Medicine', route('medicines.show', $this->medicine)) // Link to the medicine page
            ->line('Please restock soon.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $threshold = $this->medicine->stock_alert_threshold ?? config('inventory.default_stock_alert_threshold', 5);

        // Data to be stored in the notifications table
        return [
            'medicine_id' => $this->medicine->id,
            'medicine_name' => $this->medicine->name,
            'current_stock' => $this->currentStock,
            'stock_threshold' => $threshold,
            'message' => "Stock for '{$this->medicine->name}' is low ({$this->currentStock}/{$threshold}). Please restock.",
            'action_url' => route('medicines.show', $this->medicine), // Include relevant URL
        ];
    }
}
