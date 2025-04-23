import { DataTable } from '@/components/data-table';
import { BatchDetails } from '@/components/details/BatchDetails';
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
import { BatchFormData } from '@/schemas/batch';
import { Batch as BatchType, Medicine, PageProps, PaginatedResponse, Supplier } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal, Pencil, PlusCircle, Trash } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { batchColumns as baseBatchColumns, batchColumnVisibility } from './table-definition';

// Define the props specific to this page
interface BatchesIndexProps extends PageProps {
    batches: PaginatedResponse<BatchType>;
    medicines: Medicine[];
    suppliers: Supplier[];
}

export default function Index({ batches: paginatedBatches, medicines, suppliers }: BatchesIndexProps) {
    // Modal state management
    const [modalState, setModalState] = useState<{
        mode: 'create' | 'edit' | 'show' | null;
        data: BatchType | null;
    }>({ mode: null, data: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    // sonner's toast is used directly, no hook needed

    const isModalOpen = modalState.mode !== null;
    const isEditing = modalState.mode === 'edit';

    // --- Modal Control Functions ---
    const openModal = useCallback((mode: 'create' | 'edit' | 'show', data: BatchType | null = null) => {
        setModalState({ mode, data });
    }, []);

    const closeModal = () => {
        setModalState({ mode: null, data: null });
        setIsSubmitting(false);
    };

    // --- Get Form Definition ---
    const batchFormDefinition = resourceFormDefinitions.batches;
    const batchSchema = batchFormDefinition.schema;
    const batchFieldConfig = useMemo(() => {
        if (typeof batchFormDefinition.getFieldsWithOptions === 'function') {
            return batchFormDefinition.getFieldsWithOptions({ medicines, suppliers }); // Pass dependencies as object
        }
        return batchFormDefinition.fields;
    }, [medicines, suppliers, batchFormDefinition]);

    // --- Form Submission Handler ---
    const handleFormSubmit: SubmitHandler<BatchFormData> = (formData) => {
        setIsSubmitting(true);
        const url = isEditing ? route('stock.update', modalState.data!.id) : route('stock.store');
        const method = isEditing ? 'put' : 'post';

        router[method](url, formData, {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                toast.success(`Batch ${isEditing ? 'updated' : 'created'} successfully!`);
            },
            onError: (errors) => {
                console.error('Backend validation errors:', errors);
                const errorMessages = Object.values(errors).flat().join(' ');
                toast.error(`Error ${isEditing ? 'updating' : 'creating'} batch`, {
                    description: errorMessages || 'An unexpected error occurred.',
                });
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    // --- Define Table Columns, modifying the actions cell from table-definition ---
    const columns: ColumnDef<BatchType>[] = useMemo(() => {
        // Find the actions column definition from the base file
        const actionsColumnDef = baseBatchColumns.find((col) => col.id === 'actions');
        if (!actionsColumnDef || !actionsColumnDef.cell) {
            console.warn('Actions column definition not found or is invalid in table-definition.tsx');
            return baseBatchColumns; // Return base columns if actions are missing
        }

        // Create a new actions column definition that calls openModal
        const modifiedActionsColumn: ColumnDef<BatchType> = {
            ...actionsColumnDef, // Copy other properties like id
            cell: ({ row }) => {
                // Override the cell renderer
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
                            <DropdownMenuSeparator />
                            {/* Modified View Item */}
                            <DropdownMenuItem onClick={() => openModal('show', batch)}>
                                <Eye className="mr-2 h-4 w-4" /> {/* Add margin */}
                                <span>View</span>
                            </DropdownMenuItem>
                            {/* Modified Edit Item */}
                            <DropdownMenuItem onClick={() => openModal('edit', batch)}>
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
                                            This action cannot be undone. This will permanently delete the batch "{batch.batch_number}".
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => {
                                                // Keep the delete logic here
                                                router.delete(route('stock.destroy', batch.id), {
                                                    preserveScroll: true,
                                                    onSuccess: () => toast.success('Batch deleted successfully'),
                                                    onError: (errors) =>
                                                        toast.error('Error deleting batch', {
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
        return [...baseBatchColumns.filter((col) => col.id !== 'actions'), modifiedActionsColumn];
    }, [openModal]); // Dependency on openModal

    // --- Modal Title Logic ---
    const getModalTitle = () => {
        switch (modalState.mode) {
            case 'create':
                return 'Add New Batch';
            case 'edit':
                return `Edit Batch: ${modalState.data?.batch_number ?? ''}`;
            case 'show':
                return `Batch Details: ${modalState.data?.batch_number ?? ''}`;
            default:
                return '';
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Batches', href: '/batches' }]}>
            <Head title="Batches" />
            <div className="container mx-auto p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Batches</h1>
                    <Button onClick={() => openModal('create')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Batch
                    </Button>
                </div>

                {/* Data Table */}
                <DataTable
                    columns={columns}
                    paginatedData={paginatedBatches}
                    searchKey="batch_number"
                    searchPlaceholder="Search batches..."
                    inertiaVisitUrl={route('stock.index')}
                    inertiaDataPropName="batches"
                    initialVisibility={batchColumnVisibility}
                    pageSizeOptions={[10, 20, 50, 100]}
                    exportFileName={`batches-${new Date().toISOString().split('T')[0]}`}
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
                        schema={batchSchema}
                        fieldConfig={batchFieldConfig}
                        initialData={modalState.mode === 'edit' ? modalState.data : null}
                        onSubmit={handleFormSubmit}
                        onCancel={closeModal}
                        isLoading={isSubmitting}
                        submitButtonText={isEditing ? 'Update Batch' : 'Create Batch'}
                    />
                )}

                {modalState.mode === 'show' && modalState.data && <BatchDetails batch={modalState.data} />}
            </Modal>
        </AppLayout>
    );
}
