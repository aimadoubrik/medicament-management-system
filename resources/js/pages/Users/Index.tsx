import { DataTable } from '@/components/data-table';
import { UserDetails } from '@/components/details/UserDetails';
import { ResourceForm } from '@/components/forms/ResourceForm';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
// Import the new ResponsiveModal components
import {
    ResponsiveModal,
    ResponsiveModalDescription,
    ResponsiveModalContent,
    ResponsiveModalHeader,
    ResponsiveModalFooter,
    ResponsiveModalTitle,
    ResponsiveModalClose, // Use this for close actions
} from '@/components/ui/responsive-modal'; // Adjusted path
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { resourceFormDefinitions } from '@/definitions/form-definitions';
import AppLayout from '@/layouts/app-layout';
import { UserFormData } from '@/schemas/user';
import { PageProps, PaginatedResponse, Role, User as UserType } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal, Pencil, PlusCircle, Trash } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { userColumns as baseUserColumns, userColumnVisibility } from './table-definition';

// Define the props specific to this page
interface UsersIndexProps extends PageProps {
    users: PaginatedResponse<UserType>;
    roles: Role[];
}

export default function Index({ users: paginatedUsers, roles }: UsersIndexProps) {

    const { props: { auth }, } = usePage<PageProps>();
    const can = auth?.user?.can || {};

    // Modal state management
    const [modalState, setModalState] = useState<{
        mode: 'create' | 'edit' | 'show' | null;
        data: UserType | null;
    }>({ mode: null, data: null });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isModalOpen = modalState.mode !== null;
    const isEditing = modalState.mode === 'edit';

    // --- Modal Control Functions ---
    const openModal = useCallback((mode: 'create' | 'edit' | 'show', data: UserType | null = null) => {
        setModalState({ mode, data });
    }, []);

    const closeModal = () => {
        setModalState({ mode: null, data: null });
        setIsSubmitting(false);
    };

    // --- Get Form Definition ---
    const userFormDefinition = resourceFormDefinitions.users;
    const userSchema = userFormDefinition.schema;
    const userFieldConfig = useMemo(() => {
        if (typeof userFormDefinition.getFieldsWithOptions === 'function') {
            return userFormDefinition.getFieldsWithOptions({ roles }); // Pass dependencies as object
        }
        return userFormDefinition.fields;
    }, [roles, userFormDefinition]);

    // --- Form Submission Handler ---
    const handleFormSubmit: SubmitHandler<UserFormData> = (formData) => {
        setIsSubmitting(true);
        const url = isEditing ? route('users.update', modalState.data!.id) : route('users.store');
        const method = isEditing ? 'put' : 'post';

        router[method](url, formData, {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                toast.success(`User ${isEditing ? 'updated' : 'created'} successfully!`);
            },
            onError: (errors) => {
                console.error('Backend validation errors:', errors);
                const errorMessages = Object.values(errors).flat().join(' ');
                toast.error(`Error ${isEditing ? 'updating' : 'creating'} user`, {
                    description: errorMessages || 'An unexpected error occurred.',
                });
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    // --- Define Table Columns ---
    const columns: ColumnDef<UserType>[] = useMemo(() => {
        const actionsColumnDef = baseUserColumns.find((col) => col.id === 'actions');
        if (!actionsColumnDef || !actionsColumnDef.cell) {
            console.warn('Actions column definition not found or is invalid in table-definition.tsx');
            return baseUserColumns;
        }

        const modifiedActionsColumn: ColumnDef<UserType> = {
            ...actionsColumnDef,
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {can.viewUser && (
                                <DropdownMenuItem onClick={() => openModal('show', user)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>View</span>
                                </DropdownMenuItem>
                            )}
                            {can.updateUser && (
                                <DropdownMenuItem onClick={() => openModal('edit', user)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                            )}
                            {can.deleteUser && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onSelect={(e) => e.preventDefault()}
                                        >
                                            <Trash className="mr-2 h-4 w-4" />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the user "{user.name}".
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => {
                                                    router.delete(route('users.destroy', user.id), {
                                                        preserveScroll: true,
                                                        onSuccess: () => toast.success('User deleted successfully'),
                                                        onError: (errors) =>
                                                            toast.error('Error deleting user', {
                                                                description: Object.values(errors).flat().join(' '),
                                                            }),
                                                    });
                                                }}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        };
        return [...baseUserColumns.filter((col) => col.id !== 'actions'), modifiedActionsColumn];
    }, [openModal]);

    // --- Modal Title Logic ---
    const getModalTitle = () => {
        switch (modalState.mode) {
            case 'create':
                return 'Add New User';
            case 'edit':
                return `Edit User: ${modalState.data?.name ?? ''}`;
            case 'show':
                return `User Details: ${modalState.data?.name ?? ''}`;
            default:
                return '';
        }
    };

    // --- Modal Description Logic ---
    const getModalDescription = () => {
        switch (modalState.mode) {
            case 'create':
                return 'Create a new user by filling out the form below.';
            case 'edit':
                return 'Edit an existing user by making changes to the form below.';
            case 'show':
                return 'View details of an existing user.';
            default:
                return '';
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Users', href: '/users' }]}>
            <Head title="Users" />
            <div className="container mx-auto p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Users</h1>
                    {can.createUser && (
                        <Button onClick={() => openModal('create')}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    )}
                </div>

                <DataTable
                    columns={columns}
                    paginatedData={paginatedUsers}
                    searchKey="name"
                    searchPlaceholder="Search users..."
                    inertiaVisitUrl={route('users.index')}
                    inertiaDataPropName="users"
                    initialVisibility={userColumnVisibility}
                    pageSizeOptions={[10, 20, 50, 100]}
                    exportFileName={`users-${new Date().toISOString().split('T')[0]}`}
                />
            </div>

            {/* Updated Reusable Modal using the new ResponsiveModal components */}
            <ResponsiveModal
                open={isModalOpen}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        closeModal();
                    }
                }}
            >
                <ResponsiveModalContent side="bottom"> {/* Default side, adjust if needed */}
                    <ResponsiveModalHeader>
                        <ResponsiveModalTitle>{getModalTitle()}</ResponsiveModalTitle>
                        <ResponsiveModalDescription>{getModalDescription()}</ResponsiveModalDescription>
                    </ResponsiveModalHeader>

                    {/* Content: Form or Details View */}
                    {(modalState.mode === 'create' || modalState.mode === 'edit') && (
                        <ResourceForm
                            schema={userSchema}
                            fieldConfig={userFieldConfig}
                            initialData={modalState.mode === 'edit' ? modalState.data : null}
                            onSubmit={handleFormSubmit}
                            onCancel={closeModal}
                            isLoading={isSubmitting}
                            submitButtonText={isEditing ? 'Update User' : 'Create User'}
                        />
                    )}

                    {modalState.mode === 'show' && modalState.data && (
                        <div className="p-1"> {/* Add padding if UserDetails doesn't have it */}
                            <UserDetails user={modalState.data} />
                        </div>
                    )}

                    {/* Footer for 'show' mode (Close button) */}
                    {modalState.mode === 'show' && (
                        <ResponsiveModalFooter>
                            <ResponsiveModalClose asChild>
                                <Button type="button" variant="secondary">
                                    Close
                                </Button>
                            </ResponsiveModalClose>
                        </ResponsiveModalFooter>
                    )}
                </ResponsiveModalContent>
            </ResponsiveModal>
        </AppLayout>
    );
}