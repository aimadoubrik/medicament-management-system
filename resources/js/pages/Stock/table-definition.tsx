import { createDateColumn, createSelectionColumn, createTextColumn, createNumberColumn } from '@/components/data-table/column-def';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

export type Batch = {
    id: number;
    medicine: {
        id: number;
        name: string;
        generic_name: string | null;
        manufacturer: string | null;
        strength: string | null;
        form: string | null;
        description: string | null;
        category_id: number;
        requires_prescription: boolean;
        low_stock_threshold: number;
        created_at: string;
        updated_at: string;
    };
    supplier: {
        id: number;
        name: string;
        contact_person: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        created_at: string;
        updated_at: string;
    };
    supplier_id: number;
    batch_number: string | null;
    quantity_received: number;
    current_quantity: number;
    manufacture_date: string | null;
    expiry_date: string;
    created_at: string;
    updated_at: string;
};

export const batchColumns: ColumnDef<Batch>[] = [
    createSelectionColumn<Batch>(),
    createTextColumn<Batch>('batch_number', 'Batch Number'),
    createNumberColumn<Batch>('quantity_received', 'Quantity Received'),
    createNumberColumn<Batch>('current_quantity', 'Current Quantity'),
    createDateColumn<Batch>('manufacture_date', 'Manufacture Date'),
    createDateColumn<Batch>('expiry_date', 'Expiry Date'),
    {
        accessorFn: (row) => row.medicine.name,
        header: 'Medicine',
    },
    {
        accessorFn: (row) => row.supplier.name,
        header: 'Supplier',
    },
    createDateColumn<Batch>('created_at', 'Created'),
    createDateColumn<Batch>('updated_at', 'Updated'),
    {
        id: 'actions',
        cell: ({ row }) => {
            const batch = row.original;

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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(batch.id.toString())}>Copy batch ID</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View batch</DropdownMenuItem>
                        <DropdownMenuItem>Edit batch</DropdownMenuItem>
                        <DropdownMenuItem>Delete batch</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

// Default visibility for responsive design
export const batchColumnVisibility = {
    batch_number: true,
    quantity_received: true,
    current_quantity: true,
    manufacture_date: false,
    expiry_date: true,
    "medicine.name": false,
    "supplier.name": false,
    created_at: false,
    updated_at: false,
};
