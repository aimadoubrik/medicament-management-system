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

export type Category = {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
};

export const categoryColumns: ColumnDef<Category>[] = [
    createSelectionColumn<Category>(),
    createTextColumn<Category>('name', 'Name'),
    createTextColumn<Category>('description', 'Description'),
    createDateColumn<Category>('created_at', 'Created'),
    createDateColumn<Category>('updated_at', 'Updated'),
    {
        id: 'actions',
        cell: ({ row }) => {
            const category = row.original;

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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(category.id.toString())}>Copy category ID</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View category</DropdownMenuItem>
                        <DropdownMenuItem>Edit category</DropdownMenuItem>
                        <DropdownMenuItem>Delete category</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

// Default visibility for responsive design
export const categoryColumnVisibility = {
    name: true,
    description: true,
    created_at: false,
    updated_at: false,
};
