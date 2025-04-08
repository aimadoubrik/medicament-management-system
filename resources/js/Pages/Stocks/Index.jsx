import React from 'react'
import { Link, usePage } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'

export default function Index() {
    const { stocks, canNotify } = usePage().props

    return (
        <AuthenticatedLayout>
            <div className="p-6 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold dark:text-white">Stock List</h1>
                    <Link
                        href="/stocks/create"
                        className="px-4 py-2 text-white bg-blue-600 rounded dark:bg-blue-700 dark:text-white"
                    >
                        + Add Stock
                    </Link>
                </div>

                {canNotify && stocks.some(s => s.is_expiring) && (
                    <div className="px-4 py-2 mb-4 text-yellow-800 bg-yellow-100 rounded dark:bg-yellow-800 dark:text-yellow-300">
                        ⚠️ Some stocks are expiring within 3 days!
                    </div>
                )}

                <div className="overflow-x-auto bg-white rounded shadow dark:bg-gray-700">
                    <table className="min-w-full">
                        <thead className="text-left bg-gray-100 dark:bg-gray-600">
                            <tr>
                                <th className="px-4 py-2">Medication</th>
                                <th className="px-4 py-2">Quantity</th>
                                <th className="px-4 py-2">Start Time</th>
                                <th className="px-4 py-2">End Time</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stocks.map((stock) => (
                                <tr key={stock.id} className="border-t dark:border-gray-500">
                                    <td className="px-4 py-2 dark:text-white">{stock.medication.name}</td>
                                    <td className="px-4 py-2 dark:text-white">{stock.quantity}</td>
                                    <td className="px-4 py-2 dark:text-white">{stock.start_time}</td>
                                    <td className="px-4 py-2 dark:text-white">
                                        {stock.end_time}
                                        {stock.is_expiring && (
                                            <span className="ml-2 text-sm font-semibold text-red-600 dark:text-red-400">
                                                ⏰ Expiring Soon!
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-4 py-2 space-x-2">
                                        <Link
                                            href={`/stocks/${stock.id}/edit`}
                                            className="text-blue-600 hover:underline dark:text-blue-400"
                                        >
                                            Edit
                                        </Link>
                                        <Link
                                            as="button"
                                            method="delete"
                                            href={`/stocks/${stock.id}`}
                                            className="text-red-600 hover:underline dark:text-red-400"
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

