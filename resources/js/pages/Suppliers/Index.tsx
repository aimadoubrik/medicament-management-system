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
// Import the new ResponsiveModal components
import {
    ResponsiveModal,
    ResponsiveModalDescription,
    ResponsiveModalContent,
    ResponsiveModalHeader,
    ResponsiveModalFooter,
    ResponsiveModalTitle,
    ResponsiveModalClose, // Use this for close actions
} from '@/components/ui/responsive-modal'; // Adjusted path
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { resourceFormDefinitions } from '@/definitions/form-definitions';
import AppLayout from '@/layouts/app-layout';
import { SupplierFormData } from '@/schemas/supplier';
import { PageProps, PaginatedResponse, Supplier as SupplierType } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
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

    const { props: { auth } } = usePage<PageProps>();
    const can = auth?.user?.can || {};

    // Modal state management
    const [modalState, setModalState] = useState<{
        mode: 'create' | 'edit' | 'show' | null;
        data: SupplierType | null;
    }>({ mode: null, data: null });
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        // Directly use fields if getFieldsWithOptions is not applicable or not needed for suppliers
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

    // --- Define Table Columns ---
    const columns: ColumnDef<SupplierType>[] = useMemo(() => {
        const actionsColumnDef = baseSupplierColumns.find((col) => col.id === 'actions');
        if (!actionsColumnDef || !actionsColumnDef.cell) {
            console.warn('Actions column definition not found or is invalid in table-definition.tsx');
            return baseSupplierColumns;
        }

        const modifiedActionsColumn: ColumnDef<SupplierType> = {
            ...actionsColumnDef,
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
                            {can.viewSupplier && (
                                <DropdownMenuItem onClick={() => openModal('show', supplier)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>View</span>
                                </DropdownMenuItem>
                            )}
                            {can.editSupplier && (
                                <DropdownMenuItem onClick={() => openModal('edit', supplier)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                            )}
                            {can.deleteSupplier && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onSelect={(e) => e.preventDefault()}
                                        >
                                            <Trash className="mr-2 h-4 w-4" />
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
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        };
        return [...baseSupplierColumns.filter((col) => col.id !== 'actions'), modifiedActionsColumn];
    }, [openModal]);

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

    // --- Modal Description Logic ---
    const getModalDescription = () => {
        switch (modalState.mode) {
            case 'create':
                return 'Create a new supplier by filling out the form below.';
            case 'edit':
                return 'Edit an existing supplier by making changes to the form below.';
            case 'show':
                return 'View details of an existing supplier.';
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
                    {can.createSupplier && (
                        <Button onClick={() => openModal('create')}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Supplier
                        </Button>
                    )}
                </div>

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

            {/* Updated Reusable Modal using the new ResponsiveModal components */}
            <ResponsiveModal
                open={isModalOpen}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        closeModal();
                    }
                }}
            >
                <ResponsiveModalContent side="bottom"> {/* Default side, adjust if needed */}
                    <ResponsiveModalHeader>
                        <ResponsiveModalTitle>{getModalTitle()}</ResponsiveModalTitle>
                        <ResponsiveModalDescription>{getModalDescription()}</ResponsiveModalDescription>
                    </ResponsiveModalHeader>

                    {/* Content: Form or Details View */}
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

                    {modalState.mode === 'show' && modalState.data && (
                        <div className="p-1"> {/* Add padding if SupplierDetails doesn't have it */}
                            <SupplierDetails supplier={modalState.data} />
                        </div>
                    )}

                    {/* Footer for 'show' mode (Close button) */}
                    {modalState.mode === 'show' && (
                        <ResponsiveModalFooter>
                            <ResponsiveModalClose asChild>
                                <Button type="button" variant="secondary">
                                    Close
                                </Button>
                            </ResponsiveModalClose>
                        </ResponsiveModalFooter>
                    )}
                </ResponsiveModalContent>
            </ResponsiveModal>
        </AppLayout>
    );
}