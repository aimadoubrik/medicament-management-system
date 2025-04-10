import { createBooleanColumn, createDateColumn, createSelectionColumn, createTextColumn } from '@/components/data-table/column-def';
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

export type Product = {
    id: number;
    name: string;
    generic_name: string | null;
    manufacturer: string | null;
    strength: string | null;
    form: string | null;
    description: string | null;
    category_id: number;
    requires_prescription: boolean;
    low_stock_threshold: number | null;
    created_at: string;
    updated_at: string;
};

export const productColumns: ColumnDef<Product>[] = [
    createSelectionColumn<Product>(),
    createTextColumn<Product>('name', 'Name'),
    createTextColumn<Product>('generic_name', 'Generic Name'),
    createTextColumn<Product>('manufacturer', 'Manufacturer'),
    createTextColumn<Product>('strength', 'Strength'),
    createTextColumn<Product>('form', 'Form'),
    createBooleanColumn<Product>('requires_prescription', 'Prescription Required'),
    createDateColumn<Product>('created_at', 'Created'),
    createDateColumn<Product>('updated_at', 'Updated'),
    createTextColumn<Product>('category_id', 'Category ID'),
    createTextColumn<Product>('description', 'Description'),
    createTextColumn<Product>('low_stock_threshold', 'Low Stock Threshold'),
    {
        id: 'actions',
        cell: ({ row }) => {
            const product = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only"> Open menu </span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions </DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(product.id.toString())}>Copy product ID</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem> View product </DropdownMenuItem>
                        <DropdownMenuItem> Edit product </DropdownMenuItem>
                        <DropdownMenuItem> Delete product </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

// Default visibility for responsive design
export const productColumnVisibility = {
    name: true,
    generic_name: true,
    manufacturer: false,
    strength: false,
    form: false,
    description: false,
    category_id: false,
    requires_prescription: true,
    low_stock_threshold: false,
    created_at: false,
    updated_at: false,
};
