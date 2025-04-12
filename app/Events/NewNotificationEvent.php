<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewNotificationEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $message;
    public string $type; // e.g., 'info', 'success', 'error'
    public int $userId; // ID of the user to whom the notification is sent

    /**
     * Create a new event instance.
     */
    public function __construct(string $message, string $type = 'info', int $userId = 0, public ?string $databaseNotificationId = null)
    {
        $this->userId = $userId; // Store the user ID for broadcasting
        $this->message = $message;
        $this->type = $type;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('App.Models.User.' . $this->userId), // Broadcast to the authenticated user's private channel
        ];
    }

    /**
     * The event's broadcast name.
     * By default, it uses the class name (NewNotificationEvent).
     * You can customize it if needed.
     */
    // public function broadcastAs(): string
    // {
    //     return 'new-notification';
    // }

    /**
     * Get the data to broadcast.
     * (Optional) Customize the payload. If not defined, public properties are sent.
     */
    // public function broadcastWith(): array
    // {
    //     return [
    //         'notification_message' => $this->message,
    //         'notification_type' => $this->type,
    //         'timestamp' => now()->toDateTimeString(),
    //     ];
    // }
}
