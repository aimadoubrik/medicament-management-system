import React from 'react'
import { Link, usePage } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'

export default function Index() {
    const { suppliers } = usePage().props

    return (
        <AuthenticatedLayout>
            <div className="p-6 dark:bg-gray-800">
                <h1 className="mb-4 text-2xl font-bold dark:text-white">Suppliers</h1>
                <Link
                    href="/suppliers/create"
                    className="inline-block px-4 py-2 mb-4 text-white bg-blue-600 rounded dark:bg-blue-700 dark:text-white"
                >
                    Add Supplier
                </Link>
                <div className="mt-4 bg-white rounded shadow dark:bg-gray-700">
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-600">
                                <th className="p-2 dark:text-gray-300">Name</th>
                                <th className="p-2 dark:text-gray-300">Email</th>
                                <th className="p-2 dark:text-gray-300">Phone</th>
                                <th className="p-2 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map(supplier => (
                                <tr key={supplier.id} className="border-b dark:border-gray-500">
                                    <td className="p-2 dark:text-white">{supplier.name}</td>
                                    <td className="p-2 dark:text-white">{supplier.email}</td>
                                    <td className="p-2 dark:text-white">{supplier.phone}</td>
                                    <td className="p-2 space-x-2">
                                        <Link href={`/suppliers/${supplier.id}/edit`} className="text-blue-600 dark:text-blue-400">Edit</Link>
                                        <Link
                                            method="delete"
                                            href={`/suppliers/${supplier.id}`}
                                            as="button"
                                            className="text-red-600 dark:text-red-400"
                                        >
                                            Delete
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}

