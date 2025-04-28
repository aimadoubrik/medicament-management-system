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
import type { Category as CategoryType } from '@/types'; // Use the specific type alias
import { type Router } from '@inertiajs/core'; // Import Inertia Router type
import { type ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl'; // Import for i18n
import { toast } from 'sonner';
import { type route as routeFn } from 'ziggy-js'; // Import Ziggy's route function type (adjust if needed)

// Define the props required by the column generator function
interface CategoryColumnsProps {
    openModal: (mode: 'create' | 'edit' | 'show', data: CategoryType | null) => void;
    router: Router;
    route: typeof routeFn; // Use the actual type of your route function
}

// Function to generate the columns, accepting dependencies
export const getCategoryColumns = ({ openModal, router, route }: CategoryColumnsProps): ColumnDef<CategoryType>[] => {
    const intl = useIntl();

    const categoryNameHeader = intl.formatMessage({
        id: 'categories.table.headers.name',
        defaultMessage: 'Name',
    });
    const categoryDescriptionHeader = intl.formatMessage({
        id: 'categories.table.headers.description',
        defaultMessage: 'Description',
    });
    const createdAtHeader = intl.formatMessage({
        id: 'categories.table.headers.created_at',
        defaultMessage: 'Created At',
    });
    const updatedAtHeader = intl.formatMessage({
        id: 'categories.table.headers.updated_at',
        defaultMessage: 'Updated At',
    });

    return [
        createSelectionColumn<CategoryType>(),
        createTextColumn<CategoryType>('name', categoryNameHeader), // Add sorting param if needed
        createTextColumn<CategoryType>('description', categoryDescriptionHeader), // Add sorting param if needed
        createDateColumn<CategoryType>('created_at', createdAtHeader), // Add sorting param if needed
        createDateColumn<CategoryType>('updated_at', updatedAtHeader), // Add sorting param if needed
        {
            id: 'actions',
            cell: ({ row }) => {
                const category = row.original;

                return (
                    // Ensure content aligns right if header is removed/implicit
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">
                                        <FormattedMessage id="common.open_menu" defaultMessage="Open menu" />
                                    </span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                    <FormattedMessage id="common.actions" defaultMessage="Actions" />
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {/* View Item - Uses openModal from props */}
                                <DropdownMenuItem onClick={() => openModal('show', category)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>
                                        <FormattedMessage id="common.view" defaultMessage="View" />
                                    </span>
                                </DropdownMenuItem>
                                {/* Edit Item - Uses openModal from props */}
                                <DropdownMenuItem onClick={() => openModal('edit', category)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span>
                                        <FormattedMessage id="common.edit" defaultMessage="Edit" />
                                    </span>
                                </DropdownMenuItem>
                                {/* Delete Item - Uses router/route from props */}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onSelect={(e) => e.preventDefault()} // Keep dropdown open
                                        >
                                            <Trash className="mr-2 h-4 w-4" />
                                            <span>
                                                <FormattedMessage id="common.delete" defaultMessage="Delete" />
                                            </span>
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                <FormattedMessage id="alert.confirm_delete.title" defaultMessage="Are you absolutely sure?" />
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                <FormattedMessage
                                                    id="alert.confirm_delete.description"
                                                    defaultMessage='This action cannot be undone. This will permanently delete the category "{categoryName}".'
                                                    values={{ categoryName: category.name }}
                                                />
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                <FormattedMessage id="common.cancel" defaultMessage="Cancel" />
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => {
                                                    router.delete(route('categories.destroy', category.id), {
                                                        preserveScroll: true,
                                                        onSuccess: () => toast.success('Category deleted successfully'),
                                                        onError: (errors) =>
                                                            toast.error('Error deleting category', {
                                                                description: Object.values(errors).flat().join(' '),
                                                            }),
                                                    });
                                                }}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                <FormattedMessage id="common.delete" defaultMessage="Delete" />
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
            enableSorting: false, // Typically actions aren't sortable
            enableHiding: false, // Or hideable
        },
    ];
};

// Default visibility for responsive design
export const categoryColumnVisibility = {
    id: true,
    name: true,
    description: true,
    created_at: false,
    updated_at: false,
    actions: true,
};
