// src/components/data-table/pagination.tsx

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { DataTablePaginationProps } from './types'; // Make sure this includes rowCount prop

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table } from '@tanstack/react-table'; // Import Table type

// Update props if needed in types.ts
interface ExtendedDataTablePaginationProps<TData> extends DataTablePaginationProps<TData> {
    table: Table<TData>;
    pageSizeOptions?: number[];
    rowCount: number; // Pass total row count from the server
}

export function DataTablePagination<TData>({
    table,
    pageSizeOptions = [10, 20, 30, 40, 50],
    rowCount, // Receive total row count
}: ExtendedDataTablePaginationProps<TData>) {
    const currentPage = table.getState().pagination.pageIndex + 1;
    const pageSize = table.getState().pagination.pageSize;
    const pageCount = table.getPageCount(); // This is now correctly set via manual mode

    // Calculate range of items being shown
    const startRow = rowCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endRow = Math.min(currentPage * pageSize, rowCount);

    return (
        <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
            {/* Row Selection Info (optional, consider if selection persistence across pages is needed) */}
            <div className="text-muted-foreground flex-1 text-sm">
                {table.getFilteredSelectedRowModel().rows.length > 0
                    ? `${table.getFilteredSelectedRowModel().rows.length} of ${
                          // Display total selected if needed, otherwise maybe just current page selection
                          table.getRowModel().rows.length // Rows on current page
                      } row(s) selected on this page.`
                    : rowCount > 0
                      ? `Showing ${startRow} to ${endRow} of ${rowCount} results.`
                      : 'No results.'}
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
                {/* Rows Per Page Selector */}
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium whitespace-nowrap">Rows per page</p>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                            // This triggers onPaginationChange in DataTable
                            table.setPageSize(Number(value));
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {pageSizeOptions.map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Page Indicator */}
                <div className="flex w-full items-center justify-center text-sm font-medium sm:w-auto">
                    {/* Use pageCount which is now correctly managed */}
                    Page {pageCount <= 0 ? 0 : currentPage} of {pageCount <= 0 ? 0 : pageCount}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex" // Show on larger screens
                        onClick={() => table.setPageIndex(0)} // Triggers onPaginationChange
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.previousPage()} // Triggers onPaginationChange
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.nextPage()} // Triggers onPaginationChange
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex" // Show on larger screens
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)} // Triggers onPaginationChange
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
