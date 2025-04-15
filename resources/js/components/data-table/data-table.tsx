import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { router } from '@inertiajs/react'; // Import Inertia router
import { useState, useEffect, useMemo, useRef } from 'react';
import { DataTablePagination } from './pagination';
import { DataTableProps } from './types'; // Assuming types.ts exists and is correctly defined
import { DataTableViewOptions } from './view-options'; // Assuming view-options.tsx exists
import { LaravelPaginator } from '@/types/laravel-paginator'; // Import the type

import {
    // Column, // Not explicitly used, can be removed if not needed directly
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    useReactTable,
    Table as ReactTable,
    Row,
    PaginationState,
} from '@tanstack/react-table';

// Import export libraries
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Import icons
import { Download } from 'lucide-react';

// --- Helper function: getHeaderText ---
const getHeaderText = (headerDef: unknown): string => {
    if (typeof headerDef === 'string') {
        return headerDef;
    }
    const col = headerDef as ColumnDef<any, any>; // Basic type assertion
    // Use meta.exportHeader first, then fallback to column ID
    return col?.meta?.exportHeader || col?.id || '';
};

// --- Helper function: debounce ---
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
        new Promise(resolve => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                timeoutId = null;
                resolve(func(...args));
            }, waitFor);
        });
}


// Define the component props
interface ExtendedDataTableProps<TData, TValue> extends Omit<DataTableProps<TData, TValue>, 'data'> {
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
    inertiaDataPropName: string; // *** ADDED: Prop name Inertia should update ***
}

