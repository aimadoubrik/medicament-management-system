import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Pill, Package2, Calendar, TrendingUp} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define the props interface based on data from DashboardController
interface DashboardProps {
    summaryData: {
        lowStockMedicines: number;
        expiringSoonMedicines: number;
        expiredMedicines: number;
        totalMedicines: number;
    };
    lowStockMedicines: any[];
    expiringSoonMedicines: any[];
    expiredMedicines: any[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ summaryData, lowStockMedicines, expiringSoonMedicines, expiredMedicines }: DashboardProps) {
    // Define statistics cards based on summaryData
    const stats = [
        { title: 'Low Stock Medications', value: summaryData.lowStockMedicines.toString(), alert: 'warning', icon: AlertTriangle },
        { title: 'Expiring Soon Medications', value: summaryData.expiringSoonMedicines.toString(), alert: 'warning', icon: Calendar },
        { title: 'Expired Medications', value: summaryData.expiredMedicines.toString(), alert: 'error', icon: Pill },
        { title: 'Total Medications', value: summaryData.totalMedicines.toString(), alert: 'info', icon: Package2 },
    ];

    // Sample chart data based on our medicine categories
    const chartData = [
        { name: 'Low Stock', value: summaryData.lowStockMedicines },
        { name: 'Expiring Soon', value: summaryData.expiringSoonMedicines },
        { name: 'Expired', value: summaryData.expiredMedicines },
        { name: 'In Stock', value: summaryData.totalMedicines - (summaryData.lowStockMedicines + summaryData.expiredMedicines) }
    ];

    // Combine the medicines array for display, prioritizing expired, then low stock, then expiring soon
    const medicationsToDisplay = [
        ...expiredMedicines.map(med => ({ ...med, status: 'Expired' })),
        ...lowStockMedicines.map(med => ({ ...med, status: 'Low Stock' })),
        ...expiringSoonMedicines.map(med => ({ ...med, status: 'Expiring Soon' }))
    ].slice(0, 5); // Display at most 5 items

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Medication Stock Management Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    {stats.map((stat, index) => (
                        <Card key={index} className="overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <stat.icon className={`h-4 w-4 ${stat.alert === 'error' ? 'text-red-500' :
                                        stat.alert === 'warning' ? 'text-yellow-500' :
                                            'text-muted-foreground'
                                    }`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Stock Chart */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Medicine Stock Status</CardTitle>
                               
                            </div>
                            <CardDescription>Overview of medicine stock conditions</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={chartData}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stock Alerts */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Critical Alerts</CardTitle>
                            <CardDescription>Medications requiring attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {expiredMedicines.slice(0, 3).map((medicine, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <Avatar className="h-9 w-9 bg-red-100">
                                            <AvatarFallback className="text-red-600">EX</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium">{medicine.medicine.name} has expired</p>
                                            <p className="text-sm text-muted-foreground">Expired on {new Date(medicine.expiry_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}

                                {lowStockMedicines.slice(0, 3).map((medicine, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <Avatar className="h-9 w-9 bg-yellow-100">
                                            <AvatarFallback className="text-yellow-600">LS</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium">{medicine.medicine.name} is low on stock</p>
                                            <p className="text-sm text-muted-foreground">Current quantity: {medicine.current_quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Medications Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Critical Medications</CardTitle>
                                <CardDescription>5 Medications that need attention</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Batch Number</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Expiry Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {medicationsToDisplay.map((med, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium">{med.medicine.name}</TableCell>
                                        <TableCell>{med.batch_number}</TableCell>
                                        <TableCell>{med.current_quantity}</TableCell>
                                        <TableCell>{new Date(med.expiry_date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${med.status === 'Expired'
                                                        ? 'bg-red-100 text-red-800'
                                                        : med.status === 'Low Stock'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}
                                            >
                                                {med.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Goals Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Health Metrics</CardTitle>
                        <CardDescription>Track key stock management indicators</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Expired ratio */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Expired Medications Ratio</span>
                                    </div>
                                    <span className="text-sm font-medium">
                                        {Math.round((summaryData.expiredMedicines / summaryData.totalMedicines) * 100)}%
                                    </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-muted">
                                    <div
                                        className="h-2 rounded-full bg-red-500"
                                        style={{ width: `${Math.round((summaryData.expiredMedicines / summaryData.totalMedicines) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Low stock ratio */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Low Stock Medications Ratio</span>
                                    </div>
                                    <span className="text-sm font-medium">
                                        {Math.round((summaryData.lowStockMedicines / summaryData.totalMedicines) * 100)}%
                                    </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-muted">
                                    <div
                                        className="h-2 rounded-full bg-yellow-500"
                                        style={{ width: `${Math.round((summaryData.lowStockMedicines / summaryData.totalMedicines) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Healthy stock ratio */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Healthy Stock Ratio</span>
                                    </div>
                                    <span className="text-sm font-medium">
                                        {Math.round(((summaryData.totalMedicines - summaryData.lowStockMedicines - summaryData.expiredMedicines) / summaryData.totalMedicines) * 100)}%
                                    </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-muted">
                                    <div
                                        className="h-2 rounded-full bg-green-500"
                                        style={{ width: `${Math.round(((summaryData.totalMedicines - summaryData.lowStockMedicines - summaryData.expiredMedicines) / summaryData.totalMedicines) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}