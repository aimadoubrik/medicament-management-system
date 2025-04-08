import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { useForm, Link, usePage, Head } from '@inertiajs/react'
import { 
  Save, 
  X, 
  Pill, 
  CalendarClock, 
  Building,
  Archive,
  Tag,
  FileText,
  ArrowLeft
} from 'lucide-react'

export default function Create() {
    const { suppliers } = usePage().props

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: '',
        category: '',
        reason: '',
        start_date: '',
        end_date: '',
        supplier_id: '',
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        post('/medications')
    }

    return (
        <AuthenticatedLayout>
            <Head title='Add Medication' />
            <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 mb-6">
                        <Link href="/medications" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Add Medication</h1>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="overflow-hidden bg-white rounded-lg shadow dark:bg-gray-700">
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Pill size={16} />
                                    <span>Medication Name</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter medication name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <Archive size={16} />
                                        <span>Type</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-600 dark:text-white"
                                        placeholder="Tablet, Liquid, etc."
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                    />
                                    {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type}</p>}
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <Tag size={16} />
                                        <span>Category</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-600 dark:text-white"
                                        placeholder="Antibiotic, Painkiller, etc."
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                    />
                                    {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <FileText size={16} />
                                    <span>Reason</span>
                                </label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-600 dark:text-white"
                                    placeholder="Describe the reason for this medication"
                                    rows="3"
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                />
                                {errors.reason && <p className="mt-1 text-sm text-red-500">{errors.reason}</p>}
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <CalendarClock size={16} />
                                        <span>Start Date</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-600 dark:text-white"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                    />
                                    {errors.start_date && <p className="mt-1 text-sm text-red-500">{errors.start_date}</p>}
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <CalendarClock size={16} />
                                        <span>End Date</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-600 dark:text-white"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                    />
                                    {errors.end_date && <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Building size={16} />
                                    <span>Supplier</span>
                                </label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-600 dark:text-white"
                                    value={data.supplier_id}
                                    onChange={(e) => setData('supplier_id', e.target.value)}
                                >
                                    <option value="">Select supplier</option>
                                    {suppliers.map(supplier => (
                                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                    ))}
                                </select>
                                {errors.supplier_id && <p className="mt-1 text-sm text-red-500">{errors.supplier_id}</p>}
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
                            <Link 
                                href="/medications" 
                                className="flex items-center gap-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-700"
                            >
                                <X size={16} />
                                <span>Cancel</span>
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-1 px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
                            >
                                <Save size={16} />
                                <span>Save Medication</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}