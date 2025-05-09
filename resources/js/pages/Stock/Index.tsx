import { DataTable } from '@/components/data-table';
import { BatchDetails } from '@/components/details/BatchDetails';
import { EditBatchMetadataForm } from '@/components/forms/EditBatchMetadataForm';
import { StockTransactionForm } from '@/components/forms/StockTransactionForm';

import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    ResponsiveModal, ResponsiveModalClose, ResponsiveModalContent, ResponsiveModalDescription,
    ResponsiveModalFooter, ResponsiveModalHeader, ResponsiveModalTitle
} from '@/components/ui/responsive-modal';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import {
    Batch as BatchType, Medicine, PageProps, PaginatedResponse, Supplier, StockTransactionTypeEnumMap
} from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal, Pencil, PlusCircle, Trash, Shuffle, MinusCircle, CircleArrowOutUpRight, Undo2, ArchiveX } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
// Assuming base columns are defined elsewhere correctly
import { batchColumns as baseBatchColumns, batchColumnVisibility } from './table-definition';
// Import the specific form definitions we need
import { resourceFormDefinitions } from '@/definitions/form-definitions';


// Props Interface remains the same
interface BatchesIndexProps extends PageProps {
    batches: PaginatedResponse<BatchType>;
    medicines: Medicine[];
    suppliers: Supplier[];
    transactionTypes: StockTransactionTypeEnumMap;
}

// State Interfaces remain the same
interface TransactionModalState {
    isOpen: boolean;
    transactionType?: string | null;
    selectedMedicine?: Medicine | null;
    selectedBatch?: BatchType | null;
}
interface BatchInfoModalState {
    mode: 'edit_metadata' | 'show_details' | null;
    data: BatchType | null;
}

