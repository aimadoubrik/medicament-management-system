import React from 'react'
import { Head, Link, usePage } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  AlertCircle 
} from 'lucide-react'

export default function Index() {
    const { medications, canNotify } = usePage().props

    return (
        <AuthenticatedLayout>
            <Head title='Medications' />
            <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-800">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Medications</h1>
                        <Link
                            href="/medications/create"
                            className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                        >
                            <PlusCircle size={18} />
                            <span>Add Medication</span>
                        </Link>
                    </div>

                    {canNotify && medications.some(m => m.is_expiring) && (
                        <div className="flex items-center gap-3 p-4 mb-6 text-red-800 bg-red-100 border border-red-200 rounded-lg dark:text-red-200 dark:bg-red-900/50 dark:border-red-800">
                            <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
                            <span className="font-medium">Some medications are expiring within 3 days!</span>
                        </div>
                    )}

                    <div className="mt-6 overflow-hidden bg-white rounded-lg shadow dark:bg-gray-700">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="text-left bg-gray-100 dark:bg-gray-600">
                                    <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase dark:text-gray-300">Name</th>
                                    <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase dark:text-gray-300">Type</th>
                                    <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase dark:text-gray-300">Category</th>
                                    <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase dark:text-gray-300">End Date</th>
                                    <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase dark:text-gray-300">Supplier</th>
                                    <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase dark:text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                {medications.map(med => (
                                    <tr key={med.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                        <td className="px-4 py-4 text-gray-800 dark:text-white">{med.name}</td>
                                        <td className="px-4 py-4 text-gray-800 dark:text-white">{med.type}</td>
                                        <td className="px-4 py-4 text-gray-800 dark:text-white">{med.category}</td>
                                        <td className="px-4 py-4 text-gray-800 dark:text-white">
                                            <div className="flex items-center">
                                                <span>{med.end_date}</span>
                                                {med.is_expiring && (
                                                    <div className="flex items-center gap-1 px-2 py-1 ml-2 text-xs text-red-700 bg-red-100 rounded-full dark:bg-red-900/50 dark:text-red-300">
                                                        <Clock size={14} />
                                                        <span>Expiring Soon</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-gray-800 dark:text-white">{med.supplier?.name || 'N/A'}</td>
                                        <td className="flex items-center px-4 py-4 space-x-3">
                                            <Link 
                                                href={`/medications/${med.id}/edit`} 
                                                className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                <Edit size={18} className="mr-1" />
                                                <span>Edit</span>
                                            </Link>
                                            <Link
                                                method="delete"
                                                href={`/medications/${med.id}`}
                                                as="button"
                                                className="flex items-center text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <Trash2 size={18} className="mr-1" />
                                                <span>Delete</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {medications.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center">
                                                <AlertCircle size={40} className="mb-2 opacity-40" />
                                                <p>No medications found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}