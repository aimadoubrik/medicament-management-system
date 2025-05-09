import '@tanstack/react-table';
import { RowData } from '@tanstack/react-table'; // Import RowData

declare module '@tanstack/react-table' {
    // Allow adding meta typing to columns
    // TData extends RowData ensures TData is a valid data type for the table
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        exportHeader?: string; // Define your custom property
        filter?: boolean; // Simple boolean to enable/disable filter
        filterType?: 'text' | 'select' | 'date-range'; // Optional: for different filter UIs
        filterPlaceholder?: string; // Custom placeholder for the filter input
        // Add other custom meta properties if needed, e.g.:
        // cellClassName?: string;
    }
}
