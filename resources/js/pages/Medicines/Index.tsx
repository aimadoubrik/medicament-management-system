import { DataTable } from '@/components/data-table';
import { MedicineDetails } from '@/components/details/MedicineDetails';
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
import { MedicineFormData } from '@/schemas/medicine';
import { Category, Medicine as MedicineType, PageProps, PaginatedResponse } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal, Pencil, PlusCircle, Trash } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { medicineColumns as baseMedicineColumns, medicineColumnVisibility } from './table-definition';

// Define the props specific to this page
interface MedicinesIndexProps extends PageProps {
    medicines: PaginatedResponse<MedicineType>;
    categories: Category[];
}

export default function Index({ medicines: paginatedMedicines, categories }: MedicinesIndexProps) {
    // Modal state management
    const [modalState, setModalState] = useState<{
        mode: 'create' | 'edit' | 'show' | null;
        data: MedicineType | null;
    }>({ mode: null, data: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    // sonner's toast is used directly, no hook needed

    const isModalOpen = modalState.mode !== null;
    const isEditing = modalState.mode === 'edit';

    // --- Modal Control Functions ---
    const openModal = useCallback((mode: 'create' | 'edit' | 'show', data: MedicineType | null = null) => {
        setModalState({ mode, data });
    }, []);

    const closeModal = () => {
        setModalState({ mode: null, data: null });
        setIsSubmitting(false);
    };

    // --- Get Form Definition ---
    const medicineFormDefinition = resourceFormDefinitions.medicines;
    const medicineSchema = medicineFormDefinition.schema;
    const medicineFieldConfig = useMemo(() => {
        if (typeof medicineFormDefinition.getFieldsWithOptions === 'function') {
            return medicineFormDefinition.getFieldsWithOptions({ categories }); // Pass dependencies as object
        }
        return medicineFormDefinition.fields;
    }, [categories, medicineFormDefinition]);

    // --- Form Submission Handler ---
    const handleFormSubmit: SubmitHandler<MedicineFormData> = (formData) => {
        setIsSubmitting(true);
        const url = isEditing ? route('medicines.update', modalState.data!.id) : route('medicines.store');
        const method = isEditing ? 'put' : 'post';

        router[method](url, formData, {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                toast.success(`Medicine ${isEditing ? 'updated' : 'created'} successfully!`);
            },
            onError: (errors) => {
                console.error('Backend validation errors:', errors);
                const errorMessages = Object.values(errors).flat().join(' ');
                toast.error(`Error ${isEditing ? 'updating' : 'creating'} medicine`, {
                    description: errorMessages || 'An unexpected error occurred.',
                });
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    // --- Define Table Columns, modifying the actions cell from table-definition ---
    const columns: ColumnDef<MedicineType>[] = useMemo(() => {
        // Find the actions column definition from the base file
        const actionsColumnDef = baseMedicineColumns.find((col) => col.id === 'actions');
        if (!actionsColumnDef || !actionsColumnDef.cell) {
            console.warn('Actions column definition not found or is invalid in table-definition.tsx');
            return baseMedicineColumns; // Return base columns if actions are missing
        }

        // Create a new actions column definition that calls openModal
        const modifiedActionsColumn: ColumnDef<MedicineType> = {
            ...actionsColumnDef, // Copy other properties like id
            cell: ({ row }) => {
                // Override the cell renderer
                const medicine = row.original;
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
                            <DropdownMenuItem onClick={() => openModal('show', medicine)}>
                                <Eye className="mr-2 h-4 w-4" /> {/* Add margin */}
                                <span>View</span>
                            </DropdownMenuItem>
                            {/* Modified Edit Item */}
                            <DropdownMenuItem onClick={() => openModal('edit', medicine)}>
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
                                            This action cannot be undone. This will permanently delete the medicine "{medicine.name}".
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => {
                                                // Keep the delete logic here
                                                router.delete(route('medicines.destroy', medicine.id), {
                                                    preserveScroll: true,
                                                    onSuccess: () => toast.success('Medicine deleted successfully'),
                                                    onError: (errors) =>
                                                        toast.error('Error deleting medicine', {
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
        return [...baseMedicineColumns.filter((col) => col.id !== 'actions'), modifiedActionsColumn];
    }, [openModal]); // Dependency on openModal

    // --- Modal Title Logic ---
    const getModalTitle = () => {
        switch (modalState.mode) {
            case 'create':
                return 'Add New Medicine';
            case 'edit':
                return `Edit Medicine: ${modalState.data?.name ?? ''}`;
            case 'show':
                return `Medicine Details: ${modalState.data?.name ?? ''}`;
            default:
                return '';
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Medicines', href: '/medicines' }]}>
            <Head title="Medicines" />
            <div className="container mx-auto p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Medicines</h1>
                    <Button onClick={() => openModal('create')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Medicine
                    </Button>
                </div>

                {/* Data Table */}
                <DataTable
                    columns={columns}
                    paginatedData={paginatedMedicines}
                    searchKey="name"
                    searchPlaceholder="Search medicines..."
                    inertiaVisitUrl={route('medicines.index')}
                    inertiaDataPropName="medicines"
                    initialVisibility={medicineColumnVisibility}
                    pageSizeOptions={[10, 20, 50, 100]}
                    exportFileName={`medicines-${new Date().toISOString().split('T')[0]}`}
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
                        schema={medicineSchema}
                        fieldConfig={medicineFieldConfig}
                        initialData={modalState.mode === 'edit' ? modalState.data : null}
                        onSubmit={handleFormSubmit}
                        onCancel={closeModal}
                        isLoading={isSubmitting}
                        submitButtonText={isEditing ? 'Update Medicine' : 'Create Medicine'}
                    />
                )}

                {modalState.mode === 'show' && modalState.data && <MedicineDetails medicine={modalState.data} />}
            </Modal>
        </AppLayout>
    );
}
