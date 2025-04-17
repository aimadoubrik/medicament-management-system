// src/pages/suppliers/index.tsx
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { PaginatedResponse } from '@/types';
import { Head } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { Supplier, supplierColumns, supplierColumnVisibility } from './table-definition';

interface Props {
    suppliers: PaginatedResponse<Supplier>;
}

const SuppliersPage = ({ suppliers }: Props) => {
    return (
        <AppLayout breadcrumbs={[{ title: 'Suppliers', href: '/suppliers' }]}>
            <Head title="Suppliers" />
            <div className="container mx-auto p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Suppliers</h1>
                    <Button onClick={() => (window.location.href = '/suppliers/create')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Supplier
                    </Button>
                </div>

                <DataTable
                    columns={supplierColumns}
                    paginatedData={suppliers}
                    searchKey="name"
                    searchPlaceholder="Search suppliers..."
                    initialVisibility={supplierColumnVisibility}
                    pageSizeOptions={[10, 20, 50, 100]}
                    exportFileName={`suppliers-${new Date().toISOString().split('T')[0]}`}
                    inertiaVisitUrl={route('suppliers.index')}
                    inertiaDataPropName="suppliers"
                />
            </div>
        </AppLayout>
    );
};

export default SuppliersPage;
