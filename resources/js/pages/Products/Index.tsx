// src/pages/products/index.tsx
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { Product, productColumns, productColumnVisibility } from './table-definition';
import { PaginatedResponse } from '@/types';


interface Props {
    products: PaginatedResponse<Product>;
}

const ProductsPage = ({ products }: Props) => {

    return (
        <AppLayout breadcrumbs={[{ title: 'Products', href: '/products' }]}>
            <Head title="Products" />
            <div className="container mx-auto p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Products</h1>
                    <Button onClick={() => (window.location.href = '/products/create')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                </div>

                <DataTable
                    columns={productColumns}
                    data={products.data}
                    searchKey="name"
                    searchPlaceholder="Search products..."
                    initialVisibility={productColumnVisibility}
                    pageSize={20}
                    pageSizeOptions={[10, 20, 50, 100]}
                />
            </div>
        </AppLayout>
    );
};

export default ProductsPage;
