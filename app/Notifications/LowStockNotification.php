<?php

namespace App\Notifications;

use App\Models\Product;
use App\Models\User; // Import User model
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log; // Import Log facade

class LowStockNotification extends Notification implements ShouldQueue // Implement ShouldQueue for background processing
{
    use Queueable;

    public Product $product;
    public int $currentStock;

    /**
     * Create a new notification instance.
     */
    public function __construct(Product $product)
    {
        $this->product = $product;
        // Eager load batches to calculate total stock efficiently if not already loaded
        $this->product->loadMissing('batches');
        $this->currentStock = $this->product->totalStock; // Use the accessor
        Log::info("LowStockNotification created for Product ID: {$product->id} with stock: {$this->currentStock}"); // Add logging
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
        $threshold = $this->product->stock_alert_threshold ?? config('inventory.default_stock_alert_threshold', 5); // Use product specific or default threshold

        return (new MailMessage)
            ->subject('Low Stock Alert: ' . $this->product->name)
            ->line("Warning: The stock for product '{$this->product->name}' (ID: {$this->product->id}) is low.")
            ->line("Current Stock: {$this->currentStock}")
            ->line("Alert Threshold: {$threshold}")
            ->action('View Product', route('products.show', $this->product)) // Link to the product page
            ->line('Please restock soon.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $threshold = $this->product->stock_alert_threshold ?? config('inventory.default_stock_alert_threshold', 5);

        // Data to be stored in the notifications table
        return [
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'current_stock' => $this->currentStock,
            'stock_threshold' => $threshold,
            'message' => "Stock for '{$this->product->name}' is low ({$this->currentStock}/{$threshold}). Please restock.",
            'action_url' => route('products.show', $this->product), // Include relevant URL
        ];
    }
}
