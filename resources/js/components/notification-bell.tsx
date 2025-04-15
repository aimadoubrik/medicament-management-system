import { useState, useEffect } from 'react';
import axios from 'axios'; // Or your preferred HTTP client
import { Link, router, usePage } from '@inertiajs/react'; // Import usePage
import { Bell, CheckCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { PageProps } from '@/types'; // Import PageProps to get auth user if needed elsewhere

export function NotificationBell() {
    // Use usePage hook if you need user info for *other* reasons in this component
    // const { auth } = usePage<PageProps>().props;
    // const userId = auth.user?.id;

    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const fetchUnreadCount = async () => {
        // Avoid fetching if already loading
        // This check might need refinement if polling and manual fetches overlap
        // if (isLoading) return;

        try {
            setIsLoading(true);
            const response = await axios.get<{ count: number }>(route('notifications.unreadCount'));
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Failed to fetch unread notification count:', error);
            // toast.error('Failed to load notification count.'); // Consider rate-limiting this
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUnreadCount(); // Fetch initial count

        // --- Keep Polling (Optional - Remove if WebSocket updates work reliably) ---
        // Consider if you still need this polling as a fallback or if
        // the real-time updates from NotificationHandler are sufficient.
        const intervalId = setInterval(fetchUnreadCount, 60000); // Fetch every 60 seconds
        return () => clearInterval(intervalId); // Cleanup on unmount
        // --- End Polling ---

        // --- REMOVED Echo Listener Block ---
        // Real-time listening should be handled centrally, e.g., in NotificationHandler.tsx

    }, []); // Empty dependency array means this runs once on mount


    // *** Add this useEffect to allow NotificationHandler to trigger refetch ***
    // This listens for a custom browser event that NotificationHandler can dispatch
    useEffect(() => {
        const handleRefetch = () => {
            console.log('NotificationBell: Refetching count due to event.');
            fetchUnreadCount();
        };
        window.addEventListener('refetch-notification-count', handleRefetch);
        return () => window.removeEventListener('refetch-notification-count', handleRefetch);
    }, []); // Runs once on mount


    const handleMarkAllRead = () => {
        // Prevent multiple requests if already processing
        if (isLoading) return;

        // Optimistic update (optional)
        // const previousCount = unreadCount;
        // setUnreadCount(0);
        // setIsLoading(true); // Maybe use a different loading state for actions

        router.post(route('notifications.markAllRead'), {}, {
            onSuccess: () => {
                setUnreadCount(0); // Definite update on success
                setIsOpen(false);
                toast.success('All notifications marked as read.');
                // Reload notification list if it's part of shared props
                router.reload({ only: ['notifications'] });
            },
            onError: (errors) => {
                console.error('Failed to mark all notifications as read:', errors);
                toast.error('Failed to mark all notifications as read.');
                // Revert optimistic update if used
                // setUnreadCount(previousCount);
            },
            // onFinish: () => setIsLoading(false), // Reset action loading state
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-0.5 -right-1 min-w-[1.2rem]  px-1 text-xs flex items-center justify-center rounded-full"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    {/* Ensure link closes dropdown on navigation */}
                    <Link href={route('notifications.index')} onClick={() => setIsOpen(false)} className="w-full cursor-pointer">
                        View All Notifications
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    disabled={unreadCount === 0 || isLoading}
                    onSelect={(e) => {
                        e.preventDefault(); // Prevent closing dropdown immediately
                        handleMarkAllRead();
                    }}
                    className="cursor-pointer" // Ensure it looks clickable
                >
                    <CheckCheck className="mr-2 h-4 w-4" />
                    <span>Mark all as read</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}