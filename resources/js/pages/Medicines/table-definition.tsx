import { createDateColumn, createNumberColumn, createSelectionColumn, createTextColumn } from '@/components/data-table/column-def';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Medicine } from '@/types';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { toast } from 'sonner';

export const medicineColumns: ColumnDef<Medicine>[] = [
    createSelectionColumn<Medicine>(),
    createTextColumn<Medicine>('name', 'Name'),
    createTextColumn<Medicine>('manufacturer_distributor', 'Manufacturer/Distributor'),
    {
        accessorKey: 'total_stock',
        header: 'Total Stock',
        cell: ({ row }) => {
            return row.original.medicine_stock_summaries?.total_quantity_in_stock || 0;
        }
    },
    createTextColumn<Medicine>('dosage', 'Dosage'),
    createTextColumn<Medicine>('form', 'Form'),
    createTextColumn<Medicine>('unit_of_measure', 'Unit of Measure'),
    createDateColumn<Medicine>('created_at', 'Created'),
    createDateColumn<Medicine>('updated_at', 'Updated'),
    createTextColumn<Medicine>('reorder_level', 'Reorder Level'),
    createTextColumn<Medicine>('description', 'Description'),
    {
        id: 'actions',
        cell: ({ row }) => {
            const medicine = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Pencil className="h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                                    <Trash className="h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the medicine.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => {
                                            router.delete(`/medicines/${medicine.id}`, {
                                                onSuccess: () => {
                                                    toast.success('Medicine deleted successfully');
                                                },
                                            });
                                        }}
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

// Default visibility for responsive design
export const medicineColumnVisibility = {
    name: true,
    manufacturer_distributor: true,
    dosage: false,
    form: false,
    unit_of_measure: false,
    reorder_level: true,
    description: false,
    'medicine_stock_summaries.total_quantity_in_stock': true,
    created_at: false,
    updated_at: false,
};
