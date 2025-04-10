import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';
import {
    AlertTriangle,
    PackageOpen,
    AlertCircle,
    TrendingUp,
    Calendar,
    Activity,
    Users
} from 'lucide-react';

export default function Dashboard() {
    const [stats] = useState({
        totalMedicaments: 248,
        lowStock: 12,
        expiringItems: 5
    });

    const [recentActivity] = useState([
        { id: 1, action: "Mise à jour du stock", item: "Paracetamol 500mg", quantity: "+150", date: "2025-04-05", status: "terminé" },
        { id: 2, action: "Distribué", item: "Amoxicillin 250mg", quantity: "-35", date: "2025-04-05", status: "terminé" },
        { id: 3, action: "Notification d'expiration", item: "Vitamine C 1000mg", quantity: "45", date: "2025-04-03", status: "avertissement" }
    ]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-gray-100">
                            Tableau de bord
                            <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                                (Données aléatoires)
                            </span>
                        </h1>
                    </div>
                    <div className="flex justify-end">
                        <PrimaryButton>
                            <AlertTriangle size={16} className="mr-2" />
                            Ajouter Médicament
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title="Tableau de bord" />

            <div className="py-6">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Section de Bienvenue */}
                    <div className="p-6 mb-6 rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-blue-700">
                        <h3 className="mb-2 text-xl font-semibold text-white">Bienvenue sur MediTrack</h3>
                        <p className="text-blue-100">
                            Votre système complet de gestion de l'inventaire des médicaments.
                        </p>
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                title: 'Total Médicaments',
                                value: stats.totalMedicaments,
                                icon: <AlertTriangle size={20} className="text-blue-600 dark:text-blue-300" />,
                                bg: 'bg-blue-100 dark:bg-blue-900'
                            },
                            {
                                title: 'Articles en Stock Faible',
                                value: stats.lowStock,
                                icon: <AlertCircle size={20} className="text-amber-600 dark:text-amber-300" />,
                                bg: 'bg-amber-100 dark:bg-amber-900'
                            },
                            {
                                title: 'Expiration Prochaine',
                                value: stats.expiringItems,
                                icon: <Calendar size={20} className="text-red-600 dark:text-red-300" />,
                                bg: 'bg-red-100 dark:bg-red-900'
                            }
                        ].map((card, idx) => (
                            <div key={idx} className="flex items-center p-5 bg-white rounded-lg shadow-md dark:bg-gray-800 hover:shadow-lg">
                                <div className={`p-3 rounded-full ${card.bg}`}>
                                    {card.icon}
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                                    <h4 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{card.value}</h4>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Grille de Contenu */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Actions Rapides */}
                        <div className="bg-white rounded-lg shadow-md dark:bg-gray-800">
                            <div className="px-6 py-4 border-b dark:border-gray-700">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Actions Rapides</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3">
                                {[
                                    { icon: <AlertTriangle size={24} />, label: 'Voir Médicaments' },
                                    { icon: <PackageOpen size={24} />, label: 'Voir Stock' },
                                    { icon: <TrendingUp size={24} />, label: 'Rapports' },
                                    { icon: <Users size={24} />, label: 'Fournisseurs' },
                                    { icon: <Calendar size={24} />, label: 'Dates d\'Expiration' },
                                ].map((action, i) => (
                                    <Link href="#" key={i}>
                                        <div className="flex flex-col items-center p-4 text-center transition border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-700">
                                            <div className="mb-2 text-blue-600 dark:text-blue-400">{action.icon}</div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{action.label}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Activité Récente */}
                        <div className="bg-white rounded-lg shadow-md lg:col-span-2 dark:bg-gray-800">
                            <div className="px-6 py-4 border-b dark:border-gray-700">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Activité Récente</h3>
                            </div>
                            <div className="divide-y dark:divide-gray-700">
                                {recentActivity.map((a) => (
                                    <div key={a.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <div className="flex items-center">
                                            <Activity size={18} className={`
                        ${a.status === 'terminé' ? 'text-green-500' : ''}
                        ${a.status === 'avertissement' ? 'text-amber-500' : ''}
                      `} />
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{a.action}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{a.item} • {a.date}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5
                      ${a.quantity.startsWith('+') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                      ${a.quantity.startsWith('-') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                      ${!a.quantity.startsWith('+') && !a.quantity.startsWith('-') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                    `}>
                                            {a.quantity}
                                        </span>
                                    </div>
                                ))}
                                <div className="p-4 text-center">
                                    <Link href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                                        Voir Toute l'Activité
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Alertes */}
                    <div className="mt-6 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
                        <div className="px-6 py-4 border-b dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Alertes & Notifications</h3>
                        </div>
                        <div className="px-6 pb-6 space-y-4">
                            <div className="flex p-4 rounded-lg bg-amber-50 dark:bg-amber-900 dark:bg-opacity-30">
                                <AlertCircle size={20} className="text-amber-700 dark:text-amber-400" />
                                <div className="ml-3">
                                    <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Alerte de Stock Faible</h4>
                                    <p className="text-sm text-amber-700 dark:text-amber-400">
                                        12 médicaments sont en rupture de stock.
                                    </p>
                                    <Link href="#" className="text-sm font-medium underline text-amber-800 dark:text-amber-300">
                                        Voir Articles en Stock Faible
                                    </Link>
                                </div>
                            </div>

                            <div className="flex p-4 rounded-lg bg-red-50 dark:bg-red-900 dark:bg-opacity-30">
                                <Calendar size={20} className="text-red-700 dark:text-red-400" />
                                <div className="ml-3">
                                    <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Alerte d'Expiration</h4>
                                    <p className="text-sm text-red-700 dark:text-red-400">
                                        5 médicaments expirent dans les 30 prochains jours.
                                    </p>
                                    <Link href="#" className="text-sm font-medium text-red-800 underline dark:text-red-300">
                                        Voir Articles Expirants
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