export function DataTable<TData, TValue>({
    paginatedData,
    columns,
    searchKey,
    searchPlaceholder,
    initialVisibility,
    pageSizeOptions = [10, 20, 30, 40, 50],
    enableRowSelection = true,
    enableColumnVisibility = true,
    exportFileName = 'data-export',
    inertiaVisitUrl,
    inertiaDataPropName, // *** Destructure the new prop ***
}: ExtendedDataTableProps<TData, TValue>) {

    // --- State Management ---
    const [sorting, setSorting] = useState<SortingState>([]);
    // const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]); // Keep if server-side column filters needed
    const [globalFilter, setGlobalFilter] = useState<string>(''); // For the main search input
    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialVisibility || {});

    // Pagination State - Initialize from the paginatedData prop
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: paginatedData.current_page - 1, // Adjust for 0-based index
        pageSize: paginatedData.per_page,
    });

    // Ref to prevent initial effect runs triggering unnecessary fetches
    const isInitialMount = useRef(true);

    // --- Data Fetching via Inertia ---
    const debouncedSetGlobalFilter = useMemo(() => debounce(setGlobalFilter, 300), []);

    useEffect(() => {
        // Skip effect on initial mount if data is already loaded server-side
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Prepare parameters for the Inertia request
        const params: Record<string, any> = {
            page: pagination.pageIndex + 1, // Send 1-based index to Laravel
            perPage: pagination.pageSize,
        };

        // Add sorting parameters if sorting state exists
        if (sorting.length > 0) {
            params.sort = sorting[0].id;
            params.direction = sorting[0].desc ? 'desc' : 'asc';
        }

        // Add global filter parameters if value and key exist
        if (globalFilter && searchKey) {
            params.filter = globalFilter;
            params.filterBy = String(searchKey);
        }

        // Add specific column filters if implemented
        // if (columnFilters.length > 0) {
        //     params.filters = JSON.stringify(columnFilters);
        // }

        // Make the Inertia request
        router.get(inertiaVisitUrl, params, {
            preserveState: true,
            preserveScroll: true,
            replace: true, // Avoids polluting browser history on pagination/sort/filter
            // *** CRITICAL FIX: Use the dynamic prop name for the `only` array ***
            only: [inertiaDataPropName],
        });

    }, [
        // Dependencies that trigger the data fetch
        pagination.pageIndex,
        pagination.pageSize,
        sorting,
        globalFilter,
        // columnFilters, // Add if implementing server-side column filters
        inertiaVisitUrl,
        searchKey,
        inertiaDataPropName, // *** ADDED: Ensure effect runs if prop name changes (unlikely but good practice) ***
    ]);

    // --- Sync local pagination state with incoming props ---
    // This runs when the component receives new `paginatedData` after an Inertia visit
    useEffect(() => {
        setPagination(currentPaginationState => {
             // Check if the incoming data reflects a different state than local
            const serverPageIndex = paginatedData.current_page - 1;
            const serverPageSize = paginatedData.per_page;

            // Update local state only if it differs from the server response,
            // respecting user's potential page size selection if server hasn't caught up.
            if (serverPageIndex !== currentPaginationState.pageIndex || serverPageSize !== currentPaginationState.pageSize) {
                 return {
                      pageIndex: serverPageIndex,
                      // Prefer server's page size if it differs, otherwise keep local state
                      pageSize: serverPageSize,
                 };
            }
            // If server state matches local, no change needed
            return currentPaginationState;
       });
    }, [paginatedData.current_page, paginatedData.per_page]);


    // --- TanStack Table Instance ---
    const table = useReactTable({
        data: paginatedData.data ?? [], // Data for the current page
        columns,
        getCoreRowModel: getCoreRowModel(),

        // Configure manual server-side operations
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,

        // State managed by React
        state: {
            sorting,
            // columnFilters, // Enable if using server-side column filters
            columnVisibility,
            rowSelection,
            pagination,
        },

        // Handlers to update React state
        onSortingChange: setSorting,
        // onColumnFiltersChange: setColumnFilters, // Enable if using server-side column filters
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination, // Updates local state, triggering useEffect fetch

        // Server-provided counts for pagination UI
        pageCount: paginatedData.last_page ?? -1, // Use server's last_page for total pages
        rowCount: paginatedData.total, // Use server's total for overall row count

        // Feature toggles
        enableRowSelection: enableRowSelection,

        // Optional meta data for columns
        // meta: { ... }
    });

    // --- Search Logic ---
    const canSearch = !!searchKey;
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSetGlobalFilter(event.target.value);
    };
    const currentSearchValue = globalFilter;


    // --- Export Logic ---
    // CAVEAT: Exports only the currently displayed page data.
    const getExportData = (tableInstance: ReactTable<TData>): { headers: string[], body: unknown[][] } => {
       const visibleColumns = tableInstance.getVisibleLeafColumns();
       const headers = visibleColumns.map(col => {
           const metaHeader = (col.columnDef.meta as any)?.exportHeader;
           return metaHeader || getHeaderText(col.columnDef.header || col.id);
       });

       const dataRows = tableInstance.getRowModel().rows; // Data from current page
       const body = dataRows.map((row: Row<TData>) =>
           visibleColumns.map(col => {
               const cell = row.getVisibleCells().find(cell => cell.column.id === col.id);
               const value = cell?.getValue();
               if (value instanceof Date) return value.toISOString().split('T')[0];
               if (typeof value === 'boolean') return value ? 'Yes' : 'No';
               if (typeof value === 'object' && value !== null) return JSON.stringify(value);
               return value != null ? String(value) : ''; // Ensure null/undefined are empty strings
           })
       );
       return { headers, body };
    };

    const handleExportExcel = () => {
        if (noDataToExport) return;
        const { headers, body } = getExportData(table);
        const wsData = [headers, ...body];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const colWidths = headers.map((_, i) => ({
            wch: Math.max(
                headers[i]?.length || 10,
                ...body.map(row => row[i]?.toString().length || 0)
            ) + 2
        }));
        ws['!cols'] = colWidths;
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        XLSX.writeFile(wb, `${exportFileName}.xlsx`);
    };

    const handleExportPdf = () => {
        if (noDataToExport) return;
        const { headers, body } = getExportData(table);
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        autoTable(doc, {
            head: [headers],
            body: body,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [22, 160, 133], fontSize: 8, fontStyle: 'bold' },
            margin: { top: 30 },
            didDrawPage: (data) => {
                doc.setFontSize(10);
                doc.text(`Page ${data.pageNumber}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
            },
        });
        doc.save(`${exportFileName}.pdf`);
    };

    const noDataToExport = table.getRowModel().rows.length === 0;


    // --- Render Component ---
    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Search Input */}
                <div className="flex-1">
                    {canSearch && (
                        <Input
                            placeholder={searchPlaceholder || `Search ${String(searchKey).replace(/_/g, ' ')}...`}
                            value={currentSearchValue}
                            onChange={handleSearchChange}
                            className="h-10 max-w-sm"
                        />
                    )}
                </div>

                {/* View Options & Export Dropdown */}
                <div className="flex items-center gap-2">
                    {enableColumnVisibility && <DataTableViewOptions table={table} />}
                    <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                             <Button
                                 variant="outline"
                                 size="sm"
                                 className="ml-auto hidden h-10 lg:flex items-center gap-1"
                                 disabled={noDataToExport}
                             >
                                 <Download className="h-4 w-4" />
                                 <span>Export</span>
                             </Button>
                         </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem onSelect={handleExportExcel} disabled={noDataToExport}>
                                 Export to Excel (.xlsx)
                             </DropdownMenuItem>
                             <DropdownMenuItem onSelect={handleExportPdf} disabled={noDataToExport}>
                                 Export to PDF (.pdf)
                             </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table Container */}
            <div className="overflow-hidden rounded-md border">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }} colSpan={header.colSpan}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination Component */}
            <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} rowCount={paginatedData.total} />
        </div>
    );
}