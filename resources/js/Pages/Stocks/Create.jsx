import React from 'react'
import { useForm, Link, usePage } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'

export default function Create() {
    const { medications } = usePage().props

    const { data, setData, post, processing, errors } = useForm({
        medication_id: '',
        quantity: '',
        start_time: '',
        end_time: '',
        notes: '',
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        post('/stocks')
    }

    return (
        <AuthenticatedLayout>
            <h1 className="mb-4 text-2xl font-bold dark:text-white">Add Stock</h1>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white rounded shadow dark:bg-gray-800">
                <div>
                    <label className="block dark:text-white">Medication</label>
                    <select
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                        value={data.medication_id}
                        onChange={(e) => setData('medication_id', e.target.value)}
                    >
                        <option value="">Select</option>
                        {medications.map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                    {errors.medication_id && <p className="text-sm text-red-500 dark:text-red-400">{errors.medication_id}</p>}
                </div>

                <div>
                    <label className="block dark:text-white">Quantity</label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                        value={data.quantity}
                        onChange={(e) => setData('quantity', e.target.value)}
                    />
                    {errors.quantity && <p className="text-sm text-red-500 dark:text-red-400">{errors.quantity}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block dark:text-white">Start Time</label>
                        <input
                            type="datetime-local"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                            value={data.start_time}
                            onChange={(e) => setData('start_time', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block dark:text-white">End Time</label>
                        <input
                            type="datetime-local"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                            value={data.end_time}
                            onChange={(e) => setData('end_time', e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block dark:text-white">Notes</label>
                    <textarea
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                    />
                </div>

                <div className="flex justify-between">
                    <Link href="/stocks" className="text-gray-500 dark:text-gray-400">Cancel</Link>
                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-blue-600 rounded dark:bg-blue-500 dark:text-white"
                        disabled={processing}
                    >
                        Save
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    )
}

