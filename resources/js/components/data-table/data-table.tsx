// src/components/data-table/data-table.tsx  (or your file path)

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useState } from 'react';
import { DataTablePagination } from './pagination'; // Assuming pagination.tsx exists
import { DataTableProps } from './types'; // Assuming types.ts exists
import { DataTableViewOptions } from './view-options'; // Assuming view-options.tsx exists

import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    Table as ReactTable, // Alias @tanstack/react-table's Table type
    Row, // Import Row type
} from '@tanstack/react-table';

// Import export libraries
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Import icons
import { Download } from 'lucide-react';

// Helper function to extract simple header text
// Customize this if your headers are complex React nodes and you don't want to use `meta.exportHeader`
const getHeaderText = (headerDef: unknown): string => {
    if (typeof headerDef === 'string') {
        return headerDef;
    }
    // Add more sophisticated checks if needed, e.g., for specific component types
    // Fallback for non-string headers without meta.exportHeader
    console.warn("Complex header found without 'meta.exportHeader'. Using column ID for export. Define 'meta.exportHeader' in columnDef for better results.");
    return headerDef?.id || '';
};

// Define the component props, extending the imported DataTableProps
// Ensure DataTableProps includes generic types TData, TValue and necessary base props
interface ExtendedDataTableProps<TData, TValue> extends DataTableProps<TData, TValue> {
    exportFileName?: string; // Optional custom filename for exports
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder,
    initialVisibility,
    pageSize = 10,
    pageSizeOptions = [10, 20, 30, 40, 50],
    enableRowSelection = true,
    enableColumnVisibility = true,
    exportFileName = 'data-export', // Default export filename
}: ExtendedDataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialVisibility || {});

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(), // Crucial for filtering before export
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        enableRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        initialState: {
            pagination: {
                pageSize,
            },
        },
        // Optional: Add meta data to columns for custom export headers/formatting
        // meta: {
        //   getExportValue: (row, columnId) => { /* custom logic */ }
        // }
    });

    const canSearch = searchKey && table.getColumn(String(searchKey));

    // --- Export Logic ---

    const getExportData = (tableInstance: ReactTable<TData>): { headers: string[], body: unknown[][] } => {
        const visibleColumns = tableInstance.getVisibleLeafColumns();

        // Extract Headers: Prioritize meta.exportHeader, then simple string, fallback to ID
        const headers = visibleColumns.map(col => {
            return col.columnDef.meta?.exportHeader || getHeaderText(col.columnDef.header);
        });

        // Extract Body Data: Use filtered & sorted rows, get raw values
        const dataRows = tableInstance.getFilteredRowModel().rows; // Use filtered rows
        const body = dataRows.map((row: Row<TData>) =>
            visibleColumns.map(col => {
                // Find the corresponding cell in the row for the visible column
                const cell = row.getVisibleCells().find(cell => cell.column.id === col.id);
                // Use getValue() which respects accessor functions
                const value = cell?.getValue();

                // Basic type formatting for export - adjust as needed
                if (value instanceof Date) {
                    // Consistent date format (YYYY-MM-DD), suitable for Excel and readable in PDF
                    return value.getFullYear() + '-' +
                        ('0' + (value.getMonth() + 1)).slice(-2) + '-' +
                        ('0' + value.getDate()).slice(-2);
                }
                if (typeof value === 'boolean') {
                    return value ? 'Yes' : 'No';
                }
                if (typeof value === 'object' && value !== null) {
                    // Avoid exporting complex objects directly. Stringify or extract key info.
                    // Consider adding a specific meta function like `meta.getExportValue` if needed.
                    return JSON.stringify(value); // Simple stringification
                }
                // Ensure null/undefined become empty strings
                return value !== null && value !== undefined ? String(value) : '';
            })
        );

        return { headers, body };
    };

    const handleExportExcel = () => {
        if (noDataToExport) return; // Prevent export if no data

        const { headers, body } = getExportData(table);
        const wsData = [headers, ...body]; // Combine headers and body for the sheet
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Optional: Auto-calculate column widths
        const colWidths = headers.map((_, i) => ({
            wch: Math.max(
                headers[i]?.length || 10, // Header length (with minimum)
                ...body.map(row => row[i]?.toString().length || 0) // Max length in column body
            ) + 2 // Add padding
        }));
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new(); // Create a new workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Data'); // Add the worksheet with name 'Data'
        XLSX.writeFile(wb, `${exportFileName}.xlsx`); // Trigger download
    };

    const handleExportPdf = () => {
        if (noDataToExport) return; // Prevent export if no data

        const { headers, body } = getExportData(table);
        const doc = new jsPDF({
            orientation: 'landscape', // Often better for wide tables
            unit: 'pt', // points, common for fonts/margins
            format: 'a4' // standard page size
        });

        autoTable(doc, {
            head: [headers], // Header row
            body: body,      // Data rows
            styles: { fontSize: 8 }, // Basic styling
            headStyles: { fillColor: [22, 160, 133], fontSize: 8, fontStyle: 'bold' }, // Header style
            margin: { top: 30 }, // Margin for title or header
            didDrawPage: (data) => {
                // Optional: Add page numbers or headers/footers
                doc.setFontSize(10);
                doc.text(`Page ${data.pageNumber}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
            },
        });

        doc.save(`${exportFileName}.pdf`); // Trigger download
    };

    // Determine if data is available for export
    const noDataToExport = table.getFilteredRowModel().rows.length === 0;

    // --- Render Component ---

    return (
        <div className="space-y-4">
            {/* Toolbar: Search, View Options, Export */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Search Input */}
                <div className="flex-1">
                    {canSearch && (
                        <Input
                            placeholder={searchPlaceholder || `Search by ${String(searchKey).replace(/_/g, ' ')}...`}
                            value={(table.getColumn(String(searchKey))?.getFilterValue() as string) ?? ''}
                            onChange={(event) => table.getColumn(String(searchKey))?.setFilterValue(event.target.value)}
                            className="h-10 max-w-sm" // Consistent height
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
                                className="flex items-center" // Consistent height, gap for icon
                                disabled={noDataToExport} // Disable button if no data
                            >
                                <Download className="h-4 w-4" />
                                <span>Export</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={handleExportExcel} // Use onSelect for Shadcn items
                                disabled={noDataToExport}   // Also disable the item itself
                            >
                                Export to Excel (.xlsx)
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={handleExportPdf}
                                disabled={noDataToExport}
                            >
                                Export to PDF (.pdf)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table Container */}
            <div className="overflow-hidden rounded-md border">
                <div className="overflow-x-auto"> {/* Enable horizontal scroll on smaller screens */}
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
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

            {/* Pagination */}
            <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
        </div>
    );
}