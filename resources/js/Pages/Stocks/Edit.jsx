import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { useForm, Link, usePage } from '@inertiajs/react'

export default function Edit({ stock }) {
    const { medications } = usePage().props

    const { data, setData, put, processing, errors } = useForm({
        medication_id: stock.medication_id,
        quantity: stock.quantity,
        start_time: stock.start_time,
        end_time: stock.end_time,
        notes: stock.notes,
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        put(`/stocks/${stock.id}`)
    }

    return (
        <AuthenticatedLayout>
            <h1 className="mb-4 text-2xl font-bold">Edit Stock</h1>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white rounded shadow">
                <div>
                    <label className="block">Medication</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={data.medication_id}
                        onChange={(e) => setData('medication_id', e.target.value)}
                    >
                        <option value="">Select</option>
                        {medications.map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                    {errors.medication_id && <p className="text-sm text-red-500">{errors.medication_id}</p>}
                </div>

                <div>
                    <label className="block">Quantity</label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={data.quantity}
                        onChange={(e) => setData('quantity', e.target.value)}
                    />
                    {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block">Start Time</label>
                        <input
                            type="datetime-local"
                            className="w-full p-2 border rounded"
                            value={data.start_time}
                            onChange={(e) => setData('start_time', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block">End Time</label>
                        <input
                            type="datetime-local"
                            className="w-full p-2 border rounded"
                            value={data.end_time}
                            onChange={(e) => setData('end_time', e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block">Notes</label>
                    <textarea
                        className="w-full p-2 border rounded"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                    />
                </div>

                <div className="flex justify-between">
                    <Link href="/stocks" className="text-gray-500">Cancel</Link>
                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-blue-600 rounded"
                        disabled={processing}
                    >
                        Save
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    )
}

