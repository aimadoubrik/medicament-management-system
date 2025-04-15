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

// This type is used to define the structure of a medicine object.
export type Medicine = {
    id: number;
    name: string;
    generic_name: string | null;
    manufacturer: string | null;
    strength: string | null;
    form: string | null;
    description: string | null;
    category_id: number;
    category: {
        id: number;
        name: string;
        description: string;
        created_at: string;
        updated_at: string;
    };
    requires_prescription: boolean;
    low_stock_threshold: number | null;
    created_at: string;
    updated_at: string;
};


export const medicineColumns: ColumnDef<Medicine>[] = [
    createSelectionColumn<Medicine>(),
    createTextColumn<Medicine>('name', 'Name'),
    createTextColumn<Medicine>('generic_name', 'Generic Name'),
    createTextColumn<Medicine>('manufacturer', 'Manufacturer'),
    createTextColumn<Medicine>('strength', 'Strength'),
    createTextColumn<Medicine>('form', 'Form'),
    createBooleanColumn<Medicine>('requires_prescription', 'Prescription Required'),
    createDateColumn<Medicine>('created_at', 'Created'),
    createDateColumn<Medicine>('updated_at', 'Updated'),
    {
        accessorFn: (row) => row.category.name,
        id: 'category',
        header: 'Category',
    },
    createTextColumn<Medicine>('description', 'Description'),
    createTextColumn<Medicine>('low_stock_threshold', 'Low Stock Threshold'),
    {
        id: 'actions',
        cell: ({ row }) => {
            const medicine = row.original;

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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(medicine.id.toString())}>Copy medicine ID</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem> View medicine </DropdownMenuItem>
                        <DropdownMenuItem> Edit medicine </DropdownMenuItem>
                        <DropdownMenuItem> Delete medicine </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];


// Default visibility for responsive design
export const medicineColumnVisibility = {
    name: true,
    generic_name: true,
    manufacturer: false,
    strength: false,
    form: false,
    description: false,
    'category.name': true,
    requires_prescription: true,
    low_stock_threshold: false,
    created_at: false,
    updated_at: false,
};
