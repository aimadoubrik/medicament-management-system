// src/pages/categories/index.tsx
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { Category, categoryColumns, categoryColumnVisibility } from './table-definition';
import { PaginatedResponse } from '@/types';

interface Props {
    categories: PaginatedResponse<Category>;
}

const CategoriesPage = ({ categories }: Props) => {
    return (
        <AppLayout breadcrumbs={[{ title: 'Categories', href: '/categories' }]}>
            <Head title="Categories" />
            <div className="container mx-auto p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Categories</h1>
                    <Button onClick={() => (window.location.href = '/categories/create')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </div>

                <DataTable
                    columns={categoryColumns}
                    data={categories.data}
                    searchKey="name"
                    searchPlaceholder="Search categories..."
                    initialVisibility={categoryColumnVisibility}
                    pageSize={20}
                    pageSizeOptions={[10, 20, 50, 100]}
                    exportFileName={`categories-${new Date().toISOString().split('T')[0]}`}
                />
            </div>
        </AppLayout>
    );
};

export default CategoriesPage;
