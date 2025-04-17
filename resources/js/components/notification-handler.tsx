import { AppEcho } from '@/app'; // Import your configured Echo instance
import type { NewNotificationEventPayload, PageProps } from '@/types'; // Import types
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner'; // Import sonner

// If creating a separate component, it doesn't need props if using usePage hook
// If integrating into a Layout, ensure the Layout receives `auth` prop
export default function NotificationHandler() {
    // Use usePage hook to access shared props like auth user
    const { auth } = usePage<PageProps>().props;
    const userId = auth.user?.id; // Get authenticated user ID

    useEffect(() => {
        // Ensure Echo is initialized and we have a user ID
        if (!AppEcho || !userId) {
            if (!userId) {
                console.log('NotificationHandler: User not logged in, cannot subscribe to private channel.');
            }
            if (!AppEcho) {
                console.error('NotificationHandler: Echo instance not found.');
            }
            return; // Don't proceed if Echo isn't ready or user isn't logged in
        }

        const channelName = `App.Models.User.${userId}`;
        console.log(`NotificationHandler: Subscribing to private channel: ${channelName}`);

        // Subscribe to the private channel for the authenticated user
        const privateChannel = AppEcho.private(channelName);

        // Add error handling for the subscription itself
        privateChannel.error((error: any) => {
            console.error(`NotificationHandler: Echo channel subscription error on ${channelName}:`, error);
            // Potentially show an error to the user or retry logic
        });

        // Listen for the specific event (.ClassName)
        privateChannel.listen('.App\\Events\\NewNotificationEvent', (event: NewNotificationEventPayload) => {
            console.log('Notification Received:', event);

            // Display the notification using sonner based on event type
            switch (event.type) {
                case 'success':
                    toast.success(event.message);
                    break;
                case 'error':
                    toast.error(event.message);
                    break;
                case 'warning':
                    toast.warning(event.message);
                    break;
                case 'info':
                default:
                    toast.info(event.message);
                    break;
            }

            // *** Dispatch a custom event to trigger refetch in NotificationBell ***
            window.dispatchEvent(new CustomEvent('refetch-notification-count'));
        });

        // Cleanup function: Leave the channel when the component unmounts or userId changes
        return () => {
            if (AppEcho && userId) {
                console.log(`NotificationHandler: Leaving private channel: ${channelName}`);
                AppEcho.leaveChannel(channelName); // Use leaveChannel for private channels too
            }
        };
    }, [userId]); // Re-run effect if userId changes (login/logout)

    // This component doesn't render anything itself, it just handles side effects
    return null;
}
