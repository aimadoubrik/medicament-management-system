// components/data-table/column-filter.tsx
import { Input } from '@/components/ui/input';
import { Column } from '@tanstack/react-table';
import React, { useEffect, useMemo, useState } from 'react';

// Debounce function (you already have this in DataTable, consider moving to a utils file)
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
        new Promise((resolve) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                timeoutId = null;
                resolve(func(...args));
            }, waitFor);
        });
}


interface ColumnFilterComponentProps<TData extends object, TValue> {
    column: Column<TData, TValue>;
}

export function ColumnFilterComponent<TData extends object, TValue>({
    column,
}: ColumnFilterComponentProps<TData, TValue>) {
    const columnFilterValue = column.getFilterValue();
    // Local state for immediate input responsiveness
    const [inputValue, setInputValue] = useState((columnFilterValue ?? '') as string);

    const filterMeta = column.columnDef.meta;

    // Debounce the actual filter update
    const debouncedSetFilter = useMemo(
        () =>
            debounce((value: string) => {
                column.setFilterValue(value);
            }, 300), // 300ms debounce time
        [column],
    );

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setInputValue(newValue);
        debouncedSetFilter(newValue);
    };

    // Sync inputValue if the filter is cleared externally or changed programmatically
    const filterValue = column.getFilterValue();
    useEffect(() => {
        setInputValue((filterValue ?? '') as string);
    }, [filterValue, column]);

    if (!filterMeta?.filter) {
        return null; // Don't render if filter is not enabled for this column
    }

    // For now, we'll stick to a text input.
    // You can extend this with a switch based on `filterMeta.filterType`
    // to render different kinds of filter inputs (select, date picker, etc.)

    // Example for text input:
    return (
        <div className="mt-1" onClick={(e) => e.stopPropagation()}> {/* Stop propagation to prevent sorting when clicking filter */}
            <Input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={filterMeta.filterPlaceholder || `Filter by ${String(column.id)}...`}
                className="h-8 w-full text-sm rounded-md border-gray-300 shadow-sm"
            />
        </div>
    );

    // Example for select (you would need to implement this further):
    // if (filterMeta.filterType === 'select' && filterMeta.selectOptions) {
    //   return (
    //     <select
    //       value={(columnFilterValue ?? '') as string}
    //       onChange={(e) => debouncedSetFilter(e.target.value)}
    //       className="h-8 w-full text-sm rounded-md border-gray-300 shadow-sm mt-1"
    //       onClick={(e) => e.stopPropagation()}
    //     >
    //       <option value="">All</option>
    //       {filterMeta.selectOptions.map(option => (
    //         <option key={option.value} value={option.value}>{option.label}</option>
    //       ))}
    //     </select>
    //   );
    // }
}