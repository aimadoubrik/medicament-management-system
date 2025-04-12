<?php

namespace App\Notifications;

use App\Models\Batch;
use App\Models\User; // Import User model
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon; // Import Carbon

class ExpiryWarningNotification extends Notification implements ShouldQueue // Implement ShouldQueue
{
    use Queueable;

    public Batch $batch;

    /**
     * Create a new notification instance.
     */
    public function __construct(Batch $batch)
    {
        $this->batch = $batch;
        // Eager load product relationship if needed elsewhere
        $this->batch->loadMissing('product');
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
        $expiryDate = Carbon::parse($this->batch->expiry_date)->format('Y-m-d');
        $productName = $this->batch->product->name ?? 'N/A'; // Handle potential missing product relation

        return (new MailMessage)
            ->subject('Product Expiry Warning: ' . $productName)
            ->line("Warning: A batch of product '{$productName}' (Batch number: {$this->batch->batch_number}) is expiring soon.")
            ->line("Expiry Date: {$expiryDate}")
            ->line("Quantity in Batch: {$this->batch->quantity}")
            ->action('View Product Batches', route('products.show', $this->batch->product_id)) // Adjust route as needed
            ->line('Please take appropriate action.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $expiryDate = Carbon::parse($this->batch->expiry_date)->format('Y-m-d');
        $productName = $this->batch->product->name ?? 'N/A';

        // Data to be stored in the notifications table
        return [
            'batch_id' => $this->batch->id,
            'batch_number' => $this->batch->batch_number,
            'product_id' => $this->batch->product_id,
            'product_name' => $productName,
            'expiry_date' => $expiryDate,
            'quantity' => $this->batch->quantity,
            'message' => "Batch #{$this->batch->batch_number} of '{$productName}' expires on {$expiryDate}.",
            'action_url' => route('products.show', $this->batch->product_id), // Adjust route as needed
        ];
    }
}
