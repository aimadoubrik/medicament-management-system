import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertTriangle, Calendar, Package2, Pill } from 'lucide-react';
// Consider BarChart for categorical data visualization
import { cn } from '@/lib/utils'; // Assuming shadcn/ui setup includes this utility
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Define the props interface based on data from the *improved* DashboardController
interface MedicineBatch {
    // Renamed for clarity - represents a batch row
    id: number; // Added for unique key prop
    medicine: {
        name: string;
    };
    batch_number: string;
    current_quantity: number;
    expiry_date: string;
    // The controller adds these flags, useful if needed directly, though status is derived below
    is_low_stock: 0 | 1;
    is_expiring_soon: 0 | 1;
    is_expired: 0 | 1;
}

interface DashboardProps {
    summaryData: {
        lowStockCount: number; // Fixed key
        expiringSoonCount: number; // Fixed key
        expiredCount: number; // Fixed key
        totalBatches: number; // Fixed key (represents total batches)
    };
    lowStockMedicines: MedicineBatch[];
    expiringSoonMedicines: MedicineBatch[];
    expiredMedicines: MedicineBatch[];
}

// Added type for combined list items
interface DisplayMedicine extends MedicineBatch {
    status: 'Expired' | 'Low Stock' | 'Expiring Soon';
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'), // Use Ziggy route helper if available
    },
];

// Helper function for calculating percentage safely
const calculatePercentage = (numerator: number, denominator: number): number => {
    if (denominator === 0) {
        return 0; // Avoid division by zero
    }
    return Math.round((numerator / denominator) * 100);
};

export default function Dashboard({ summaryData, lowStockMedicines, expiringSoonMedicines, expiredMedicines }: DashboardProps) {
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
        // Calculate 'Healthy' (Not low stock, not expired)
        { name: 'Healthy', value: Math.max(0, summaryData.totalBatches - (summaryData.lowStockCount + summaryData.expiredCount)) },
    ];

    // Combine the medicines array for display, prioritizing expired, then low stock, then expiring soon
    // Ensure we don't duplicate items if they are both low stock AND expiring soon
    // We can use a Map to ensure uniqueness based on ID if needed, but simple concat is likely fine here
    // as the backend queries are distinct states (though low stock can overlap with expiring/expired)
    // Let's stick to the original priority logic:
    const medicationsToDisplay: DisplayMedicine[] = [
        ...expiredMedicines.map((med) => ({ ...med, status: 'Expired' as const })),
        ...lowStockMedicines.map((med) => ({ ...med, status: 'Low Stock' as const })),
        ...expiringSoonMedicines.map((med) => ({ ...med, status: 'Expiring Soon' as const })),
    ]
        // Simple filtering for duplicates if an item could be in multiple lists (e.g. low AND expiring)
        .filter((med, index, self) => index === self.findIndex((t) => t.id === med.id))
        .slice(0, 5); // Display at most 5 items

    // Calculate percentages safely
    const expiredPercent = calculatePercentage(summaryData.expiredCount, summaryData.totalBatches);
    const lowStockPercent = calculatePercentage(summaryData.lowStockCount, summaryData.totalBatches);
    const healthyPercent = calculatePercentage(
        summaryData.totalBatches - summaryData.expiredCount - summaryData.lowStockCount, // Simplified Healthy calc
        summaryData.totalBatches,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Medication Stock Dashboard" /> {/* Simplified Title */}
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                {' '}
                {/* Added responsive padding/gap */}
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
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="var(--border)" // Use var() directly
                                    />
                                    <XAxis
                                        dataKey="name"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        stroke="var(--muted-foreground)" // Use var() directly
                                    />
                                    <YAxis
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                        stroke="var(--muted-foreground)" // Use var() directly
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'var(--muted)', opacity: 0.5 }} // Use var() directly
                                        contentStyle={{
                                            backgroundColor: 'var(--popover)', // Use var() directly
                                            borderColor: 'var(--border)', // Use var() directly
                                            color: 'var(--popover-foreground)', // Use var() directly
                                            fontSize: '12px',
                                            borderRadius: '0.5rem',
                                        }}
                                    />
                                    <Legend
                                        iconSize={10}
                                        wrapperStyle={{ fontSize: '12px', color: 'var(--muted-foreground)' }} // Use var() directly
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill="var(--primary)" // *** THE FIX *** Use var() directly
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                                {/* Original LineChart kept for reference if needed
                                 <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                     <CartesianGrid strokeDasharray="3 3" />
                                     <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false}/>
                                     <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false}/>
                                     <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '0.5rem' }}/>
                                     <Legend iconSize={10} wrapperStyle={{fontSize: '12px'}}/>
                                     <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} strokeWidth={2}/>
                                 </LineChart>
                                */}
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
                </div>
                {/* Combined Medications Table & Health Metrics */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {/* Medications Table */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Attention Required Batches</CardTitle>
                            <CardDescription>Showing top {medicationsToDisplay.length} expired, low stock, or expiring soon batches.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="hidden sm:table-cell">Batch#</TableHead> {/* Hide on small */}
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Expiry Date</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {medicationsToDisplay.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                No medications require immediate attention.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {medicationsToDisplay.map((med) => (
                                        <TableRow key={med.id}>
                                            {' '}
                                            {/* Fixed key */}
                                            <TableCell className="font-medium">{med.medicine.name}</TableCell>
                                            <TableCell className="hidden sm:table-cell">{med.batch_number}</TableCell> {/* Hide on small */}
                                            <TableCell>{med.current_quantity}</TableCell>
                                            <TableCell>{new Date(med.expiry_date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={cn('rounded-full px-2 py-0.5 text-xs font-medium', {
                                                        // Adjusted padding/font
                                                        'bg-red-100 text-red-800': med.status === 'Expired',
                                                        'bg-yellow-100 text-yellow-800': med.status === 'Low Stock',
                                                        'bg-blue-100 text-blue-800': med.status === 'Expiring Soon',
                                                    })}
                                                >
                                                    {med.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        {/* Keep footer if pagination/view all is intended */}
                        <CardFooter className="justify-end">
                            <Button variant="outline" size="sm" disabled>
                                View All
                            </Button>{' '}
                            {/* Disabled example */}
                        </CardFooter>
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
