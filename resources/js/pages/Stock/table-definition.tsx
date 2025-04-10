import { createBooleanColumn, createDateColumn, createSelectionColumn, createTextColumn, createNumberColumn } from '@/components/data-table/column-def';
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
    product_id: number;
    supplier_id: number;
    batch_number: string | null;
    quantity_received: number;
    current_quantity: number;
    cost_price: number;
    selling_price: number;
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
    createNumberColumn<Batch>('cost_price', 'Cost Price'),
    createNumberColumn<Batch>('selling_price', 'Selling Price'),
    createDateColumn<Batch>('manufacture_date', 'Manufacture Date'),
    createDateColumn<Batch>('expiry_date', 'Expiry Date'),
    createTextColumn<Batch>('product_id', 'Product ID'),
    createTextColumn<Batch>('supplier_id', 'Supplier ID'),
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
    cost_price: true,
    selling_price: true,
    manufacture_date: false,
    expiry_date: true,
    product_id: false,
    supplier_id: false,
    created_at: false,
    updated_at: false,
};
