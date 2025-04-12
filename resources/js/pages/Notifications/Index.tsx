import AppLayout from '@/layouts/app-layout'; // Adjust path as needed
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, PaginatedResponse } from '@/types'; // Removed NotificationData import if not used elsewhere directly
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, BellRing, CheckCheck, Inbox, Package, ChevronLeft, ChevronRight } from 'lucide-react'; // Added more icons
import { toast } from 'sonner';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils'; // Assuming you have this utility from Shadcn

// Define NotificationData structure based on your backend 'toArray' output
// This local interface reflects the structure passed from NotificationController
interface NotificationItem {
    id: string;
    type: string; // e.g., 'LowStockNotification', 'ExpiryWarningNotification'
    // Data payload can vary, use Record or a more specific Discriminated Union if needed
    data: Record<string, any>;
    read_at: string | null; // Formatted string or null
    created_at: string; // Formatted string
}

interface NotificationsPageProps extends PageProps {
    notifications: PaginatedResponse<NotificationItem>;
}

// --- Pagination Sub-Component ---
function Pagination({ links }: { links: PaginatedResponse<any>['links'] }) {
    if (!links || links.length <= 3) return null; // Hide if only prev/next/current or less

    return (
        <nav className="mt-6 flex justify-center items-center gap-1">
            {links.map((link, index) => (
                <Button
                    key={index}
                    asChild={!!link.url} // Render as Link only if URL is present
                    variant={link.active ? 'default' : 'outline'}
                    size="sm"
                    disabled={!link.url}
                    className={cn(
                        !link.url && 'text-muted-foreground cursor-not-allowed',
                        link.active && 'font-bold'
                    )}
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

    const handleMarkAsRead = (notificationId: string) => {
        router.patch(route('notifications.markAsRead', notificationId), {}, {
            onSuccess: () => {
                toast.success('Notification marked as read.');
                // Optionally trigger a refresh of the notifications prop
                router.reload({ only: ['notifications'], preserveState: true, preserveScroll: true }); // Keep scroll pos
            },
            onError: () => {
                toast.error('Failed to mark notification as read.');
            },
            preserveState: true, // Keep component state
            preserveScroll: true,
        });
    };

    const handleMarkAllRead = () => {
        router.post(route('notifications.markAllRead'), {}, {
            onSuccess: () => {
                toast.success('All notifications marked as read.');
                router.reload({ only: ['notifications'], preserveState: true, preserveScroll: true });
            },
            onError: (errors) => {
                toast.error('Failed to mark all notifications as read.');
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Improved icon getter
    const getIcon = (type: string): JSX.Element => {
        if (type.includes('LowStock')) return <AlertTriangle className="h-5 w-5 text-orange-500" />;
        if (type.includes('ExpiryWarning')) return <BellRing className="h-5 w-5 text-yellow-500" />;
        // Add more icons based on specific notification class basenames
        return <Package className="h-5 w-5 text-gray-500" />; // Default icon
    };

    const hasUnread = notifications.data.some(n => !n.read_at);

    return (
        <AppLayout breadcrumbs={[{ title: 'Notifications', href: route('notifications.index') }]}>
            <Head title="Notifications" />

            <div className="py-6 md:py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
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
                        <CardContent className="pt-6">
                            {notifications.data.length > 0 ? (
                                <ul className="space-y-3">
                                    {notifications.data.map((notification) => (
                                        <li
                                            key={notification.id}
                                            onClick={() => !notification.read_at && handleMarkAsRead(notification.id)} // Click row to mark as read
                                            className={cn(
                                                'flex items-start gap-4 p-4 rounded-lg border transition-colors',
                                                !notification.read_at
                                                    ? 'bg-primary/5 dark:bg-primary/10 border-primary/20 cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/15' // Highlight unread & add hover
                                                    : 'bg-card'
                                            )}
                                        >
                                            <span className="mt-1 flex-shrink-0">{getIcon(notification.type)}</span>
                                            <div className="flex-1 space-y-1">
                                                {/* Display more contextual title */}
                                                <p className="text-sm font-medium leading-tight">
                                                    {notification.type.includes('LowStock') && notification.data.medicine_name && (
                                                        <span>Low Stock: <span className="font-semibold">{notification.data.medicine_name}</span></span>
                                                    )}
                                                    {notification.type.includes('ExpiryWarning') && notification.data.medicine_name && (
                                                        <span>Expiry Warning: <span className="font-semibold">{notification.data.medicine_name}</span></span>
                                                    )}
                                                    {/* Fallback title */}
                                                    {!notification.type.includes('LowStock') && !notification.type.includes('ExpiryWarning') && (
                                                        <span>{notification.data.title || notification.type || 'Notification'}</span>
                                                    )}
                                                </p>
                                                {/* Display main message */}
                                                <p className="text-sm text-muted-foreground">
                                                    {notification.data.message || 'No details available.'}
                                                </p>
                                                {/* Display extra context like batch/dates */}
                                                {notification.type.includes('ExpiryWarning') && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Batch: {notification.data.batch_number ?? 'N/A'} | Expires: {notification.data.expiry_date ? new Date(notification.data.expiry_date).toLocaleDateString() : 'N/A'} | Qty: {notification.data.quantity ?? 'N/A'}
                                                    </p>
                                                )}
                                                {notification.type.includes('LowStock') && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Current Stock: {notification.data.current_stock ?? 'N/A'} | Threshold: {notification.data.threshold ?? 'N/A'}
                                                    </p>
                                                )}
                                                {/* Timestamps and Action URL */}
                                                <div className="flex items-center gap-2 pt-1">
                                                    <p className="text-xs text-muted-foreground/80">
                                                        {notification.created_at}
                                                        {notification.read_at && ` (Read ${notification.read_at})`}
                                                    </p>
                                                    {notification.data.action_url && (
                                                        <>
                                                            <span className="text-xs text-muted-foreground/50">|</span>
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
                                                                variant="ghost" // Use ghost variant for less emphasis now row is clickable
                                                                size="icon" // Make it icon-only
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Prevent row click handler
                                                                    handleMarkAsRead(notification.id);
                                                                }}
                                                                className="ml-auto h-7 w-7 flex-shrink-0" // Adjust size/spacing
                                                                aria-label="Mark as read" // Use aria-label for icon buttons
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
                                <div className="text-center text-muted-foreground py-12 space-y-2">
                                    <Inbox className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="font-medium">You have no notifications.</p>
                                    <p className="text-sm">Check back later for updates.</p>
                                </div>
                            )}

                            {/* Render Pagination */}
                            <Pagination links={notifications.links} />

                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}