// src/pages/medicines/index.tsx
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { Medicine, medicineColumns, medicineColumnVisibility } from './table-definition';
import { PaginatedResponse } from '@/types';


interface Props {
    medicines: PaginatedResponse<Medicine>;
}

const MedicinesPage = ({ medicines }: Props) => {

    return (
        <AppLayout breadcrumbs={[{ title: 'Medicines', href: '/medicines' }]}>
            <Head title="Medicines" />
            <div className="container mx-auto p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Medicines</h1>
                    <Button onClick={() => (window.location.href = '/medicines/create')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Medicine
                    </Button>
                </div>

                <DataTable
                    columns={medicineColumns}
                    paginatedData={medicines}
                    searchKey="name"
                    searchPlaceholder="Search medicines..."
                    initialVisibility={medicineColumnVisibility}
                    pageSizeOptions={[10, 20, 50, 100]}
                    exportFileName={`medicines-${new Date().toISOString().split('T')[0]}`}
                    inertiaVisitUrl={route('medicines.index')}
                    inertiaDataPropName='medicines'
                />
            </div>
        </AppLayout>
    );
};

export default MedicinesPage;
