<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth; // Import Auth facade

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Fetch both read and unread notifications, ordered by creation date
        $notifications = $request->user()->notifications()->latest()->paginate(15); // Paginate results

        return Inertia::render('Notifications/Index', [ // Assuming you have a Notifications/Index.tsx page
            'notifications' => $notifications->through(fn($notification) => [ // Format data for frontend
                'id' => $notification->id,
                'type' => class_basename($notification->type), // e.g., 'LowStockNotification'
                'data' => $notification->data,
                'read_at' => $notification->read_at ? $notification->read_at->diffForHumans() : null,
                'created_at' => $notification->created_at->diffForHumans(),
            ]),
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, string $id) // Use string for UUID if applicable
    {
        $user = Auth::user();
        $notification = $request->user()->notifications()->findOrFail($id);

        if (!$notification->read_at) { // Only mark if unread
            $notification->markAsRead();
        }

        // Redirect back or return a success response
        // If called via AJAX from frontend, return JSON
        if ($request->expectsJson()) {
            return response()->json(['message' => 'Notification marked as read.']);
        }

        return back()->with('success', 'Notification marked as read.');
    }

    /**
     * Mark all unread notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $user = Auth::user();
        $user->unreadNotifications->markAsRead();

        // If called via AJAX from frontend, return JSON
        if ($request->expectsJson()) {
            return response()->json(['message' => 'All notifications marked as read.']);
        }

        return back()->with('success', 'All notifications marked as read.');
    }

    /**
     * Get unread notifications count (useful for header display).
     */
    public function getUnreadCount(Request $request): \Illuminate\Http\JsonResponse
    {
        if (!$request->expectsJson()) {
            abort(404);
        }
        return response()->json([
            'count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    /**
     * Optionally, you can add a method to delete notifications.
     */
    public function destroy(Request $request, string $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->delete();

        return back()->with('success', 'Notification deleted successfully.');
    }
}
