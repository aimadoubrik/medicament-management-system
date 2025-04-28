import { DataTable } from '@/components/data-table';
import { CategoryDetails } from '@/components/details/CategoryDetails';
import { ResourceForm } from '@/components/forms/ResourceForm';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { Modal } from '@/components/ui/Modal';
import { resourceFormDefinitions } from '@/definitions/form-definitions';
import AppLayout from '@/layouts/app-layout';
import { CategoryFormData } from '@/schemas/category';
import { Category as CategoryType, PageProps, PaginatedResponse } from '@/types';
import { Head, router } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { categoryColumnVisibility, getCategoryColumns } from './table-definition';

// Define the props specific to this page
interface CategoriesIndexProps extends PageProps {
    categories: PaginatedResponse<CategoryType>;
}

export default function Index({ categories: paginatedCategories }: CategoriesIndexProps) {
    // --- Internationalization (i18n) Setup ---
    const intl = useIntl();

    const updateButtonText = intl.formatMessage({
        id: 'common.update',
        defaultMessage: 'Update Category',
    });
    const createButtonText = intl.formatMessage({
        id: 'common.create',
        defaultMessage: 'Create Category',
    });
    const cancelButtonText = intl.formatMessage({
        id: 'common.cancel',
        defaultMessage: 'Cancel',
    });

    // --- State and Modal Logic (remains the same) ---
    const [modalState, setModalState] = useState<{
        mode: 'create' | 'edit' | 'show' | null;
        data: CategoryType | null;
    }>({ mode: null, data: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isModalOpen = modalState.mode !== null;
    const isEditing = modalState.mode === 'edit';

    const openModal = useCallback((mode: 'create' | 'edit' | 'show', data: CategoryType | null = null) => {
        setModalState({ mode, data });
    }, []);

    const closeModal = () => {
        setModalState({ mode: null, data: null });
        setIsSubmitting(false);
    };

    // --- Form Definition Logic (remains the same) ---
    const categoryFormDefinition = resourceFormDefinitions.categories;
    const categorySchema = categoryFormDefinition.schema;
    const categoryFieldConfig = useMemo(() => {
        return categoryFormDefinition.fields;
    }, [categoryFormDefinition]);

    // --- Form Submission Handler (remains the same) ---
    const handleFormSubmit: SubmitHandler<CategoryFormData> = (formData) => {
        // ... (submission logic)
        setIsSubmitting(true);
        const url = isEditing ? route('categories.update', modalState.data!.id) : route('categories.store');
        const method = isEditing ? 'put' : 'post';

        router[method](url, formData, {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                toast.success(`Category ${isEditing ? 'updated' : 'created'} successfully!`);
            },
            onError: (errors) => {
                console.error('Backend validation errors:', errors);
                const errorMessages = Object.values(errors).flat().join(' ');
                toast.error(`Error ${isEditing ? 'updating' : 'creating'} category`, {
                    description: errorMessages || 'An unexpected error occurred.',
                });
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    // --- Generate Table Columns by CALLING the imported function ---
    // Pass the necessary functions (openModal, router, route) from this component's scope
    const columns = useMemo(
        () =>
            getCategoryColumns({
                openModal,
                router, // Pass the imported router instance
                route, // Pass the imported route function
            }),
        [openModal],
    ); // Recalculate only if openModal changes (stable due to useCallback)

    // --- Modal Title Logic (remains the same) ---
    const getModalTitle = () => {
        // ... (modal title logic)
        switch (modalState.mode) {
            case 'create':
                return <FormattedMessage id="categories.modal.create" defaultMessage="Add New Category" />;
            case 'edit':
                return (
                    <FormattedMessage
                        id="categories.modal.edit"
                        defaultMessage="Edit Category: {categoryName}"
                        values={{ categoryName: modalState.data?.name ?? '' }}
                    />
                );
            case 'show':
                return (
                    <FormattedMessage
                        id="categories.modal.show"
                        defaultMessage="Category Details: {categoryName}"
                        values={{ categoryName: modalState.data?.name ?? '' }}
                    />
                );
            default:
                return '';
        }
    };

    // --- JSX Rendering ---
    return (
        <AppLayout breadcrumbs={[{ title: 'Categories', href: route('categories.index') }]}>
            <Head title="Categories" />
            <div className="container mx-auto p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        <FormattedMessage id="categories.index.title" defaultMessage="Categories" />
                    </h1>
                    <Button onClick={() => openModal('create')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <FormattedMessage id="categories.button.add" defaultMessage="Add Category" />
                    </Button>
                </div>

                {/* Data Table - Pass the generated columns */}
                <DataTable
                    columns={columns} // Use the columns generated by getCategoryColumns
                    paginatedData={paginatedCategories}
                    searchKey="name"
                    searchPlaceholder="Search categories..."
                    inertiaVisitUrl={route('categories.index')}
                    inertiaDataPropName="categories"
                    initialVisibility={categoryColumnVisibility} // Use imported visibility
                    pageSizeOptions={[10, 20, 50, 100]}
                    exportFileName={`categories-${new Date().toISOString().split('T')[0]}`}
                />
            </div>

            {/* Reusable Modal (remains the same) */}
            <Modal
                title={getModalTitle()}
                isOpen={isModalOpen}
                onClose={closeModal}
                footerContent={
                    modalState.mode === 'show' ? (
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" onClick={closeModal}>
                                <FormattedMessage id="common.close" defaultMessage="Close" />
                            </Button>
                        </DialogClose>
                    ) : null
                }
            >
                {(modalState.mode === 'create' || modalState.mode === 'edit') && (
                    <ResourceForm
                        schema={categorySchema}
                        fieldConfig={categoryFieldConfig}
                        initialData={modalState.mode === 'edit' ? modalState.data : null}
                        onSubmit={handleFormSubmit}
                        onCancel={closeModal}
                        isLoading={isSubmitting}
                        submitButtonText={isEditing ? createButtonText : updateButtonText}
                        cancelButtonText={cancelButtonText}
                    />
                )}
                {modalState.mode === 'show' && modalState.data && <CategoryDetails category={modalState.data} />}
            </Modal>
        </AppLayout>
    );
}
