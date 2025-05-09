import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/number-input';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { Medicine, Supplier, Batch, StockTransactionTypeEnumMap } from '@/types';
import { transactionFieldConfigs } from '@/definitions/form-definitions';
import { StockTransactionFormData, stockTransactionSchema } from '@/schemas/batchTransaction';
import axios from 'axios';
import { ResponsiveModalFooter } from '@/components/ui/responsive-modal';

function toYMD(date: Date | string | null | undefined) {
    if (!date) return '';
    if (typeof date === 'string') return date;
    return date.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

interface StockTransactionFormProps {
    isOpen: boolean;
    initialTransactionType?: string | null;
    initialMedicine?: Medicine | null;
    initialBatch?: Batch | null;
    medicines: Medicine[];
    suppliers: Supplier[];
    transactionTypes: StockTransactionTypeEnumMap;
    onSubmit: SubmitHandler<StockTransactionFormData>; // Use the specific FormData type
    onCancel: () => void;
    isLoading: boolean;
    backendErrors?: Record<string, string | string[]>; // Use this to display backend errors
}

export function StockTransactionForm({
    isOpen,
    initialTransactionType,
    initialMedicine,
    initialBatch,
    medicines,
    suppliers,
    transactionTypes,
    onSubmit,
    onCancel,
    isLoading,
    backendErrors = {}
}: StockTransactionFormProps) {

    const [selectedTransactionType, setSelectedTransactionType] = useState<string | undefined>(initialTransactionType || undefined);
    const [selectedMedicineId, setSelectedMedicineId] = useState<string | undefined>(initialMedicine ? String(initialMedicine.id) : undefined);
    const [availableBatches, setAvailableBatches] = useState<Batch[]>(initialBatch ? [initialBatch] : []); // Pre-fill if initial batch provided
    const [selectedBatchId, setSelectedBatchId] = useState<string | undefined>(initialBatch ? String(initialBatch.id) : undefined);
    const [isFetchingBatches, setIsFetchingBatches] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null); // For batch fetch errors

    // --- Dynamic Schema ---
    const currentSchema = useMemo(() => {
        // If no transaction type is selected, use base schema
        if (!selectedTransactionType) return stockTransactionSchema;

        // Define specific validation rules based on transaction type
        switch (selectedTransactionType) {
            case 'IN_NEW_BATCH':
                return stockTransactionSchema
                    .refine(
                        (data) => data.batch_number && data.supplier_id && data.expiry_date,
                        { message: "Batch details are required for new stock" }
                    );

            case 'OUT_DISPENSE':
            case 'ADJUST_SUB':
            case 'DISPOSAL_EXPIRED':
            case 'DISPOSAL_DAMAGED':
            case 'RETURN_SUPPLIER':
                return stockTransactionSchema
                    .refine(
                        (data) => data.batch_id && data.quantity_change_input > 0,
                        { message: "Batch and quantity are required" }
                    );

            case 'INITIAL_STOCK':
                return stockTransactionSchema
                    .refine(
                        (data) => {
                            if (data.create_new_batch_for_initial_stock) {
                                return data.batch_number && data.supplier_id && data.expiry_date;
                            }
                            return true;
                        },
                        { message: "Complete batch details required for new batch" }
                    );

            default:
                return stockTransactionSchema;
        }
    }, [selectedTransactionType]);


    const { control, handleSubmit, watch, reset, formState: { errors }, setValue, trigger, setError } = useForm<StockTransactionFormData>({
        resolver: zodResolver(currentSchema),
        defaultValues: {
            transaction_type: initialTransactionType || '',
            medicine_id: initialMedicine ? String(initialMedicine.id) : '',
            batch_id: initialBatch ? String(initialBatch.id) : '',
            quantity_change_input: 0,
            notes: '',
            create_new_batch_for_initial_stock: false,
            // Initialize other fields based on transaction type if needed
        },
    });

    // Watch relevant fields
    const watchedTransactionType = watch('transaction_type');
    const watchedMedicineId = watch('medicine_id');
    const watchedBatchId = watch('batch_id');

    // --- Effects ---
    // Reset form when modal opens/closes or initial props change
    useEffect(() => {
        reset({
            transaction_type: initialTransactionType || '',
            medicine_id: initialMedicine ? String(initialMedicine.id) : '',
            batch_id: initialBatch ? String(initialBatch.id) : '',
            quantity_change_input: 0,
            notes: '',
            create_new_batch_for_initial_stock: false,
            // Reset others
        });
        setSelectedTransactionType(initialTransactionType || undefined);
        setSelectedMedicineId(initialMedicine ? String(initialMedicine.id) : undefined);
        setSelectedBatchId(initialBatch ? String(initialBatch.id) : undefined);
        setAvailableBatches(initialBatch ? [initialBatch] : []);
        setApiError(null);
    }, [isOpen, initialTransactionType, initialMedicine, initialBatch, reset]);

    // Update internal state when transaction type changes via form
    useEffect(() => {
        if (watchedTransactionType !== selectedTransactionType) {
            setSelectedTransactionType(watchedTransactionType);
            // Reset dependent fields
            setValue('medicine_id', '');
            setValue('batch_id', '');
            setValue('quantity_change_input', 0);
            setAvailableBatches([]);
            setSelectedMedicineId(undefined);
            // Trigger re-validation maybe needed if schema changes drastically
            // trigger();
        }
    }, [watchedTransactionType, selectedTransactionType, setValue, trigger]);

    // Fetch batches when medicine changes (and transaction type requires batches)
    useEffect(() => {
        if (watchedMedicineId !== selectedMedicineId) {
            setSelectedMedicineId(watchedMedicineId);
            const typeRequiresBatch = selectedTransactionType && !['IN_NEW_BATCH', 'INITIAL_STOCK_NO_BATCH_YET'].includes(selectedTransactionType); // Refine condition
            if (watchedMedicineId && typeRequiresBatch && watchedMedicineId !== selectedMedicineId) {
                setSelectedMedicineId(watchedMedicineId);
                setValue('batch_id', ''); // Reset batch
                setAvailableBatches([]);
                setSelectedBatchId(undefined);
                setIsFetchingBatches(true);
                setApiError(null);

                axios.get(`/medicines/${watchedMedicineId}/batches`) // ** IMPORTANT: Create this API endpoint **
                    .then(response => {
                        setAvailableBatches(response.data.data || []); // Adjust based on your API response structure
                        if (initialBatch && String(initialBatch.medicine_id) === watchedMedicineId) {
                            // If initial batch matches new medicine, pre-select it
                            setValue('batch_id', String(initialBatch.id));
                        }
                    })
                    .catch(err => {
                        console.error("Failed to fetch batches:", err);
                        setApiError("Could not load batches for the selected medicine.");
                    })
                    .finally(() => setIsFetchingBatches(false));
            } else if (!watchedMedicineId && selectedMedicineId) {
                // Clear batches if medicine is deselected
                setSelectedMedicineId(undefined);
                setAvailableBatches([]);
                setValue('batch_id', '');
            }
        }
    }, [watchedMedicineId, selectedMedicineId, selectedTransactionType, setValue, initialBatch]);


    // Set backend errors on the form
    useEffect(() => {
        if (backendErrors && Object.keys(backendErrors).length > 0) {
            Object.entries(backendErrors).forEach(([fieldName, errorMessages]) => {
                const message = Array.isArray(errorMessages) ? errorMessages.join(', ') : errorMessages;
                setError(fieldName as keyof StockTransactionFormData, { type: 'server', message });
            });
        }
    }, [backendErrors, setError]);

    // --- Form Submit ---
    const onFormSubmit = (data: StockTransactionFormData) => {
        // You can do final data transformations here if necessary
        const finalData = { ...data };
        finalData.manufacture_date = toYMD(finalData.manufacture_date);
        finalData.expiry_date = toYMD(finalData.expiry_date);
        // Ensure quantity is number
        if (finalData.quantity_change_input && typeof finalData.quantity_change_input !== 'number') {
            finalData.quantity_change_input = parseInt(String(finalData.quantity_change_input), 10) || 0;
        }
        // Ensure IDs are numbers if backend expects numbers
        // if (finalData.medicine_id) finalData.medicine_id = Number(finalData.medicine_id);
        // if (finalData.batch_id) finalData.batch_id = Number(finalData.batch_id);
        // if (finalData.supplier_id) finalData.supplier_id = Number(finalData.supplier_id);

        console.log("Submitting Transaction Data:", finalData);
        onSubmit(finalData);
    };

    // --- Helper to get specific field configs ---
    // This avoids repeating config definitions inside the render logic
    const getFieldConfig = (name: keyof typeof transactionFieldConfigs, dynamicProps?: any) => {
        const func = transactionFieldConfigs[name];
        if (typeof func === 'function') {
            // Pass dependencies like medicines, suppliers etc. if the config function needs them
            if (name === 'medicine_id') return func(medicines);
            if (name === 'supplier_id') return func(suppliers);
            if (name === 'batch_id') return func(availableBatches);
            if (name === 'transaction_type') return func(transactionTypes);
            // Handle dynamic labels for quantity etc.
            if (name === 'quantity_change_input' && dynamicProps?.label) return func(dynamicProps.label);
            return func(); // Call without args if none needed
        }
        return func; // Should not happen based on current definitions
    };

    // --- Render Logic ---
    const renderField = (fieldConf: FieldConfig<StockTransactionFormData> | undefined) => {
        if (!fieldConf) return null;
        const error = errors[fieldConf.name]?.message as string | undefined
            || (backendErrors?.[fieldConf.name] ? (Array.isArray(backendErrors[fieldConf.name]) ? (backendErrors[fieldConf.name] as string[]).join(', ') : String(backendErrors[fieldConf.name])) : undefined);

        // Basic render logic (can be enhanced)
        return (
            <div key={fieldConf.name} className="mb-4">
                <Label htmlFor={fieldConf.name} className={cn(error ? 'text-red-600' : '')}>
                    {fieldConf.label}{fieldConf.required ? ' *' : ''}
                </Label>
                <Controller
                    name={fieldConf.name}
                    control={control}
                    render={({ field }) => {
                        const commonProps = { ...field, id: fieldConf.name, className: 'w-full mt-1 p-2 border rounded', disabled: isLoading };
                        if (fieldConf.type === 'select') {
                            return (
                                <Select
                                    onValueChange={field.onChange}
                                    value={String(field.value ?? '')}
                                    disabled={commonProps.disabled}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={fieldConf.placeholder} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {fieldConf.options?.map(opt => (
                                            <SelectItem
                                                key={opt.value}
                                                value={String(opt.value)}
                                                disabled={opt.disabled}
                                            >
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            );
                        }
                        if (fieldConf.type === 'textarea') {
                            return <Textarea {...commonProps} rows={fieldConf.rows || 3} value={field.value ?? ''} />;
                        }
                        if (fieldConf.type === 'number') {
                            return <NumberInput {...commonProps} value={Number(field.value ?? 0)} min={fieldConf.min ?? 0} />;
                        }
                        if (fieldConf.type === 'date') {
                            return <DateTimePicker
                                {...commonProps}
                                value={field.value}
                                onChange={field.onChange}
                                granularity='day'
                            />;
                        }
                        if (fieldConf.type === 'checkbox') {
                            return (
                                <div className="flex items-center space-x-2 mt-1">
                                    <Checkbox id={commonProps.id} checked={!!field.value} onCheckedChange={field.onChange} disabled={commonProps.disabled} />
                                    <Label htmlFor={commonProps.id} className="cursor-pointer">Related to Initial Stock?</Label> {/* Custom label */}
                                </div>
                            );
                        }
                        // Default to text input
                        return <Input {...commonProps} type={fieldConf.type} placeholder={fieldConf.placeholder} value={field.value ?? ''} />;
                    }}
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                {apiError && fieldConf.name === 'batch_id' && <p className="text-red-500 text-sm mt-1">{apiError}</p>}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 p-4">
            {renderField(getFieldConfig('transaction_type'))}

            {/* Conditional Fields */}
            {selectedTransactionType && ( // Only proceed if a transaction type is selected
                <>
                    {/* --- Medicine Selection --- */}
                    {/* Show medicine selection for most types, including IN_NEW_BATCH and INITIAL_STOCK */}
                    {['IN_NEW_BATCH', 'OUT_DISPENSE', 'ADJUST_ADD', 'ADJUST_SUB', 'DISPOSAL_EXPIRED', 'DISPOSAL_DAMAGED', 'RETURN_SUPPLIER', 'INITIAL_STOCK'].includes(selectedTransactionType) &&
                        renderField(getFieldConfig('medicine_id'))
                    }

                    {/* --- Fields specific to IN_NEW_BATCH --- */}
                    {selectedTransactionType === 'IN_NEW_BATCH' && selectedMedicineId && ( // Wait for medicine selection for IN_NEW_BATCH fields
                        <>
                            {renderField(getFieldConfig('supplier_id'))}
                            {renderField(getFieldConfig('batch_number'))}
                            {renderField(getFieldConfig('quantity_change_input', { label: 'Quantity Received' }))}
                            {renderField(getFieldConfig('manufacture_date'))}
                            {renderField(getFieldConfig('expiry_date'))}
                        </>
                    )}

                    {/* --- Batch Selection (for types that operate on existing batches) --- */}
                    {isFetchingBatches && <p className="text-muted-foreground">Loading batches...</p>}
                    {!isFetchingBatches && apiError && <p className="text-destructive">{apiError}</p>}
                    {!isFetchingBatches && !apiError && selectedMedicineId &&
                        ['OUT_DISPENSE', 'ADJUST_ADD', 'ADJUST_SUB', 'DISPOSAL_EXPIRED', 'DISPOSAL_DAMAGED', 'RETURN_SUPPLIER', 'INITIAL_STOCK'].includes(selectedTransactionType) &&
                        !watch('create_new_batch_for_initial_stock') && // Don't show if INITIAL_STOCK is creating a new batch
                        (
                            renderField(getFieldConfig('batch_id'))
                        )
                    }
                    {!isFetchingBatches && !apiError && selectedMedicineId && availableBatches.length === 0 &&
                        ['OUT_DISPENSE', 'ADJUST_ADD', 'ADJUST_SUB', 'DISPOSAL_EXPIRED', 'DISPOSAL_DAMAGED', 'RETURN_SUPPLIER'].includes(selectedTransactionType) &&
                        (
                            <p className="text-orange-500 text-sm px-1">No available batches for the selected medicine.</p>
                        )
                    }


                    {/* --- Quantity Input (for transactions on selected batches or INITIAL_STOCK) --- */}
                    {/* For transactions on an existing selected batch */}
                    {selectedMedicineId && watchedBatchId && // Use watchedBatchId from RHF
                        ['OUT_DISPENSE', 'ADJUST_ADD', 'ADJUST_SUB', 'DISPOSAL_EXPIRED', 'DISPOSAL_DAMAGED', 'RETURN_SUPPLIER'].includes(selectedTransactionType) &&
                        (
                            renderField(getFieldConfig('quantity_change_input'))
                        )
                    }
                    {/* For INITIAL_STOCK quantity (can be without a pre-selected batch) */}
                    {selectedTransactionType === 'INITIAL_STOCK' && selectedMedicineId &&
                        (
                            renderField(getFieldConfig('quantity_change_input', { label: 'Initial Quantity' }))
                        )
                    }

                    {/* --- Fields specific to INITIAL_STOCK when creating a new batch --- */}
                    {selectedTransactionType === 'INITIAL_STOCK' && watch('create_new_batch_for_initial_stock') && selectedMedicineId && (
                        <>
                            {/* medicine_id already selected for INITIAL_STOCK */}
                            {/* batch_id (optional existing) already handled */}
                            {/* quantity_change_input already handled */}
                            {renderField(getFieldConfig('supplier_id'))}
                            {renderField(getFieldConfig('batch_number'))}
                            {renderField(getFieldConfig('expiry_date'))}
                            {renderField(getFieldConfig('manufacture_date'))}
                        </>
                    )}
                    {/* Checkbox for INITIAL_STOCK - create new batch flag (Only show if medicine selected) */}
                    {selectedTransactionType === 'INITIAL_STOCK' && selectedMedicineId &&
                        renderField(getFieldConfig('create_new_batch_for_initial_stock'))
                    }


                    {/* --- Notes field (common to most, show if a transaction type is selected) --- */}
                    {selectedTransactionType && renderField(getFieldConfig('notes'))}
                </>
            )}


            <ResponsiveModalFooter>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !selectedTransactionType}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isLoading ? 'Processing...' : 'Submit Transaction'}
                </Button>
            </ResponsiveModalFooter>
        </form>
    );
}