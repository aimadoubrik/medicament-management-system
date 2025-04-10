import { Head, Link } from '@inertiajs/react';
import { HandHeart, ChevronRight, ShieldCheck, Package, Clock, Search, LogInIcon } from 'lucide-react';

function welcome({ auth }) {
    return (
        <>
            <Head title="Bienvenue" />
            <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
                {/* Effet de fond */}
                <div
                    className="absolute"
                    style={{
                        content: '',
                        position: 'absolute',
                        top: '-150px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '600px',
                        height: '700px',
                        background: 'radial-gradient(circle, rgba(56, 139, 253, 0.15) 30%, rgba(13, 17, 23, 0) 70%)',
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                ></div>

                {/* Barre de navigation */}
                <nav className="fixed top-0 left-0 right-0 z-50 w-full shadow-sm backdrop-blur-sm dark:bg-gray-900/90 dark:border-gray-800">
                    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <div className="flex items-center">
                                    <h1 className="ml-3 text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text dark:from-blue-400 dark:to-indigo-400 md:text-2xl md:ml-4">
                                        MediTrack
                                    </h1>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 md:space-x-6">

                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                    >
                                        Tableau de bord
                                    </Link>
                                ) : (

                                    <Link
                                        href={route('login')}
                                        className="flex items-center px-4 py-2 text-white transition duration-150 ease-in-out rounded-md shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600"
                                    >
                                        <LogInIcon className="w-5 h-5 text-white" />
                                        <span className="ml-2 font-semibold">Connexion</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Section Héro */}
                <div className="flex items-center justify-center flex-grow pt-24">
                    <div className="container px-4 py-16 mx-auto max-w-7xl sm:py-24">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-block mb-4 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium md:mb-6 md:text-xl">
                                Solutions de santé
                            </div>
                            <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 dark:text-white sm:mb-8 sm:text-5xl md:text-6xl">
                                Rationalisez votre gestion d'inventaire de <span className="text-blue-600 dark:text-blue-400">médicaments</span>
                            </h1>
                            <p className="max-w-2xl mx-auto mb-8 text-lg text-gray-600 dark:text-gray-300 sm:mb-12 sm:text-xl md:text-2xl">
                                Une solution complète conçue pour les pharmacies et les établissements de santé afin de suivre, gérer et optimiser efficacement l'inventaire des médicaments.
                            </p>
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Link
                                    href={route('login')}
                                    className="flex items-center justify-center w-full px-8 py-3 font-medium text-white transition-all rounded-full shadow-md sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg group"
                                >
                                    Commencer
                                    <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <button className="flex items-center justify-center w-full gap-2 px-8 py-3 font-medium text-gray-700 transition-all bg-white border border-gray-200 rounded-full shadow-sm sm:w-auto dark:text-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <HandHeart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    Soutenez-nous
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Caractéristiques */}
                <div className="py-16 bg-white dark:bg-gray-800">
                    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Caractéristiques clés</h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Tout ce dont vous avez besoin pour gérer efficacement votre inventaire de médicaments</p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div className="p-6 shadow-sm bg-blue-50 dark:bg-gray-700 rounded-xl">
                                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-full dark:bg-blue-900/50">
                                    <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Suivi sécurisé</h3>
                                <p className="text-gray-600 dark:text-gray-300">Le cryptage de bout en bout garantit que vos données d'inventaire restent sécurisées et conformes.</p>
                            </div>

                            <div className="p-6 shadow-sm bg-blue-50 dark:bg-gray-700 rounded-xl">
                                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-full dark:bg-blue-900/50">
                                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Gestion des stocks</h3>
                                <p className="text-gray-600 dark:text-gray-300">Alertes automatisées pour les stocks faibles et les dates d'expiration afin de maintenir des niveaux d'inventaire optimaux.</p>
                            </div>

                            <div className="p-6 shadow-sm bg-blue-50 dark:bg-gray-700 rounded-xl">
                                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-full dark:bg-blue-900/50">
                                    <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Recherche facile</h3>
                                <p className="text-gray-600 dark:text-gray-300">Trouvez rapidement des médicaments grâce à nos puissantes capacités de recherche et de filtrage.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pied de page */}
                <footer className="py-8 border-t border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
                    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-center md:flex-row">
                            <div className="flex items-center mb-4 md:mb-0">
                                <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">MediTrack © {new Date().getFullYear()}</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

export default welcome;

