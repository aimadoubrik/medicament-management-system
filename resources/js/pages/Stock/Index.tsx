import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { Batch, batchColumns, batchColumnVisibility } from './table-definition';

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    batches: PaginatedData<Batch>;
}

const StockPage = ({ batches }: Props) => {
    return (
        <AppLayout breadcrumbs={[{ title: 'Stock', href: '/stock' }]}>
            <Head title="Stock" />
            <div className="container mx-auto p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Stock</h1>
                    <Button onClick={() => (window.location.href = '/stock/create')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Batch
                    </Button>
                </div>

                <DataTable
                    columns={batchColumns}
                    data={batches.data}
                    searchKey="batch_number"
                    searchPlaceholder="Search stock..."
                    initialVisibility={batchColumnVisibility}
                    pageSize={20}
                    pageSizeOptions={[10, 20, 50, 100]}
                />
            </div>
        </AppLayout>
    );
};

export default StockPage;
