// components/forms/EditBatchMetadataForm.tsx
import React from 'react';
import { ResourceForm, FieldConfig } from '@/components/forms/ResourceForm'; // Adjust import path
import { BatchMetadataFormData } from '@/schemas/batch'; // Adjust import path
import { Batch } from '@/types';
import { z } from 'zod';
import type { SubmitHandler } from 'react-hook-form';

interface EditBatchMetadataFormProps {
    schema: z.ZodType<BatchMetadataFormData>;
    fieldConfig: FieldConfig<BatchMetadataFormData>[]; // Config already filtered for metadata
    initialData: Partial<Batch> | null; // Use Batch type, cast inside if needed
    onSubmit: SubmitHandler<BatchMetadataFormData>;
    onCancel?: () => void;
    isLoading?: boolean;
}

export function EditBatchMetadataForm({
    schema,
    fieldConfig,
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
}: EditBatchMetadataFormProps) {

    // Prepare initial data compatible with BatchMetadataFormData schema
    const preparedInitialData = initialData
        ? {
            supplier_id: String(initialData.supplier_id ?? ''),
            batch_number: initialData.batch_number ?? '',
            manufacture_date:
                initialData.manufacture_date
                    ? new Date(initialData.manufacture_date)
                    : null,
            expiry_date:
                initialData.expiry_date
                    ? new Date(initialData.expiry_date)
                    : null,
        }
        : undefined;


    return (
        <ResourceForm
            schema={schema}
            fieldConfig={fieldConfig}
            initialData={preparedInitialData}
            onSubmit={onSubmit}
            onCancel={onCancel}
            isLoading={isLoading}
            submitButtonText="Update Metadata"
            layout='grid'
            gridColumns={1}
        />
    );
}