import { FieldConfig, SelectOption } from '@/components/forms/ResourceForm'; // Assuming types are exported from ResourceForm
import { Medicine, Role, Supplier, StockTransactionTypeEnumMap, Batch } from '@/types'; // Added Batch and StockTransactionTypeEnumMap

// --- Import Schemas ---
// Keep your existing schemas, but we might need new ones below
import { BatchFormData, batchSchema, batchMetadataSchema, BatchMetadataFormData } from '@/schemas/batch';
import { MedicineFormData, medicineSchema } from '@/schemas/medicine';
import { SupplierFormData, supplierSchema } from '@/schemas/supplier';
import { UserFormData, userSchema } from '@/schemas/user';
import { StockTransactionFormData } from '@/schemas/batchTransaction';

// --- Helper for Select Options ---
// Convert enum map or array to SelectOption[] format
const getTransactionTypeOptions = (types: StockTransactionTypeEnumMap): SelectOption[] => {
    return Object.entries(types).map(([value, label]) => ({ value, label }));
};
const getSupplierOptions = (suppliers: Supplier[]): SelectOption[] => suppliers.map((sup) => ({ value: String(sup.id), label: sup.name }));
const getMedicineOptions = (medicines: Medicine[]): SelectOption[] => medicines.map((med) => ({ value: String(med.id), label: `${med.name} (${med.dosage})` }));
const getBatchOptions = (batches: Batch[]): SelectOption[] => batches.map((b) => ({
    value: String(b.id),
    label: `${b.batch_number} (Exp: ${new Date(b.expiry_date).toLocaleDateString()}, Avail: ${b.current_quantity})`
}));
const getRoleOptions = (roles: Role[]): SelectOption[] => roles.map((role) => ({ value: String(role.id), label: role.name }));


// --- Form Field Definitions ---

// Keep existing medicine, supplier, user fields as they are...
const medicineFormFields: FieldConfig<MedicineFormData>[] = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'manufacturer_distributor', label: 'Manufacturer/Distributor', type: 'text' },
    { name: 'dosage', label: 'Dosage', type: 'text' },
    { name: 'form', label: 'Form', type: 'text' },
    { name: 'unit_of_measure', label: 'Unit of Measure', type: 'text' },
    { name: 'reorder_level', label: 'Reorder Level', type: 'number' },
    { name: 'description', label: 'Description', type: 'textarea' },
];

const supplierFormFields: FieldConfig<SupplierFormData>[] = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'address', label: 'Address', type: 'text' },
    { name: 'contact_person', label: 'Contact Person', type: 'text' },
];

const userFormFields: FieldConfig<UserFormData>[] = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true }, // Note: Handle password confirmation separately if needed
    { name: 'role_id', label: 'Role', type: 'select', required: true, options: [], placeholder: 'Select role' },
];

// --- NEW: Batch METADATA Edit Definition ---
// Define fields allowed for editing existing batch metadata
const batchMetadataEditFields: FieldConfig<BatchMetadataFormData>[] = [
    // { name: 'medicine_id', label: 'Medicine', type: 'select', required: true, options: [], placeholder: 'Select medicine', disabled: true }, // Usually disabled
    { name: 'supplier_id', label: 'Supplier', type: 'select', required: true, options: [], placeholder: 'Select supplier' }, // Assuming supplier can be changed
    { name: 'batch_number', label: 'Batch Number', type: 'text', required: true },
    { name: 'manufacture_date', label: 'Manufacture Date', type: 'date' },
    { name: 'expiry_date', label: 'Expiry Date', type: 'date', required: true },
    // ** Exclude quantity_received and current_quantity **
];

// --- NEW: Definitions for fields used within StockTransactionForm ---
// Define individual field configs that StockTransactionForm can import and use conditionally.
// This promotes reuse and consistency.

