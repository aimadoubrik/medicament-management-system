import { LaravelPaginator } from '@/types/laravel-paginator'; // Import the type
import { Column, ColumnDef, Table, VisibilityState } from '@tanstack/react-table';

export interface DataTableProps<TData, TValue> {
    paginatedData: LaravelPaginator<TData>; // Data structure from Laravel/Inertia
    columns: ColumnDef<TData, TValue>[];
    searchKey?: keyof TData;
    searchPlaceholder?: string;
    initialVisibility?: VisibilityState;
    pageSizeOptions?: number[];
    enableRowSelection?: boolean;
    enableColumnVisibility?: boolean;
    exportFileName?: string;
    inertiaVisitUrl: string; // URL for Inertia requests
    inertiaDataPropName: string; // Prop name Inertia should update
}

export interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>;
    title: string;
}

export interface DataTablePaginationProps<TData> {
    table: Table<TData>;
    pageSizeOptions?: number[];
}

export interface DataTableViewOptionsProps<TData> {
    table: Table<TData>;
}
