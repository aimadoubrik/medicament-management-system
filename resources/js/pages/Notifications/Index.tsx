import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout'; // Adjust path as needed
import { cn } from '@/lib/utils'; // Assuming you have this utility from Shadcn
import { PageProps, PaginatedResponse } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, BellRing, CheckCheck, Inbox, ListCheck, Package, Trash } from 'lucide-react';
import React, { useEffect } from 'react'; // Import useEffect
import { useIntl } from 'react-intl';
import { toast } from 'sonner';

// Define NotificationData structure (ensure this matches your backend data)
interface NotificationItem {
    id: string; // UUID
    type: string; // Class name of the notification (e.g., App\Notifications\LowStockNotification)
    data: {
        // Properties defined in the toArray/toDatabase method of your Notification classes
        message: string;
        medicine_id?: number; // Optional based on notification type
        medicine_name?: string;
        current_quantity?: number;
        threshold?: number;
        expiry_date: string; // Should be string from backend JSON
        current_stock?: number;
        batch_number?: string;
        action_url?: string; // Optional URL for direct links
        title?: string; // Optional generic title
        // Add any other properties present in the 'data' column
    };
    read_at: string | null; // ISO 8601 date string or null
    created_at: string; // ISO 8601 date string
}

interface NotificationsPageProps extends PageProps {
    notifications: PaginatedResponse<NotificationItem>;
}

// Define expected shape of pagination links
interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

// Define a custom interface for the reload options
interface CustomReloadOptions {
    only: string[];
    preserveState?: boolean;
    preserveScroll?: boolean;
    onSuccess?: () => void; // Add onSuccess callback if needed
    onError?: () => void; // Add onError callback if needed
}

// --- Pagination Sub-Component ---
function Pagination({ links }: { links: PaginationLink[] }) {
    if (!links || links.length <= 3) return null; // Hide if only prev/next/current or less

    return (
        <nav className="mt-6 flex items-center justify-center gap-1">
            {links.map((link, index) => (
                <Button
                    key={index}
                    asChild={!!link.url} // Render as Link only if URL is present
                    variant={link.active ? 'default' : 'outline'}
                    size="sm"
                    disabled={!link.url}
                    className={cn(!link.url && 'text-muted-foreground cursor-not-allowed', link.active && 'font-bold')}
                >
                    {link.url ? (
                        <Link
                            href={link.url}
                            preserveScroll // Preserve scroll position on pagination
                            preserveState // Preserve component state on pagination
                            only={['notifications']} // Only fetch notifications data on pagination click
                            dangerouslySetInnerHTML={{ __html: link.label }} // Use label directly (includes <<, >>, numbers)
                        />
                    ) : (
                        // Render non-link item (e.g., '...') or disabled prev/next
                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                    )}
                </Button>
            ))}
        </nav>
    );
}
// --- End Pagination ---

