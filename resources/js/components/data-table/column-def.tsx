import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from './column-header';

// Creates a selection column with checkboxes
export function createSelectionColumn<TData>(): ColumnDef<TData> {
    return {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
        ),
        enableSorting: false,
        enableHiding: false,
    };
}

// Creates a text column with sorting
export function createTextColumn<TData>(accessorKey: keyof TData & string, header: string): ColumnDef<TData> {
    return {
        accessorKey,
        header: ({ column }) => <DataTableColumnHeader column={column} title={header} />,
        cell: ({ row }) => <span>{row.getValue(accessorKey)}</span>,
        meta: {
            exportHeader: header,
        }
    };
}

// Creates a number column with sorting
export function createNumberColumn<TData>(accessorKey: keyof TData & string, header: string): ColumnDef<TData> {
    return {
        accessorKey,
        header: ({ column }) => <DataTableColumnHeader column={column} title={header} />,
        cell: ({ row }) => <span>{row.getValue(accessorKey)}</span>,
        meta: {
            exportHeader: header,
        }
    };
}

// Creates a boolean column with yes/no values
export function createBooleanColumn<TData>(accessorKey: keyof TData & string, header: string): ColumnDef<TData> {
    return {
        accessorKey,
        header: ({ column }) => <DataTableColumnHeader column={column} title={header} />,
        cell: ({ row }) => <span>{row.getValue(accessorKey) ? 'Yes' : 'No'}</span>,
        meta: {
            exportHeader: header,
        }
    };
}

// Creates a date column with formatted dates
export function createDateColumn<TData>(accessorKey: keyof TData & string, header: string): ColumnDef<TData> {
    return {
        accessorKey,
        header: ({ column }) => <DataTableColumnHeader column={column} title={header} />,
        cell: ({ row }) => {
            const value = row.getValue(accessorKey) as string;
            if (!value) return null;
            return <span>{new Date(value).toLocaleDateString()}</span>;
        },
        meta: {
            exportHeader: header,
        }
    };
}

// Add more column creators as needed
