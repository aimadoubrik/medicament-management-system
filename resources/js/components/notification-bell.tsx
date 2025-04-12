import { useState, useEffect } from 'react';
import axios from 'axios'; // Or your preferred HTTP client
import { Link, router } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';

import { Button } from '@/components/ui/button'; // Assuming Shadcn UI setup
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner'; // Assuming you use sonner for toasts

export function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const fetchUnreadCount = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get<{ count: number }>(route('notifications.unreadCount'));
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Failed to fetch unread notification count:', error);
            // Optionally show a toast or error message
            // toast.error('Failed to load notification count.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUnreadCount();

        // Optional: Poll for new notifications periodically
        // const intervalId = setInterval(fetchUnreadCount, 60000); // Fetch every 60 seconds
        // return () => clearInterval(intervalId); // Cleanup on unmount

        // Listen for custom events if you implement broadcasting/websockets
        // window.Echo?.private(`App.Models.User.${userId}`) // Replace userId
        //    .notification((notification: any) => {
        //        fetchUnreadCount(); // Re-fetch count when a new notification arrives
        //        toast.info("You have a new notification!");
        //    });

    }, []);

    const handleMarkAllRead = () => {
        router.post(route('notifications.markAllRead'), {}, {
            onSuccess: () => {
                setUnreadCount(0);
                setIsOpen(false); // Close dropdown after action
                toast.success('All notifications marked as read.');
                // Optionally, trigger a refresh of the notifications page if open
                router.reload({ only: ['notifications'] });
            },
            onError: (errors) => {
                console.error('Failed to mark all notifications as read:', errors);
                toast.error('Failed to mark all notifications as read.');
            },
            preserveState: true, // Keep current page state
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
                            variant="destructive" // Or another variant
                            className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-1 py-0.5 text-xs flex items-center justify-center rounded-full"
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
                {/* Optional: Could show latest 1-2 unread notifications here */}
                <DropdownMenuItem asChild>
                    <Link href={route('notifications.index')} className="w-full">
                        View All Notifications
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    disabled={unreadCount === 0 || isLoading}
                    onSelect={(e) => {
                        e.preventDefault(); // Prevent closing dropdown immediately
                        handleMarkAllRead();
                    }}
                >
                    <CheckCheck className="mr-2 h-4 w-4" />
                    <span>Mark all as read</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}