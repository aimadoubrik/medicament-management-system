import React from 'react';
import { Link, router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function UserIndex({ users, roles }: { users: Array<{ id: number; name: string; email: string; role_id: number; }>; roles: Array<{ id: number; name: string; }> }) {
    const handleRoleChange = (userId: number, roleId: number) => {
        router.post(`/users/${userId}/role`, { role_id: roleId }, {
            preserveState: true,
            onSuccess: () => {
                alert('Role updated successfully!');
            },
        });
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-gray-100 p-6">
                <h1 className="text-3xl font-bold mb-6">Users</h1>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">Name</th>
                                <th className="px-6 py-3 text-left">Email</th>
                                <th className="px-6 py-3 text-left">Role</th>
                                <th className="px-6 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-t">
                                    <td className="px-6 py-4">{user.name}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.role_id}
                                            onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))}
                                            className="border rounded px-2 py-1"
                                        >
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        
                                        <Link
                                            href={`/users/${user.id}`}
                                            method="delete"
                                            as="button"
                                            className="text-red-500 hover:underline"
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
        </AppLayout>
    );
}