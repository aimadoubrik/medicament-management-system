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
        // Eager load medicine relationship if needed elsewhere
        $this->batch->loadMissing('medicine');
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
        $medicineName = $this->batch->medicine->name ?? 'N/A'; // Handle potential missing medicine relation

        return (new MailMessage)
            ->subject('Medicine Expiry Warning: '.$medicineName)
            ->line("Warning: A batch of medicine '{$medicineName}' (Batch number: {$this->batch->batch_number}) is expiring soon.")
            ->line("Expiry Date: {$expiryDate}")
            ->line("Quantity in Batch: {$this->batch->current_quantity}")
            ->action('View Medicine Batches', route('medicines.show', $this->batch->medicine_id)) // Adjust route as needed
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
        $medicineName = $this->batch->medicine->name ?? 'N/A';

        // Data to be stored in the notifications table
        return [
            'batch_id' => $this->batch->id,
            'batch_number' => $this->batch->batch_number,
            'medicine_id' => $this->batch->medicine_id,
            'medicine_name' => $medicineName,
            'expiry_date' => $expiryDate,
            'current_quantity' => $this->batch->current_quantity,
            'message' => "Batch #{$this->batch->batch_number} of '{$medicineName}' expires on {$expiryDate}.",
            'action_url' => route('medicines.show', $this->batch->medicine_id), // Adjust route as needed
        ];
    }
}
