import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { useForm, Link, usePage } from '@inertiajs/react'

export default function Edit({ supplier }) {
    const { data, setData, put, processing, errors } = useForm({
        name: supplier.name || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        put(`/suppliers/${supplier.id}`)
    }

    return (
        <AuthenticatedLayout>
            <h1 className="mb-4 text-2xl font-bold">Edit Supplier</h1>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white rounded shadow">
                <div>
                    <label className="block font-medium">Name</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div>
                    <label className="block font-medium">Email</label>
                    <input
                        type="email"
                        className="w-full p-2 border rounded"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div>
                    <label className="block font-medium">Phone</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>

                <div>
                    <label className="block font-medium">Address</label>
                    <textarea
                        className="w-full p-2 border rounded"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                    />
                    {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                </div>

                <div className="flex justify-between">
                    <Link href="/suppliers" className="text-gray-600 hover:underline">Cancel</Link>
                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-green-600 rounded disabled:opacity-50"
                        disabled={processing}
                    >
                        Update
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    )
}

