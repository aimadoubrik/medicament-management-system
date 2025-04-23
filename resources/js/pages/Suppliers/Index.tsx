import { DataTable } from '@/components/data-table';
import { SupplierDetails } from '@/components/details/SupplierDetails';
import { ResourceForm } from '@/components/forms/ResourceForm';
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
import { DialogClose } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Modal } from '@/components/ui/Modal';
import { resourceFormDefinitions } from '@/definitions/form-definitions';
import AppLayout from '@/layouts/app-layout';
import { SupplierFormData } from '@/schemas/supplier';
import { PageProps, PaginatedResponse, Supplier as SupplierType } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal, Pencil, PlusCircle, Trash } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { supplierColumns as baseSupplierColumns, supplierColumnVisibility } from './table-definition';

// Define the props specific to this page
interface SuppliersIndexProps extends PageProps {
    suppliers: PaginatedResponse<SupplierType>;
}

export default function Index({ suppliers: paginatedSuppliers }: SuppliersIndexProps) {
    // Modal state management
    const [modalState, setModalState] = useState<{
        mode: 'create' | 'edit' | 'show' | null;
        data: SupplierType | null;
    }>({ mode: null, data: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    // sonner's toast is used directly, no hook needed

    const isModalOpen = modalState.mode !== null;
    const isEditing = modalState.mode === 'edit';

    // --- Modal Control Functions ---
    const openModal = useCallback((mode: 'create' | 'edit' | 'show', data: SupplierType | null = null) => {
        setModalState({ mode, data });
    }, []);

    const closeModal = () => {
        setModalState({ mode: null, data: null });
        setIsSubmitting(false);
    };

    // --- Get Form Definition ---
    const supplierFormDefinition = resourceFormDefinitions.suppliers;
    const supplierSchema = supplierFormDefinition.schema;
    const supplierFieldConfig = useMemo(() => {
        return supplierFormDefinition.fields;
    }, [supplierFormDefinition]);

    // --- Form Submission Handler ---
    const handleFormSubmit: SubmitHandler<SupplierFormData> = (formData) => {
        setIsSubmitting(true);
        const url = isEditing ? route('suppliers.update', modalState.data!.id) : route('suppliers.store');
        const method = isEditing ? 'put' : 'post';

        router[method](url, formData, {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                toast.success(`Supplier ${isEditing ? 'updated' : 'created'} successfully!`);
            },
            onError: (errors) => {
                console.error('Backend validation errors:', errors);
                const errorMessages = Object.values(errors).flat().join(' ');
                toast.error(`Error ${isEditing ? 'updating' : 'creating'} supplier`, {
                    description: errorMessages || 'An unexpected error occurred.',
                });
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    // --- Define Table Columns, modifying the actions cell from table-definition ---
    const columns: ColumnDef<SupplierType>[] = useMemo(() => {
        // Find the actions column definition from the base file
        const actionsColumnDef = baseSupplierColumns.find((col) => col.id === 'actions');
        if (!actionsColumnDef || !actionsColumnDef.cell) {
            console.warn('Actions column definition not found or is invalid in table-definition.tsx');
            return baseSupplierColumns; // Return base columns if actions are missing
        }

        // Create a new actions column definition that calls openModal
        const modifiedActionsColumn: ColumnDef<SupplierType> = {
            ...actionsColumnDef, // Copy other properties like id
            cell: ({ row }) => {
                // Override the cell renderer
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
                            {/* Modified View Item */}
                            <DropdownMenuItem onClick={() => openModal('show', supplier)}>
                                <Eye className="mr-2 h-4 w-4" /> {/* Add margin */}
                                <span>View</span>
                            </DropdownMenuItem>
                            {/* Modified Edit Item */}
                            <DropdownMenuItem onClick={() => openModal('edit', supplier)}>
                                <Pencil className="mr-2 h-4 w-4" /> {/* Add margin */}
                                <span>Edit</span>
                            </DropdownMenuItem>
                            {/* Delete Item with AlertDialog (Structure from your table-definition) */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onSelect={(e) => e.preventDefault()} // Important to prevent auto-close
                                    >
                                        <Trash className="mr-2 h-4 w-4" /> {/* Add margin */}
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the supplier "{supplier.name}".
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => {
                                                // Keep the delete logic here
                                                router.delete(route('suppliers.destroy', supplier.id), {
                                                    preserveScroll: true,
                                                    onSuccess: () => toast.success('Supplier deleted successfully'),
                                                    onError: (errors) =>
                                                        toast.error('Error deleting supplier', {
                                                            description: Object.values(errors).flat().join(' '),
                                                        }),
                                                });
                                            }}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
        };

        // Return all columns except the original actions column, plus the modified one
        return [...baseSupplierColumns.filter((col) => col.id !== 'actions'), modifiedActionsColumn];
    }, [openModal]); // Dependency on openModal

    // --- Modal Title Logic ---
    const getModalTitle = () => {
        switch (modalState.mode) {
            case 'create':
                return 'Add New Supplier';
            case 'edit':
                return `Edit Supplier: ${modalState.data?.name ?? ''}`;
            case 'show':
                return `Supplier Details: ${modalState.data?.name ?? ''}`;
            default:
                return '';
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Suppliers', href: '/suppliers' }]}>
            <Head title="Suppliers" />
            <div className="container mx-auto p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Suppliers</h1>
                    <Button onClick={() => openModal('create')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Supplier
                    </Button>
                </div>

                {/* Data Table */}
                <DataTable
                    columns={columns}
                    paginatedData={paginatedSuppliers}
                    searchKey="name"
                    searchPlaceholder="Search suppliers..."
                    inertiaVisitUrl={route('suppliers.index')}
                    inertiaDataPropName="suppliers"
                    initialVisibility={supplierColumnVisibility}
                    pageSizeOptions={[10, 20, 50, 100]}
                    exportFileName={`suppliers-${new Date().toISOString().split('T')[0]}`}
                />
            </div>

            {/* Reusable Modal */}
            <Modal
                title={getModalTitle()}
                isOpen={isModalOpen}
                onClose={closeModal}
                footerContent={
                    modalState.mode === 'show' ? (
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" onClick={closeModal}>
                                Close
                            </Button>
                        </DialogClose>
                    ) : null
                }
            >
                {/* Conditionally Render Form or Details View */}
                {(modalState.mode === 'create' || modalState.mode === 'edit') && (
                    <ResourceForm
                        schema={supplierSchema}
                        fieldConfig={supplierFieldConfig}
                        initialData={modalState.mode === 'edit' ? modalState.data : null}
                        onSubmit={handleFormSubmit}
                        onCancel={closeModal}
                        isLoading={isSubmitting}
                        submitButtonText={isEditing ? 'Update Supplier' : 'Create Supplier'}
                    />
                )}

                {modalState.mode === 'show' && modalState.data && <SupplierDetails supplier={modalState.data} />}
            </Modal>
        </AppLayout>
    );
}
