import { createDateColumn, createSelectionColumn, createTextColumn } from '@/components/data-table/column-def';
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

export type Supplier = {
    id: number;
    name: string;
    contact_person: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    created_at: string;
    updated_at: string;
};

export const supplierColumns: ColumnDef<Supplier>[] = [
    createSelectionColumn<Supplier>(),
    createTextColumn<Supplier>('name', 'Name'),
    createTextColumn<Supplier>('contact_person', 'Contact Person'),
    createTextColumn<Supplier>('email', 'Email'),
    createTextColumn<Supplier>('phone', 'Phone'),
    createTextColumn<Supplier>('address', 'Address'),
    createDateColumn<Supplier>('created_at', 'Created'),
    createDateColumn<Supplier>('updated_at', 'Updated'),
    {
        id: 'actions',
        cell: ({ row }) => {
            const supplier = row.original;

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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(supplier.id.toString())}>Copy supplier ID</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View supplier</DropdownMenuItem>
                        <DropdownMenuItem>Edit supplier</DropdownMenuItem>
                        <DropdownMenuItem>Delete supplier</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

// Default visibility for responsive design
export const supplierColumnVisibility = {
    name: true,
    contact_person: true,
    email: true,
    phone: true,
    address: false,
    created_at: false,
    updated_at: false,
};
