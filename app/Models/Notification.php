<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids; // <-- Import HasUuids
use Illuminate\Database\Eloquent\Factories\HasFactory;
// Use the base Laravel Notification model if you want standard functionality
// use Illuminate\Notifications\DatabaseNotification;
// Or use a standard Eloquent model if extending DatabaseNotification isn't desired
use Illuminate\Database\Eloquent\Model;

// Option 1: Extend the base DatabaseNotification model (Recommended for standard features)
// class Notification extends \Illuminate\Notifications\DatabaseNotification

// Option 2: Use a standard Model and add necessary parts manually
class Notification extends Model
{
    // If not extending DatabaseNotification, add traits manually
    use HasFactory;
    use HasUuids; // <-- Use the UUID trait

    /**
     * The primary key type.
     *
     * @var string
     */
    protected $keyType = 'string'; // <-- Specify key type for UUIDs

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false; // <-- Disable auto-incrementing for UUIDs

    /**
     * The attributes that are mass assignable.
     * Adjust based on how your listener populates data.
     * Usually 'type' is handled automatically if extending DatabaseNotification.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id', // Allow UUID to be set during creation if needed
        'type', // The class name of the notification (e.g., App\Notifications\LowStock)
        'notifiable_type',
        'notifiable_id',
        'data',
        'read_at',
    ];

    /**
     * The attributes that should be cast.
     * Casting 'data' to 'array' allows you to work with it easily.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'data' => 'array', // <-- Cast the JSON data text column to an array
        'read_at' => 'datetime',
    ];

    /**
     * Get the notifiable entity that the notification belongs to.
     * This defines the polymorphic relationship based on 'notifiable_type' and 'notifiable_id'.
     */
    public function notifiable()
    {
        return $this->morphTo(); // <-- Define the morphTo relationship
    }
}
