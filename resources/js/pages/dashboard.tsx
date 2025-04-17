import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertTriangle, Calendar, Package2, Pill } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface MedicineBatch {
    id: number;
    medicine: {
        name: string;
    };
    batch_number: string;
    current_quantity: number;
    expiry_date: string;
    is_low_stock: 0 | 1;
    is_expiring_soon: 0 | 1;
    is_expired: 0 | 1;
}

interface DashboardProps {
    summaryData: {
        lowStockCount: number;
        expiringSoonCount: number;
        expiredCount: number;
        totalBatches: number;
    };
    lowStockMedicines: MedicineBatch[];
    expiringSoonMedicines: MedicineBatch[];
    expiredMedicines: MedicineBatch[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
];

// Helper function for calculating percentage safely
const calculatePercentage = (numerator: number, denominator: number): number => {
    if (denominator === 0) {
        return 0; // Avoid division by zero
    }
    return Math.round((numerator / denominator) * 100);
};

export default function Dashboard({ summaryData, lowStockMedicines, expiredMedicines }: DashboardProps) {
    // Define statistics cards based on corrected summaryData keys
    const stats = [
        { title: 'Low Stock Batches', value: summaryData.lowStockCount.toString(), alert: 'warning', icon: AlertTriangle },
        { title: 'Expiring Soon Batches', value: summaryData.expiringSoonCount.toString(), alert: 'warning', icon: Calendar },
        { title: 'Expired Batches', value: summaryData.expiredCount.toString(), alert: 'error', icon: Pill },
        { title: 'Total Batches', value: summaryData.totalBatches.toString(), alert: 'info', icon: Package2 },
    ];

    // Chart data using corrected keys
    const chartData = [
        { name: 'Low Stock', value: summaryData.lowStockCount },
        { name: 'Expiring Soon', value: summaryData.expiringSoonCount },
        { name: 'Expired', value: summaryData.expiredCount },
        { name: 'Healthy', value: Math.max(0, summaryData.totalBatches - (summaryData.lowStockCount + summaryData.expiredCount)) },
    ];

    // Calculate percentages safely
    const expiredPercent = calculatePercentage(summaryData.expiredCount, summaryData.totalBatches);
    const lowStockPercent = calculatePercentage(summaryData.lowStockCount, summaryData.totalBatches);
    const healthyPercent = calculatePercentage(
        summaryData.totalBatches - summaryData.expiredCount - summaryData.lowStockCount,
        summaryData.totalBatches,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" /> {/* Simplified Title */}
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {' '}
                    {/* Adjusted grid cols */}
                    {stats.map(
                        (
                            stat, // Use item ID or title for key if stable
                        ) => (
                            <Card key={stat.title}>
                                {' '}
                                {/* Use title as key */}
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    {' '}
                                    {/* Adjusted spacing */}
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                    <stat.icon
                                        className={cn('text-muted-foreground h-4 w-4', {
                                            'text-red-500': stat.alert === 'error',
                                            'text-yellow-500': stat.alert === 'warning',
                                            'text-blue-500': stat.alert === 'info', // Assuming info maps to blue
                                        })}
                                    />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div> {/* Slightly smaller font */}
                                    {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */} {/* Example change indicator */}
                                </CardContent>
                            </Card>
                        ),
                    )}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-3">
                    {' '}
                    {/* Flexible grid */}
                    {/* Stock Chart - Using BarChart suggestion */}
                    <Card className="md:col-span-2 lg:col-span-3 xl:col-span-2">
                        <CardHeader>
                            <CardTitle>Stock Status Overview</CardTitle>
                            <CardDescription>Distribution of batch statuses.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ResponsiveContainer width="100%" height={300}>
                                {/* Using BarChart suggestion */}
                                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} stroke="var(--muted-foreground)" />
                                    <Tooltip
                                        cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
                                        contentStyle={{
                                            backgroundColor: 'var(--popover)',
                                            borderColor: 'var(--border)',
                                            color: 'var(--popover-foreground)',
                                            fontSize: '12px',
                                            borderRadius: '0.5rem',
                                        }}
                                    />
                                    <Legend
                                        iconSize={10}
                                        wrapperStyle={{ fontSize: '12px', color: 'var(--muted-foreground)' }} // Use var() directly
                                    />
                                    <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    {/* Stock Alerts */}
                    <Card className="md:col-span-1 lg:col-span-2 xl:col-span-1">
                        <CardHeader>
                            <CardTitle>Critical Alerts</CardTitle>
                            <CardDescription>Top batches requiring attention.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {' '}
                            {/* Use grid for consistent spacing */}
                            {expiredMedicines.length === 0 && lowStockMedicines.length === 0 && (
                                <p className="text-muted-foreground text-sm">No critical alerts.</p>
                            )}
                            {/* Combine alerts and limit total */}
                            {[
                                ...expiredMedicines.map((med) => ({ ...med, alertType: 'Expired' as const })),
                                ...lowStockMedicines.map((med) => ({ ...med, alertType: 'Low Stock' as const })),
                            ]
                                .filter((med, index, self) => index === self.findIndex((t) => t.id === med.id)) // Ensure uniqueness
                                .slice(0, 4) // Limit total alerts shown
                                .map((medicine) => (
                                    <div key={medicine.id} className="flex items-center gap-4">
                                        <Avatar
                                            className={cn('h-9 w-9', {
                                                'bg-red-100': medicine.alertType === 'Expired',
                                                'bg-yellow-100': medicine.alertType === 'Low Stock',
                                            })}
                                        >
                                            <AvatarFallback
                                                className={cn('font-semibold', {
                                                    'text-red-600': medicine.alertType === 'Expired',
                                                    'text-yellow-600': medicine.alertType === 'Low Stock',
                                                })}
                                            >
                                                {medicine.alertType === 'Expired' ? 'EX' : 'LS'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid gap-1">
                                            <p className="text-sm leading-none font-medium">
                                                {medicine.medicine.name}
                                                <span className="text-muted-foreground ml-1 text-xs">(#{medicine.batch_number})</span>
                                            </p>
                                            <p className="text-muted-foreground text-sm">
                                                {medicine.alertType === 'Expired'
                                                    ? `Expired on ${new Date(medicine.expiry_date).toLocaleDateString()}`
                                                    : `Qty: ${medicine.current_quantity}`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </CardContent>
                    </Card>
                    {/* Inventory Health Metrics */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Inventory Health</CardTitle>
                            <CardDescription>Key stock management indicators.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {/* Expired ratio */}
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm font-medium">Expired Batches</span>
                                    <span className="text-sm font-semibold">{expiredPercent}%</span>
                                </div>
                                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                                    <div className="h-full rounded-full bg-red-500" style={{ width: `${expiredPercent}%` }} />
                                </div>
                            </div>
                            {/* Low stock ratio */}
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm font-medium">Low Stock Batches</span>
                                    <span className="text-sm font-semibold">{lowStockPercent}%</span>
                                </div>
                                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                                    <div className="h-full rounded-full bg-yellow-500" style={{ width: `${lowStockPercent}%` }} />
                                </div>
                            </div>
                            {/* Healthy stock ratio */}
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm font-medium">Healthy Batches</span>
                                    <span className="text-sm font-semibold">{healthyPercent}%</span>
                                </div>
                                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                                    <div className="h-full rounded-full bg-green-500" style={{ width: `${healthyPercent}%` }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
