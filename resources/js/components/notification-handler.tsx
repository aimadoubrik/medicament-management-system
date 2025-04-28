import { AppEcho } from '@/echo'; // Import your configured Echo instance
import type { PageProps } from '@/types'; // Import base PageProps type
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner'; // Import sonner

// Define a type for the expected notification payload from toBroadcast
// Adjust properties based on what you defined in LowStockNotification->toBroadcast
// and BatchExpiringSoonNotification->toBroadcast
interface BroadcastNotificationPayload {
    id?: string; // Laravel includes the notification ID by default
    type: string; // e.g., 'low_stock', 'expiry_warning', or the full class name if not using broadcastType()
    message: string;
    // Add other expected properties based on your toBroadcast methods
    medicine_name?: string;
    current_stock?: number;
    threshold?: number;
    batch_number?: string;
    expiry_date?: string;
    // ... any other data you send
}

export default function NotificationHandler() {
    const { auth } = usePage<PageProps>().props;
    const userId = auth.user?.id;

    useEffect(() => {
        if (!AppEcho || !userId) {
            if (!userId) {
                console.log('NotificationHandler: User not logged in.');
            }
            if (!AppEcho) {
                console.error('NotificationHandler: Echo instance not found.');
            }
            return;
        }

        const channelName = `App.Models.User.${userId}`;
        // console.log(`NotificationHandler: Subscribing to private channel: ${channelName}`);

        const privateChannel = AppEcho.private(channelName);

        privateChannel.error((error: unknown) => {
            console.error(`NotificationHandler: Echo channel subscription error on ${channelName}:`, error);
        });

        // *** CHANGE HERE: Use .notification() instead of .listen() ***
        // Listens for notifications sent via the 'broadcast' channel for this user.
        // The event name is handled internally by Echo/Laravel based on the notification class
        // or the broadcastType() method if you defined it.
        privateChannel.notification((notification: BroadcastNotificationPayload) => {
            console.log('Broadcast Notification Received:', notification);

            // Use the data structure defined in your toBroadcast method
            // The 'type' property here comes directly from the payload you defined
            // in toBroadcast (e.g., 'low_stock', 'expiry_warning')
            if (notification.message) {
                // Determine toast type based on the custom 'type' field from payload
                switch (notification.type) {
                    case 'low_stock':
                    case 'expiry_warning': // You could add more specific details to the toast description
                    {
                        let description = `Medicine: ${notification.medicine_name || 'N/A'}`;
                        if (notification.batch_number) {
                            description += `, Batch: ${notification.batch_number}`;
                        }
                        toast.warning(notification.message, {
                            description: description,
                            duration: 10000, // Example duration
                        });
                        break;
                    }
                    // Add cases for other custom notification types you might have
                    // case 'some_other_type':
                    //     toast.info(notification.message);
                    //     break;
                    default:
                        // Fallback for notifications that might not have a specific type handled
                        // Or if the 'type' field wasn't included in toBroadcast
                        toast.warning(notification.message || 'New notification received.');
                        break;
                }
            } else {
                console.warn("Received notification payload without a 'message' property:", notification);
                // Optionally show a generic toast if message is missing but payload exists
                toast.info('You have a new notification.');
            }

            // Dispatch event to update UI elements like notification count
            window.dispatchEvent(new CustomEvent('refetch-notification-count'));
        });

        // Cleanup function
        return () => {
            if (AppEcho && userId) {
                // console.log(`NotificationHandler: Leaving private channel: ${channelName}`);
                AppEcho.leaveChannel(channelName);
            }
        };
    }, [userId]); // Re-run effect if userId changes

    return null; // Component doesn't render UI
}
