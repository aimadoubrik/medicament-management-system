import { createDateColumn, createSelectionColumn, createTextColumn } from '@/components/data-table/column-def';
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
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { toast } from 'sonner';

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
                                        This action cannot be undone. This will permanently delete the supplier.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => {
                                            router.delete(`suppliers/${supplier.id}`, {
                                                onSuccess: () => {
                                                    toast.success('Supplier deleted successfully');
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
export const supplierColumnVisibility = {
    name: true,
    contact_person: true,
    email: true,
    phone: true,
    address: false,
    created_at: false,
    updated_at: false,
};
