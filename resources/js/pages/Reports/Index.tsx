import { DataTable } from '@/components/data-table';
import AppLayout from '@/layouts/app-layout';
import { PageProps, PaginatedResponse, StockLedgerEntry as StockLedgerEntryType } from '@/types';
import { Head } from '@inertiajs/react';
import { stockLedgerEntryColumns as baseStockLedgerEntryColumns, stockLedgerEntryColumnVisibility } from './table-definition';

// Define the props specific to this page
interface StockLedgerEntriesIndexProps extends PageProps {
    stockLedgerEntries: PaginatedResponse<StockLedgerEntryType>;
}

export default function Index({ stockLedgerEntries: paginatedStockLedgerEntries }: StockLedgerEntriesIndexProps) {

    const columns = [...baseStockLedgerEntryColumns];

    return (
        <AppLayout 
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Stock Ledger Entries', href: route('reports.index') }
            ]}
        >
            <Head title="Stock Ledger Entries" />
            <div className="container mx-auto p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Stock Ledger Entries</h1>
                </div>

                <DataTable
                    columns={columns}
                    paginatedData={paginatedStockLedgerEntries}
                    searchKey="medicine_name"
                    searchPlaceholder="Search stock ledger entries..."
                    inertiaVisitUrl={route('reports.index')}
                    inertiaDataPropName="stockLedgerEntries"
                    initialVisibility={stockLedgerEntryColumnVisibility}
                    pageSizeOptions={[10, 20, 50, 100]}
                    exportFileName={`stock-ledger-entries-${new Date().toISOString().split('T')[0]}`}
                />
            </div>
        </AppLayout>
    );
}