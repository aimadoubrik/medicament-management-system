<?php

namespace App\Notifications;

use App\Models\Medicine;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class LowStockNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Medicine $medicine;
    public int $lowStockThreshold;

    /**
     * Create a new notification instance.
     */
    public function __construct(Medicine $medicine, int $lowStockThreshold)
    {
        $this->medicine = $medicine;
        $this->lowStockThreshold = $lowStockThreshold;
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
        // This data goes into the 'data' column in the database
        return [
            'medicine_id' => $this->medicine->id,
            'medicine_name' => $this->medicine->name,
            'current_stock' => $this->medicine->current_total_stock,
            'threshold' => $this->lowStockThreshold,
            'message' => "Low stock alert: '{$this->medicine->name}' is at {$this->medicine->current_total_stock} units (threshold: {$this->lowStockThreshold})."
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     * This data is sent via Pusher/Echo.
     *
     * @param  object  $notifiable
     * @return \Illuminate\Notifications\Messages\BroadcastMessage
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        // Structure the data specifically for your frontend toast
        // The 'toArray' data is automatically included by default,
        // but defining it explicitly gives more control.
        return new BroadcastMessage([
            'type' => 'low_stock', // Add a type identifier for frontend logic
            'medicine_name' => $this->medicine->name,
            'current_stock' => $this->medicine->current_total_stock,
            'threshold' => $this->lowStockThreshold,
            'message' => "Low stock: '{$this->medicine->name}' ({$this->medicine->current_total_stock}/{$this->lowStockThreshold}).",
            // Include any other data your frontend needs for the toast
        ]);
    }

    /**
     * Define the event name for broadcasting.
     * Optional: If not defined, Laravel uses BroadcastNotificationCreated.
     * You might want a custom event name for easier frontend listening.
     *
     * @return string
     */
    public function broadcastType(): string
    {
        return 'inventory.low_stock';
    }
}