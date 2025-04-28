<?php

namespace App\Notifications;

use App\Models\Batch;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage; // Import BroadcastMessage
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;

class ExpiryWarningNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Batch $batch;

    /**
     * Create a new notification instance.
     */
    public function __construct(Batch $batch)
    {
        $this->batch = $batch;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // Add 'broadcast' to the channels
        return ['database', 'broadcast'];
    }

    /**
     * Get the array representation for database storage.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $medicineName = $this->batch->medicine->name ?? 'N/A';
        $expiryDateFormatted = Carbon::parse($this->batch->expiry_date)->format('Y-m-d');

        // This data goes into the 'data' column in the database
        return [
            'batch_id' => $this->batch->id,
            'batch_number' => $this->batch->batch_number,
            'medicine_name' => $medicineName,
            'expiry_date' => $expiryDateFormatted,
            'current_quantity' => $this->batch->current_quantity,
            'message' => "Expiry warning: Batch #{$this->batch->batch_number} of '{$medicineName}' expires on {$expiryDateFormatted}.",
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     * This data is sent via Pusher/Echo.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        $medicineName = $this->batch->medicine->name ?? 'N/A';
        $expiryDateFormatted = Carbon::parse($this->batch->expiry_date)->format('Y-m-d');

        // Structure the data specifically for your frontend toast
        return new BroadcastMessage([
            'type' => 'expiry_warning', // Add a type identifier for frontend logic
            'medicine_name' => $medicineName,
            'batch_number' => $this->batch->batch_number,
            'expiry_date' => $expiryDateFormatted,
            'message' => "Expiring soon: '{$medicineName}' Batch #{$this->batch->batch_number} on {$expiryDateFormatted}.",
            // Include any other data your frontend needs
        ]);
    }

    /**
     * Define the event name for broadcasting.
     * Optional: If not defined, Laravel uses BroadcastNotificationCreated.
     */
    public function broadcastType(): string
    {
        return 'inventory.expiry_warning';
    }
}
