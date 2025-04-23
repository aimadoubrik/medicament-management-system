import { FieldConfig } from '@/components/forms/ResourceForm';
import { Category, Medicine, Supplier } from '@/types';

// --- Import Schemas ---
import { BatchFormData, batchSchema } from '@/schemas/batch';
import { CategoryFormData, categorySchema } from '@/schemas/category';
import { MedicineFormData, medicineSchema } from '@/schemas/medicine';
import { SupplierFormData, supplierSchema } from '@/schemas/supplier';

// --- Helper for Select Options ---
const getCategoryOptions = (categories: Category[]) => categories.map((cat) => ({ value: String(cat.id), label: cat.name }));
const getSupplierOptions = (suppliers: Supplier[]) => suppliers.map((sup) => ({ value: String(sup.id), label: sup.name }));
const getMedicineOptions = (medicines: Medicine[]) => medicines.map((med) => ({ value: String(med.id), label: `${med.name} (${med.strength})` }));

// --- Form Field Definitions ---

const medicineFormFields: FieldConfig<MedicineFormData>[] = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'generic_name', label: 'Generic Name', type: 'text', required: true },
    { name: 'manufacturer', label: 'Manufacturer', type: 'text', required: true },
    { name: 'strength', label: 'Strength', type: 'text', required: true },
    { name: 'form', label: 'Form', type: 'text', required: true },
    { name: 'category_id', label: 'Category', type: 'select', required: true, options: [], placeholder: 'Select category' }, // Options populated dynamically
    { name: 'low_stock_threshold', label: 'Low Stock Threshold', type: 'number', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'requires_prescription', label: 'Requires Prescription', type: 'checkbox' },
];

const categoryFormFields: FieldConfig<CategoryFormData>[] = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
];

const supplierFormFields: FieldConfig<SupplierFormData>[] = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'text', required: true },
    { name: 'address', label: 'Address', type: 'text', required: true },
    { name: 'contact_person', label: 'Contact Person', type: 'text' },
];

const batchFormFields: FieldConfig<BatchFormData>[] = [
    { name: 'medicine_id', label: 'Medicine', type: 'select', required: true, options: [], placeholder: 'Select medicine' },
    { name: 'supplier_id', label: 'Supplier', type: 'select', required: true, options: [], placeholder: 'Select supplier' },
    { name: 'batch_number', label: 'Batch Number', type: 'text', required: true },
    { name: 'manufacture_date', label: 'Manufacture Date', type: 'date', required: true },
    { name: 'expiry_date', label: 'Expiry Date', type: 'date', required: true },
    { name: 'quantity_received', label: 'Quantity Received', type: 'number', required: true },
    { name: 'current_quantity', label: 'Current Quantity', type: 'number', required: true },
];

// --- Export Combined Definitions ---
export const resourceFormDefinitions = {
    medicines: {
        schema: medicineSchema,
        fields: medicineFormFields,
        // Function to inject dynamic options
        getFieldsWithOptions: (dependencies: { categories: Category[] }): FieldConfig<MedicineFormData>[] => {
            return medicineFormFields.map((field) => {
                if (field.name === 'category_id' && dependencies.categories) {
                    return { ...field, options: getCategoryOptions(dependencies.categories) };
                }
                return field;
            });
        },
    },
    categories: {
        schema: categorySchema,
        fields: categoryFormFields,
        getFieldsWithOptions: () => categoryFormFields,
    },
    suppliers: {
        schema: supplierSchema,
        fields: supplierFormFields,
        getFieldsWithOptions: () => supplierFormFields,
    },
    batches: {
        schema: batchSchema,
        fields: batchFormFields,
        getFieldsWithOptions: (dependencies: { medicines: Medicine[]; suppliers: Supplier[] }) => {
            return batchFormFields.map((field) => {
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
};

export type ResourceType = keyof typeof resourceFormDefinitions;