export const transactionFieldConfigs = {
    transaction_type: (types: StockTransactionTypeEnumMap): FieldConfig<StockTransactionFormData> => ({
        name: 'transaction_type', label: 'Transaction Type', type: 'select', required: true,
        options: getTransactionTypeOptions(types), placeholder: 'Select type...'
    }),
    medicine_id: (medicines: Medicine[]): FieldConfig<StockTransactionFormData> => ({
        name: 'medicine_id', label: 'Medicine', type: 'select', required: true, // Required conditionally in schema
        options: getMedicineOptions(medicines), placeholder: 'Select medicine...'
        // Consider using a searchable/async select component here if medicines list is large
    }),
    batch_id: (batches: Batch[]): FieldConfig<StockTransactionFormData> => ({
        name: 'batch_id', label: 'Batch', type: 'select', required: true, // Required conditionally in schema
        options: getBatchOptions(batches), placeholder: 'Select batch...'
    }),
    supplier_id: (suppliers: Supplier[]): FieldConfig<StockTransactionFormData> => ({
        name: 'supplier_id', label: 'Supplier', type: 'select', required: true, // Required conditionally in schema
        options: getSupplierOptions(suppliers), placeholder: 'Select supplier...'
    }),
    batch_number: (): FieldConfig<StockTransactionFormData> => ({
        name: 'batch_number', label: 'Batch Number', type: 'text', required: true // Required conditionally in schema
    }),
    manufacture_date: (): FieldConfig<StockTransactionFormData> => ({
        name: 'manufacture_date', label: 'Manufacture Date', type: 'date'
    }),
    expiry_date: (): FieldConfig<StockTransactionFormData> => ({
        name: 'expiry_date', label: 'Expiry Date', type: 'date', required: true // Required conditionally in schema
    }),
    quantity_change_input: (label: string = 'Quantity'): FieldConfig<StockTransactionFormData> => ({
        name: 'quantity_change_input', label: label, type: 'number', required: true, // Required conditionally in schema
        min: 0 // User inputs positive magnitude
    }),
    notes: (): FieldConfig<StockTransactionFormData> => ({
        name: 'notes', label: 'Notes / Reason', type: 'textarea', rows: 3
    }),
    // Add other fields like transaction_date, related_transaction_id if needed
    create_new_batch_for_initial_stock: (): FieldConfig<StockTransactionFormData> => ({
        name: 'create_new_batch_for_initial_stock', label: 'Create New Batch for this Initial Stock?', type: 'checkbox'
    }),
};


// --- Export Combined Definitions ---
// Keep existing definitions, add new ones
export const resourceFormDefinitions = {
    medicines: {
        schema: medicineSchema,
        fields: medicineFormFields,
        getFieldsWithOptions: () => medicineFormFields, // Assuming no dynamic options needed here
    },
    suppliers: {
        schema: supplierSchema,
        fields: supplierFormFields,
        getFieldsWithOptions: () => supplierFormFields,
    },
    // OLD Batch definition - Keep if needed elsewhere, but less useful now for create/edit
    batches_LEGACY: { // Renamed to avoid conflict if ResourceForm is still used directly somewhere
        schema: batchSchema, // This schema includes quantity fields
        fields: [ // Original batch fields including quantity
            { name: 'medicine_id', label: 'Medicine', type: 'select', required: true, options: [], placeholder: 'Select medicine' },
            { name: 'supplier_id', label: 'Supplier', type: 'select', required: true, options: [], placeholder: 'Select supplier' },
            { name: 'batch_number', label: 'Batch Number', type: 'text', required: true },
            { name: 'manufacture_date', label: 'Manufacture Date', type: 'date' },
            { name: 'expiry_date', label: 'Expiry Date', type: 'date', required: true },
            { name: 'quantity_received', label: 'Quantity Received', type: 'number', required: true },
            { name: 'current_quantity', label: 'Current Quantity', type: 'number', required: true },
        ] as FieldConfig<BatchFormData>[], // Assert type here if needed
        getFieldsWithOptions: (dependencies: { medicines: Medicine[]; suppliers: Supplier[] }) => {
             // Existing logic to populate options...
             const fields = resourceFormDefinitions.batches_LEGACY.fields; // Use the fields defined above
            return fields.map((field) => {
                if (field.name === 'medicine_id' && dependencies.medicines) {
                    return { ...field, options: getMedicineOptions(dependencies.medicines) };
                }
                if (field.name === 'supplier_id' && dependencies.suppliers) {
                    return { ...field, options: getSupplierOptions(dependencies.suppliers) };
                }
                return field;
            });
        },
    },
    // NEW Batch METADATA Edit definition
    batchMetadata: {
        schema: batchMetadataSchema,
        fields: batchMetadataEditFields,
        getFieldsWithOptions: (dependencies: { suppliers: Supplier[] }) => {
             // Inject only supplier options needed for metadata edit
            return batchMetadataEditFields.map((field) => {
                 if (field.name === 'supplier_id' && dependencies.suppliers) {
                    return { ...field, options: getSupplierOptions(dependencies.suppliers) };
                }
                return field;
            });
        },
    },
    users: {
        schema: userSchema,
        fields: userFormFields,
        getFieldsWithOptions: (dependencies: { roles: Role[] }) => {
            return userFormFields.map((field) => {
                if (field.name === 'role_id' && dependencies.roles) {
                    return { ...field, options: getRoleOptions(dependencies.roles) };
                }
                return field;
            });
        },
    },
    // Add a placeholder for stock transactions if ResourceForm were to be used (unlikely for the whole thing)
    // stockTransactions: {
    //  schema: stockTransactionSchema,
    //  fields: [], // Fields would be too dynamic to list statically here
    //  getFieldsWithOptions: (...) => {...}
    // }
};

export type ResourceType = keyof typeof resourceFormDefinitions;