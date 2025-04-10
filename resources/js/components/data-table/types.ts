import { Column, ColumnDef, Table, VisibilityState } from '@tanstack/react-table';

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    searchPlaceholder?: string;
    initialVisibility?: VisibilityState;
    pageSize?: number;
    pageSizeOptions?: number[];
    enableRowSelection?: boolean;
    enableColumnVisibility?: boolean;
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
