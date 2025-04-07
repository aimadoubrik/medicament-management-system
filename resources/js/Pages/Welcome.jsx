import { Head, Link } from '@inertiajs/react';
import { HandHeart, ChevronRight, ShieldCheck, Package, Clock, Search } from 'lucide-react';

function welcome({ auth }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
                {/* Navigation Bar */}
                <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-100 shadow-sm bg-white/90 backdrop-blur-sm dark:bg-gray-900/90 dark:border-gray-800">
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
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="flex items-center justify-center flex-grow pt-24">
                    <div className="container px-4 py-16 mx-auto max-w-7xl sm:py-24">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-block mb-4 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium md:mb-6 md:text-xl">
                                Healthcare Solutions
                            </div>
                            <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 dark:text-white sm:mb-8 sm:text-5xl md:text-6xl">
                                Streamline Your <span className="text-blue-600 dark:text-blue-400">Medicament</span> Inventory Management
                            </h1>
                            <p className="max-w-2xl mx-auto mb-8 text-lg text-gray-600 dark:text-gray-300 sm:mb-12 sm:text-xl md:text-2xl">
                                A comprehensive solution designed for pharmacies and healthcare facilities to efficiently track, manage, and optimize medication inventory.
                            </p>
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Link
                                    to="/login"
                                    className="flex items-center justify-center w-full px-8 py-3 font-medium text-white transition-all rounded-full shadow-md sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg group"
                                >
                                    Get Started
                                    <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <button className="flex items-center justify-center w-full gap-2 px-8 py-3 font-medium text-gray-700 transition-all bg-white border border-gray-200 rounded-full shadow-sm sm:w-auto dark:text-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <HandHeart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    Support Us
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="py-16 bg-white dark:bg-gray-800">
                    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Key Features</h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Everything you need to manage your medicament inventory effectively</p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div className="p-6 shadow-sm bg-blue-50 dark:bg-gray-700 rounded-xl">
                                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-full dark:bg-blue-900/50">
                                    <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Secure Tracking</h3>
                                <p className="text-gray-600 dark:text-gray-300">End-to-end encryption ensures your inventory data remains secure and compliant.</p>
                            </div>

                            <div className="p-6 shadow-sm bg-blue-50 dark:bg-gray-700 rounded-xl">
                                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-full dark:bg-blue-900/50">
                                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Stock Management</h3>
                                <p className="text-gray-600 dark:text-gray-300">Automated alerts for low stock and expiration dates to maintain optimal inventory levels.</p>
                            </div>

                            <div className="p-6 shadow-sm bg-blue-50 dark:bg-gray-700 rounded-xl">
                                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-full dark:bg-blue-900/50">
                                    <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Easy Search</h3>
                                <p className="text-gray-600 dark:text-gray-300">Quickly find medicaments with our powerful search and filtering capabilities.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
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
