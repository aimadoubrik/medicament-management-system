import React from 'react'
import { useForm, Link, usePage } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        post('/suppliers')
    }

    return (
        <AuthenticatedLayout>
            <h1 className="mb-4 text-2xl font-bold dark:text-white">Add Supplier</h1>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white rounded shadow dark:bg-gray-800">
                <div>
                    <label className="block font-medium dark:text-white">Name</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    {errors.name && <p className="text-sm text-red-500 dark:text-red-400">{errors.name}</p>}
                </div>

                <div>
                    <label className="block font-medium dark:text-white">Email</label>
                    <input
                        type="email"
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    {errors.email && <p className="text-sm text-red-500 dark:text-red-400">{errors.email}</p>}
                </div>

                <div>
                    <label className="block font-medium dark:text-white">Phone</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                    />
                    {errors.phone && <p className="text-sm text-red-500 dark:text-red-400">{errors.phone}</p>}
                </div>

                <div>
                    <label className="block font-medium dark:text-white">Address</label>
                    <textarea
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                    />
                    {errors.address && <p className="text-sm text-red-500 dark:text-red-400">{errors.address}</p>}
                </div>

                <div className="flex justify-between">
                    <Link href="/suppliers" className="text-gray-600 hover:underline dark:text-gray-300">Cancel</Link>
                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-blue-600 rounded disabled:opacity-50 dark:bg-blue-500"
                        disabled={processing}
                    >
                        Save
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    )
}

