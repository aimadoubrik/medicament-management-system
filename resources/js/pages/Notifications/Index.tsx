import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout'; // Adjust path as needed
import { cn } from '@/lib/utils'; // Assuming you have this utility from Shadcn
import { PageProps, PaginatedResponse } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, BellRing, Inbox, Package, Trash, CheckCheck, ListCheck } from 'lucide-react';
import { toast } from 'sonner';

// Define NotificationData structure
interface NotificationItem {
    id: string;
    type: string;
    data: Record<string, any>;
    read_at: string | null;
    created_at: string;
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
                            preserveScroll
                            preserveState
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

export default function NotificationsIndex({ auth, notifications }: NotificationsPageProps) {
    // Type-safe reload function
    const safeReload = (options: CustomReloadOptions) => {
        // TypeScript ignores this specific assignment - more type-safe than 'any'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return router.reload(options as any);
    };

    const handleMarkAsRead = (notificationId: string, e?: React.MouseEvent) => {
        // If event is provided, prevent propagation
        if (e) {
            e.stopPropagation();
        }

        router.patch(
            route('notifications.markAsRead', notificationId),
            {},
            {
                onSuccess: () => {
                    toast.success('Notification marked as read.');
                    safeReload({ only: ['notifications'], preserveState: true, preserveScroll: true });
                },
                onError: () => {
                    toast.error('Failed to mark notification as read.');
                },
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
                onError: () => {
                    toast.error('Failed to mark all notifications as read.');
                },
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleDeleteAll = () => {
        router.post(
            route('notifications.destroyAll'),
            {},
            {
                onSuccess: () => {
                    toast.success('All notifications deleted.');
                    safeReload({ only: ['notifications'], preserveState: true, preserveScroll: true });
                },
                onError: () => {
                    toast.error('Failed to delete all notifications.');
                },
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Improved icon getter with more comprehensive type handling
    const getIcon = (type: string) => {
        if (type.includes('LowStock')) return <AlertTriangle className="h-5 w-5 text-orange-500" />;
        if (type.includes('ExpiryWarning')) return <BellRing className="h-5 w-5 text-yellow-500" />;
        // Add more notification types as needed
        return <Package className="h-5 w-5 text-gray-500" />; // Default icon
    };

    // Format date string to be more user-friendly
    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;

        try {
            return new Date(dateString).toLocaleString();
        } catch (error) {
            return dateString; // Fallback to original string if parsing fails
        }
    };

    const hasUnread = notifications.data.some((n) => !n.read_at);

    return (
        <AppLayout breadcrumbs={[{ title: 'Notifications', href: route('notifications.index') }]}>
            <Head title="Notifications" />

            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                            <div>
                                <CardTitle>Your Notifications</CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                {
                                    (hasUnread) ? (
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
                                                <TooltipContent>Mark all notifications as read</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ) : (
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
                                                <TooltipContent>Delete all notifications</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )
                                }
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {notifications.data.length > 0 ? (
                                <ul className="space-y-3">
                                    {notifications.data.map((notification) => (
                                        <li
                                            key={notification.id}
                                            onClick={() => !notification.read_at && handleMarkAsRead(notification.id)} // Click row to mark as read
                                            className={cn(
                                                'flex items-start gap-4 rounded-lg border p-4 transition-colors',
                                                !notification.read_at
                                                    ? 'bg-primary/5 dark:bg-primary/10 border-primary/20 hover:bg-primary/10 dark:hover:bg-primary/15 cursor-pointer'
                                                    : 'bg-card',
                                            )}
                                        >
                                            <span className="mt-1 flex-shrink-0">{getIcon(notification.type)}</span>
                                            <div className="flex-1 space-y-1">
                                                {/* Display more contextual title */}
                                                <p className="text-sm leading-tight font-medium">
                                                    {notification.type.includes('LowStock') && notification.data.medicine_name && (
                                                        <span>
                                                            Low Stock: <span className="font-semibold">{notification.data.medicine_name}</span>
                                                        </span>
                                                    )}
                                                    {notification.type.includes('ExpiryWarning') && notification.data.medicine_name && (
                                                        <span>
                                                            Expiry Warning: <span className="font-semibold">{notification.data.medicine_name}</span>
                                                        </span>
                                                    )}
                                                    {/* Fallback title */}
                                                    {!notification.type.includes('LowStock') && !notification.type.includes('ExpiryWarning') && (
                                                        <span>{notification.data.title || notification.type || 'Notification'}</span>
                                                    )}
                                                </p>
                                                {/* Display main message */}
                                                <p className="text-muted-foreground text-sm">
                                                    {notification.data.message || 'No details available.'}
                                                </p>
                                                {/* Display extra context like batch/dates */}
                                                {notification.type.includes('ExpiryWarning') && (
                                                    <p className="text-muted-foreground text-xs">
                                                        Batch: {notification.data.batch_number ?? 'N/A'} | Expires:{' '}
                                                        {notification.data.expiry_date
                                                            ? new Date(notification.data.expiry_date).toLocaleDateString()
                                                            : 'N/A'}{' '}
                                                        | Qty: {notification.data.quantity ?? 'N/A'}
                                                    </p>
                                                )}
                                                {notification.type.includes('LowStock') && (
                                                    <p className="text-muted-foreground text-xs">
                                                        Current Stock: {notification.data.current_stock ?? 'N/A'} | Threshold:{' '}
                                                        {notification.data.threshold ?? 'N/A'}
                                                    </p>
                                                )}
                                                {/* Timestamps and Action URL */}
                                                <div className="flex items-center gap-2 pt-1">
                                                    <p className="text-muted-foreground/80 text-xs">
                                                        {formatDate(notification.created_at) || notification.created_at}
                                                        {notification.read_at && ` (Read ${formatDate(notification.read_at) || notification.read_at})`}
                                                    </p>
                                                    {notification.data.action_url && (
                                                        <>
                                                            <span className="text-muted-foreground/50 text-xs">|</span>
                                                            <Link
                                                                href={notification.data.action_url}
                                                                className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                                                                onClick={(e) => e.stopPropagation()} // Prevent row click handler if link is clicked
                                                            >
                                                                View Details
                                                            </Link>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Explicit Mark as Read Button */}
                                            {!notification.read_at && (
                                                <TooltipProvider delayDuration={100}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                                className="ml-auto h-7 w-7 flex-shrink-0"
                                                                aria-label="Mark as read"
                                                            >
                                                                <CheckCheck className="h-4 w-4" />
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