export default function Index({ auth }: PageProps) { // Get auth if needed
    const {
        batches: paginatedBatches,
        medicines,
        suppliers,
        transactionTypes,
        errors: pageErrors,
        filters: currentFilters // Capture filters passed from controller
    } = usePage<BatchesIndexProps>().props;

    const [batchInfoModal, setBatchInfoModal] = useState<BatchInfoModalState>({ mode: null, data: null });
    const [transactionModal, setTransactionModal] = useState<TransactionModalState>({ isOpen: false });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isBatchInfoModalOpen = batchInfoModal.mode !== null;

    // --- Modal Control Functions (remain the same) ---
    const openBatchInfoModal = useCallback((mode: 'edit_metadata' | 'show_details', data: BatchType) => {
        setBatchInfoModal({ mode, data });
    }, []);
    const closeBatchInfoModal = useCallback(() => { // useCallback for stability
        setBatchInfoModal({ mode: null, data: null });
        setIsSubmitting(false);
    }, []);
    const openTransactionModal = useCallback((
        initialTransactionType: string | null = null,
        initialMedicine: Medicine | null = null,
        initialBatch: BatchType | null = null
    ) => {
        setTransactionModal({
            isOpen: true,
            transactionType: initialTransactionType,
            selectedMedicine: initialMedicine,
            selectedBatch: initialBatch,
        });
    }, []);
    const closeTransactionModal = useCallback(() => { // useCallback
        setTransactionModal({ isOpen: false });
        setIsSubmitting(false);
    }, []);

    // --- Form Submission Handlers (remain the same concept) ---
    const handleEditBatchMetadataSubmit: SubmitHandler<any> = (formData) => {
        if (!batchInfoModal.data) return;

        setIsSubmitting(true);
        router.put(route('stock.update', batchInfoModal.data.id), formData, {
            preserveScroll: true,
            onSuccess: () => { closeBatchInfoModal(); toast.success(`Batch metadata updated successfully!`); },
            onError: (errors) => { /* ... */ toast.error('Error updating batch metadata' + Object.values(errors).flat().join(' ')); },
            onFinish: () => setIsSubmitting(false),
        });
    };
    const handleStockTransactionSubmit: SubmitHandler<any> = (formData) => {
        setIsSubmitting(true);
        router.post(route('stock.transaction'), formData, {
            preserveScroll: true,
            onSuccess: () => { closeTransactionModal(); toast.success(`Stock transaction processed successfully!`); },
            onError: (errors) => { /* ... */ toast.error('Error processing transaction' + Object.values(errors).flat().join(' ')); },
            onFinish: () => setIsSubmitting(false),
        });
    };

    // --- Define Table Columns (useMemo remains the same) ---
    const columns: ColumnDef<BatchType>[] = useMemo(() => {
        return [
            ...baseBatchColumns.filter((col) => col.id !== 'actions'),
            {
                id: 'actions',
                cell: ({ row }) => {
                    const batch = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Batch Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => openBatchInfoModal('show_details', batch)}><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openBatchInfoModal('edit_metadata', batch)}><Pencil className="mr-2 h-4 w-4" /> Edit Metadata</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Stock Transactions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => openTransactionModal(StockTransactionType.OUT_DISPENSE.valueOf(), batch.medicine, batch)}><CircleArrowOutUpRight className="mr-2 h-4 w-4" /> Dispense</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openTransactionModal(StockTransactionType.ADJUST_ADD.valueOf(), batch.medicine, batch)}><PlusCircle className="mr-2 h-4 w-4" /> Adjust (Add)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openTransactionModal(StockTransactionType.ADJUST_SUB.valueOf(), batch.medicine, batch)}><MinusCircle className="mr-2 h-4 w-4" /> Adjust (Subtract)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openTransactionModal(StockTransactionType.DISPOSAL_DAMAGED.valueOf(), batch.medicine, batch)}><ArchiveX className="mr-2 h-4 w-4" /> Dispose (Damaged)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openTransactionModal(StockTransactionType.DISPOSAL_EXPIRED.valueOf(), batch.medicine, batch)}><ArchiveX className="mr-2 h-4 w-4" /> Dispose (Expired)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openTransactionModal(StockTransactionType.RETURN_SUPPLIER.valueOf(), batch.medicine, batch)}><Undo2 className="mr-2 h-4 w-4" /> Return to Supplier</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild><DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}><Trash className="mr-2 h-4 w-4" /> Delete Batch</DropdownMenuItem></AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action will attempt to dispose of remaining stock and delete the batch record for "{batch.batch_number}". Cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => { router.delete(route('stock.destroy', batch.id), { preserveScroll: true, onSuccess: () => toast.success('Batch deleted.'), onError: (e) => toast.error('Delete failed.', { description: Object.values(e).flat().join(' ') }) }); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Confirm Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ];
    }, [openBatchInfoModal, openTransactionModal]); // Include dependencies

    // --- Modal Title/Description Logic (remain the same) ---
    const getBatchInfoModalTitle = () => { /* ... */ return batchInfoModal.mode === 'edit_metadata' ? `Edit Metadata` : 'Batch Details'; };
    const getBatchInfoModalDescription = () => { /* ... */ return 'View or edit batch metadata.'; };

    // --- Prepare Batch Metadata Form Config ---
    // Use useMemo to avoid recomputing on every render
    const batchMetadataFieldConfig = useMemo(() => {
        return resourceFormDefinitions.batchMetadata.getFieldsWithOptions({ suppliers });
    }, [suppliers]);


    return (
        <AppLayout breadcrumbs={[{ title: 'Stock', href: route('stock.index') }]}>
            <Head title="Stock Batches" />
            <div className="container mx-auto p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Stock</h1>
                    <Button onClick={() => openTransactionModal()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Stock Transaction
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    paginatedData={paginatedBatches}
                    searchKey='batch_number'
                    searchPlaceholder='Search by Batch Number...'
                    filterConfig={{
                        filter: currentFilters?.filter || '',
                        filterBy: currentFilters?.filterBy || 'medicine_name',
                        filterByOptions: [
                            { value: 'medicine_name', label: 'Medicine Name' },
                            { value: 'batch_number', label: 'Batch No.' },
                            { value: 'supplier_name', label: 'Supplier Name' },
                        ],
                        dateFilters: [
                            { key: 'expiry_from', label: 'Expiry From', value: currentFilters?.expiry_from },
                            { key: 'expiry_to', label: 'Expiry To', value: currentFilters?.expiry_to },
                        ]
                    }}
                    sortConfig={{ // Pass current sort state
                        sort: currentFilters?.sort || 'expiry_date',
                        direction: currentFilters?.direction || 'asc',
                    }}

                    inertiaVisitUrl={route('stock.index')}
                    inertiaDataPropName="batches" // Default, often not needed
                    initialVisibility={batchColumnVisibility}
                    pageSizeOptions={[10, 15, 20, 50, 100]}
                    exportFileName={`stock-batches-${new Date().toISOString().split('T')[0]}`}
                />
            </div>

            {/* Modal for Viewing Batch Details or Editing Batch METADATA */}
            <ResponsiveModal
                open={isBatchInfoModalOpen}
                onOpenChange={(isOpen) => !isOpen && closeBatchInfoModal()}
            >
                <ResponsiveModalContent>
                    <ResponsiveModalHeader>
                        <ResponsiveModalTitle>{getBatchInfoModalTitle()} {batchInfoModal.data?.batch_number}</ResponsiveModalTitle>
                        <ResponsiveModalDescription>{getBatchInfoModalDescription()}</ResponsiveModalDescription>
                    </ResponsiveModalHeader>

                    {batchInfoModal.mode === 'edit_metadata' && batchInfoModal.data && (
                        <EditBatchMetadataForm // Use the NEW dedicated component
                            // Pass necessary props
                            schema={resourceFormDefinitions.batchMetadata.schema}
                            fieldConfig={batchMetadataFieldConfig} // Use the prepared config
                            initialData={batchInfoModal.data} // Pass existing data
                            onSubmit={handleEditBatchMetadataSubmit}
                            onCancel={closeBatchInfoModal}
                            isLoading={isSubmitting}
                        />
                    )}
                    {batchInfoModal.mode === 'show_details' && batchInfoModal.data && (
                        <>
                            <div className="p-4 border-t"> {/* Add padding and separator */}
                                <BatchDetails batch={batchInfoModal.data} />
                            </div>
                            <ResponsiveModalFooter>
                                <ResponsiveModalClose asChild>
                                    <Button type="button" variant="outline" onClick={closeBatchInfoModal}>Close</Button>
                                </ResponsiveModalClose>
                            </ResponsiveModalFooter>
                        </>
                    )}
                </ResponsiveModalContent>
            </ResponsiveModal>

            {/* UNIFIED STOCK TRANSACTION MODAL */}
            <ResponsiveModal
                open={transactionModal.isOpen}
                onOpenChange={(isOpen) => !isOpen && closeTransactionModal()}
            >
                <ResponsiveModalContent className="max-w-2xl"> {/* Example size adjustment */}
                    <ResponsiveModalHeader>
                        <ResponsiveModalTitle>
                            Process Stock Transaction
                            {transactionModal.transactionType && `: ${transactionTypes[transactionModal.transactionType] || transactionModal.transactionType}`}
                        </ResponsiveModalTitle>
                        <ResponsiveModalDescription>
                            Select transaction type and fill in the details below.
                        </ResponsiveModalDescription>
                    </ResponsiveModalHeader>

                    {/* Ensure the key changes when the modal re-opens with different initial state */}
                    {/* This helps react-hook-form reset correctly */}
                    <StockTransactionForm // Use the NEW dedicated component
                        key={transactionModal.isOpen ? `open-${transactionModal.selectedBatch?.id ?? 'new'}-${transactionModal.transactionType}` : 'closed'}
                        // Pass necessary props
                        isOpen={transactionModal.isOpen}
                        initialTransactionType={transactionModal.transactionType}
                        initialMedicine={transactionModal.selectedMedicine}
                        initialBatch={transactionModal.selectedBatch}
                        medicines={medicines}
                        suppliers={suppliers}
                        transactionTypes={transactionTypes} // Pass the enum map
                        onSubmit={handleStockTransactionSubmit}
                        onCancel={closeTransactionModal}
                        isLoading={isSubmitting}
                        backendErrors={pageErrors}
                    />
                </ResponsiveModalContent>
            </ResponsiveModal>
        </AppLayout>
    );
}

// Dummy StockTransactionType enum values for frontend actions (replace with actual enum values if possible)
// This is better defined in your types/index.d.ts based on StockTransactionTypeEnumMap
const StockTransactionType = {
    IN_NEW_BATCH: 'IN_NEW_BATCH',
    OUT_DISPENSE: 'OUT_DISPENSE',
    ADJUST_ADD: 'ADJUST_ADD',
    ADJUST_SUB: 'ADJUST_SUB',
    DISPOSAL_EXPIRED: 'DISPOSAL_EXPIRED',
    DISPOSAL_DAMAGED: 'DISPOSAL_DAMAGED',
    RETURN_SUPPLIER: 'RETURN_SUPPLIER',
    INITIAL_STOCK: 'INITIAL_STOCK',
} as const; // Use 'as const' for better type inference