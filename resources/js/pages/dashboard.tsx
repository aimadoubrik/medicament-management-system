import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { BarChart3, AlertTriangle, Pill, Package2, Calendar, Bell, TrendingUp, Download, Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    // Sample data
    const stats = [
        { title: 'Low Stock Medications', value: '15', alert: 'warning', icon: AlertTriangle },
        { title: 'Expired Medications', value: '8', alert: 'error', icon: Pill },
        { title: 'Total Medications', value: '106', alert: 'info', icon: Pill },
    ];

    const medications = [
        { id: '1', name: 'Paracetamol', quantity: 50, expiry: '2025-06-15', category: 'Pain Relief', status: 'Low' },
        { id: '2', name: 'Aspirin', quantity: 10, expiry: '2025-03-10', category: 'Pain Relief', status: 'Expired' },
        { id: '3', name: 'Amoxicillin', quantity: 200, expiry: '2026-01-20', category: 'Antibiotic', status: 'In Stock' },
    ];

    const notifications = [
        { id: '1', message: 'Paracetamol stock below threshold', time: '2 mins ago', action: 'Restock' },
        { id: '2', message: 'Aspirin expired', time: '1 hr ago', action: 'Remove' },
        { id: '3', message: 'New stock added: Amoxicillin', time: 'Yesterday', action: 'View' },
    ];

    const goals = [
        { title: 'Reduce Expired Stock', progress: 80 },
        { title: 'Maintain Stock Levels', progress: 65 },
        { title: 'Optimize Turnover', progress: 45 },
    ];


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock Management Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {stats.map((stat, index) => (
                        <Card key={index} className="overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <stat.icon className={`h-4 w-4 ${stat.alert === 'error' ? 'text-red-500' : stat.alert === 'warning' ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Stock Trend Chart */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Stock Trends</CardTitle>
                                <Button variant="outline" size="sm" className="h-8">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Last 30 days
                                </Button>
                            </div>
                            <CardDescription>Monitor stock levels over time</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px] w-full flex items-center justify-center">
                                {/* Placeholder for Chart.js or similar */}
                                <BarChart3 className="h-16 w-16 text-muted-foreground" />
                                <span className="ml-2 text-muted-foreground">Stock trend chart would render here</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Alerts</CardTitle>
                            <CardDescription>Critical stock updates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className="flex items-center gap-4">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>ST</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium">{notification.message}</p>
                                            <p className="text-sm text-muted-foreground">{notification.time}</p>
                                        </div>
                                        <Button variant="outline" size="sm">{notification.action}</Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Medications Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Medications Inventory</CardTitle>
                        <CardDescription>Manage your stock levels</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Expiry Date</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {medications
                                    .map((med) => (
                                        <TableRow key={med.id}>
                                            <TableCell>{med.name}</TableCell>
                                            <TableCell>{med.quantity}</TableCell>
                                            <TableCell>{med.expiry}</TableCell>
                                            <TableCell>{med.category}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${
                                                        med.status === 'Low'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : med.status === 'Expired'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}
                                                >
                                                    {med.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm">Restock</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Goals */}
                <Card>
                    <CardHeader>
                        <CardTitle>Stock Management Goals</CardTitle>
                        <CardDescription>Track key inventory metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {goals.map((goal, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{goal.title}</span>
                                        </div>
                                        <span className="text-sm font-medium">{goal.progress}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}