import AppLayout from '@/layouts/app-layout'; // Adjust path as needed
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, PaginatedResponse, NotificationData } from '@/types'; // Ensure NotificationData is defined in your types
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, BellRing, CheckCheck, Package } from 'lucide-react'; // Example icons
import { formatDistanceToNow } from 'date-fns'; // For relative time
import { toast } from 'sonner';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

// Define NotificationData structure based on your backend 'toArray' output
interface NotificationItem extends NotificationData {
    id: string;
    type: string; // e.g., 'LowStockNotification', 'ExpiryWarningNotification'
    data: NotificationData; // This should match the structure you expect from the backend
    read_at: string | null; // Formatted string or null
    created_at: string; // Formatted string
}

interface NotificationsPageProps extends PageProps {
    notifications: PaginatedResponse<NotificationItem>;
}

export default function NotificationsIndex({ auth, notifications }: NotificationsPageProps) {

    const handleMarkAsRead = (notificationId: string) => {
        router.patch(route('notifications.markAsRead', notificationId), {}, {
            onSuccess: () => {
                toast.success('Notification marked as read.');
                // Optionally trigger a refresh of the notifications prop
                router.reload({ only: ['notifications'] });
            },
            onError: () => {
                toast.error('Failed to mark notification as read.');
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleMarkAllRead = () => {
        router.post(route('notifications.markAllRead'), {}, {
            onSuccess: () => {
                toast.success('All notifications marked as read.');
                router.reload({ only: ['notifications'] });
            },
            onError: (errors) => {
                toast.error('Failed to mark all notifications as read.');
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getIcon = (type: string) => {
        if (type.includes('LowStock')) return <AlertTriangle className="h-4 w-4 text-orange-500" />;
        if (type.includes('ExpiryWarning')) return <BellRing className="h-4 w-4 text-yellow-500" />;
        // Add more icons based on notification types
        return <Package className="h-4 w-4 text-gray-500" />; // Default icon
    };

    const hasUnread = notifications.data.some(n => !n.read_at);

    console.log('notifications', notifications.data);

    return (
        <AppLayout breadcrumbs={[{ title: 'Notifications', href: '/notifications' }]}>
            <Head title="Notifications" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Your Notifications</CardTitle>
                                <CardDescription>
                                    Recent alerts and updates.
                                </CardDescription>
                            </div>
                            <Button
                                onClick={handleMarkAllRead}
                                disabled={!hasUnread}
                                size="sm"
                            >
                                Mark All As Read
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {notifications.data.length > 0 ? (
                                <ul className="space-y-4">
                                    {notifications.data.map((notification) => (
                                        <li
                                            key={notification.id}
                                            className={`flex items-start gap-4 p-4 rounded-lg border ${!notification.read_at
                                                ? 'bg-primary/5 dark:bg-primary/10' // Highlight unread
                                                : 'bg-card'
                                                }`}
                                        >
                                            <span className="mt-1">{getIcon(notification.type)}</span>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {notification.data.message || 'Notification'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {notification.created_at}
                                                    {notification.read_at && ` (Read ${notification.read_at})`}
                                                </p>
                                                {/* Optional: Link to relevant resource */}
                                                {notification.data.action_url && (
                                                    <Link
                                                        href={notification.data.action_url}
                                                        className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                                                    >
                                                        View Details
                                                    </Link>
                                                )}
                                            </div>
                                            {!notification.read_at && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleMarkAsRead(notification.id)}
                                                                className="ml-auto"
                                                                title="Mark as read"
                                                            >
                                                                <CheckCheck className="h-4 w-4" />
                                                                <span className="sr-only">Mark as read</span>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Mark as read</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}

                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    You have no notifications.
                                </p>
                            )}

                            {/* Pagination Links */}
                            {notifications.links && notifications.data.length > 0 && (
                                <div className="mt-6 flex justify-center items-center gap-2">
                                    {notifications.prev_page_url && (
                                        <Link href={notifications.prev_page_url}>
                                            <Button variant="outline" size="sm">Previous</Button>
                                        </Link>
                                    )}
                                    <span className="text-sm text-muted-foreground">
                                        {/* Page {notifications.meta.current_page} of {notifications.meta.last_page} */}
                                    </span>
                                    {notifications.next_page_url && (
                                        <Link href={notifications.next_page_url}>
                                            <Button variant="outline" size="sm">Next</Button>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            {/* Ensure you have Toaster component in your main layout for feedback */}
            {/* <Toaster richColors position="bottom-right" /> */}
        </AppLayout>
    );
}