export default function NotificationsIndex({ notifications }: NotificationsPageProps) {
    // --- Internationalization (i18n) Setup ---
    const intl = useIntl();
    const notificationsHeadTitle = intl.formatMessage({
        id: 'pages.notifications.head_title',
        defaultMessage: 'Notifications',
    });
    const notificationsNavTitle = intl.formatMessage({
        id: 'pages.notifications.nav_title',
        defaultMessage: 'Notifications',
    });
    const notificationsTitle = intl.formatMessage({
        id: 'pages.notifications.title',
        defaultMessage: 'Vos Notifications',
    });
    const markAsReadTooltip = intl.formatMessage({
        id: 'pages.notifications.mark_as_read',
        defaultMessage: 'Mark as read',
    });
    const markAllAsReadTooltip = intl.formatMessage({
        id: 'pages.notifications.mark_all_as_read',
        defaultMessage: 'Mark all as read',
    });
    const deleteAllTooltip = intl.formatMessage({
        id: 'pages.notifications.delete_all_notifications',
        defaultMessage: 'Delete all notifications',
    });
    // --- End of Internationalization (i18n) Setup ---

    // Type-safe reload function
    const safeReload = (options: CustomReloadOptions) => {
        // Use router.reload with the specified options
        router.reload(options);
    };

    // --- Add useEffect for listening to notification events ---
    useEffect(() => {
        const handleNewNotification = () => {
            console.log('Refetch event received, reloading notifications...');
            // Reload only the notifications data, preserve scroll and state
            safeReload({
                only: ['notifications'],
                preserveState: true,
                preserveScroll: true,
                // Optional: Add callbacks if needed, e.g., to briefly highlight new items
                // onSuccess: () => { console.log('Notifications reloaded'); }
            });
        };

        // Add event listener when the component mounts
        window.addEventListener('refetch-notification-count', handleNewNotification);

        // Remove event listener when the component unmounts
        return () => {
            window.removeEventListener('refetch-notification-count', handleNewNotification);
        };
    }, []); // Empty dependency array ensures this runs only once on mount/unmount

    // --- End useEffect ---

    const handleMarkAsRead = (notificationId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation(); // Prevent row click if button is clicked

        router.patch(
            route('notifications.markAsRead', notificationId),
            {},
            {
                onSuccess: () => {
                    toast.success('Notification marked as read.');
                    // Reload is handled by the event listener now if needed,
                    // but usually marking as read should update the specific item visually
                    // Consider directly updating state or just relying on reload for simplicity
                    safeReload({ only: ['notifications'], preserveState: true, preserveScroll: true });
                },
                onError: () => toast.error('Failed to mark notification as read.'),
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleMarkAllRead = () => {
        router.post(
            route('notifications.markAllRead'),
            {},
            {
                onSuccess: () => {
                    toast.success('All notifications marked as read.');
                    safeReload({ only: ['notifications'], preserveState: true, preserveScroll: true });
                },
                onError: () => toast.error('Failed to mark all notifications as read.'),
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleDeleteAll = () => {
        // Optional: Add a confirmation dialog here
        router.post(
            route('notifications.destroyAll'),
            {},
            {
                onSuccess: () => {
                    toast.success('All notifications deleted.');
                    safeReload({ only: ['notifications'], preserveState: true, preserveScroll: true });
                },
                onError: () => toast.error('Failed to delete all notifications.'),
                // Don't preserve state on delete usually, as the list is now empty/different
                preserveScroll: true,
            },
        );
    };

    // Icon mapping based on notification class name (adjust as needed)
    const getIcon = (type: string) => {
        // Check for specific notification class names
        if (type.includes('LowStockNotification')) return <AlertTriangle className="h-5 w-5 text-orange-500" />;
        if (type.includes('ExpiryWarningNotification')) return <BellRing className="h-5 w-5 text-yellow-500" />;
        // Add more specific types from App\Notifications namespace if needed
        // if (type.includes('SomeOtherNotification')) return <SomeIcon className="h-5 w-5 text-blue-500" />;
        return <Package className="h-5 w-5 text-gray-500" />; // Default icon
    };

    // Format date string using Intl.DateTimeFormat for better localization
    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        try {
            return new Intl.DateTimeFormat(undefined, {
                // Use browser's default locale
                dateStyle: 'short',
                timeStyle: 'short',
            }).format(new Date(dateString));
        } catch {
            return dateString; // Fallback
        }
    };

    const hasUnread = notifications.data.some((n) => !n.read_at);

    return (
        <AppLayout breadcrumbs={[{ title: notificationsNavTitle, href: route('notifications.index') }]}>
            <Head title={notificationsHeadTitle} />

            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                            <div>
                                <CardTitle>{notificationsTitle}</CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Mark All Read Button */}
                                {hasUnread && (
                                    <TooltipProvider delayDuration={100}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!hasUnread}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAllRead();
                                                    }}
                                                >
                                                    <ListCheck className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{markAllAsReadTooltip}</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                                {/* Delete All Button */}
                                <TooltipProvider delayDuration={100}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                onClick={handleDeleteAll}
                                                variant="destructive"
                                                size="sm"
                                                disabled={notifications.data.length === 0}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>{deleteAllTooltip}</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {notifications.data.length > 0 ? (
                                <ul className="space-y-3">
                                    {notifications.data.map((notification) => (
                                        <li
                                            key={notification.id}
                                            // Click row to mark as read (only if unread)
                                            onClick={() => !notification.read_at && handleMarkAsRead(notification.id)}
                                            className={cn(
                                                'flex items-start gap-4 rounded-lg border p-4 transition-colors',
                                                !notification.read_at
                                                    ? 'bg-primary/5 dark:bg-primary/10 border-primary/20 hover:bg-primary/10 dark:hover:bg-primary/15 cursor-pointer'
                                                    : 'bg-card', // Standard background for read items
                                            )}
                                        >
                                            {/* Icon */}
                                            <span className="mt-1 flex-shrink-0">{getIcon(notification.type)}</span>

                                            {/* Content */}
                                            <div className="flex-1 space-y-1">
                                                {/* Title (derived from type or data) */}
                                                <p className="text-sm leading-tight font-medium">
                                                    {notification.type.includes('LowStockNotification') && notification.data.medicine_name && (
                                                        <span>
                                                            Low Stock: <span className="font-semibold">{notification.data.medicine_name}</span>
                                                        </span>
                                                    )}
                                                    {notification.type.includes('ExpiryWarningNotification') && notification.data.medicine_name && (
                                                        <span>
                                                            Expiry Warning: <span className="font-semibold">{notification.data.medicine_name}</span>
                                                        </span>
                                                    )}
                                                    {/* Fallback title */}
                                                    {!notification.type.includes('LowStockNotification') &&
                                                        !notification.type.includes('ExpiryWarningNotification') && (
                                                            <span>
                                                                {notification.data.title || notification.type.split('\\').pop() || 'Notification'}
                                                            </span> // Display class name as fallback
                                                        )}
                                                </p>

                                                {/* Message */}
                                                <p className="text-muted-foreground text-sm">
                                                    {notification.data.message || 'No details available.'}
                                                </p>

                                                {/* Contextual Details (Expiry) */}
                                                {notification.type.includes('ExpiryWarningNotification') && (
                                                    <p className="text-muted-foreground text-xs">
                                                        Batch: {notification.data.batch_number ?? 'N/A'} | Expires:{' '}
                                                        {formatDate(notification.data.expiry_date) ?? 'N/A'} | Qty:{' '}
                                                        {notification.data.current_quantity ?? 'N/A'}
                                                    </p>
                                                )}
                                                {/* Contextual Details (Low Stock) */}
                                                {notification.type.includes('LowStockNotification') && (
                                                    <p className="text-muted-foreground text-xs">
                                                        Current Stock: {notification.data.current_stock ?? 'N/A'} | Threshold:{' '}
                                                        {notification.data.threshold ?? 'N/A'}
                                                    </p>
                                                )}

                                                {/* Timestamps and Action Link */}
                                                <div className="flex items-center gap-2 pt-1">
                                                    <p className="text-muted-foreground/80 text-xs">
                                                        {formatDate(notification.created_at)}
                                                        {notification.read_at && ` (Read ${formatDate(notification.read_at)})`}
                                                    </p>
                                                    {notification.data.action_url && (
                                                        <>
                                                            <span className="text-muted-foreground/50 text-xs">|</span>
                                                            <Link
                                                                href={notification.data.action_url}
                                                                className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                                                                onClick={(e) => e.stopPropagation()} // Prevent row click if link is clicked
                                                            >
                                                                View Details
                                                            </Link>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Explicit Mark as Read Button (only if unread) */}
                                            {!notification.read_at && (
                                                <TooltipProvider delayDuration={100}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={(e) => handleMarkAsRead(notification.id, e)} // Pass event to stop propagation
                                                                className="ml-auto h-7 w-7 flex-shrink-0"
                                                                aria-label={markAsReadTooltip}
                                                            >
                                                                <CheckCheck className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>{markAsReadTooltip}</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                // Empty State
                                <div className="text-muted-foreground space-y-2 py-12 text-center">
                                    <Inbox className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="font-medium">You have no notifications.</p>
                                    <p className="text-sm">Check back later for updates.</p>
                                </div>
                            )}

                            {/* Render Pagination */}
                            {notifications.links && <Pagination links={notifications.links} />}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
