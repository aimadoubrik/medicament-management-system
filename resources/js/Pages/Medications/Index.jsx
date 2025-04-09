import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  AlertCircleIcon,
  Download,
  RefreshCw,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  InfoIcon,
  Calendar,
  User,
  Building,
  FileText
} from 'lucide-react';

export default function Index() {
    const { medications, canNotify } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedMedication, setSelectedMedication] = useState(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // Get unique categories for filter
    const categories = ['all', ...new Set(medications.map(med => med.category))];
    
    // Filter medications based on search and category
    const filteredMedications = medications.filter(med => {
        const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             med.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (med.supplier?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = selectedCategory === 'all' || med.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredMedications.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredMedications.length / itemsPerPage);
    
    // Handle pagination
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory]);
    
    // Count expiring medications
    const expiringCount = medications.filter(med => med.is_expiring).length;

    // Handle view medication
    const handleViewMedication = (medication) => {
        setSelectedMedication(medication);
        setShowViewModal(true);
    };

    // Handle delete medication
    const handleDeleteMedication = (medication) => {
        setSelectedMedication(medication);
        setShowDeleteModal(true);
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Medications" />
            <div className="min-h-screen p-4 md:p-6 bg-gray-50 dark:bg-gray-800">
                <div className="mx-auto max-w-7xl">
                    {/* Header Section */}
                    <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between md:mb-8">
                        <div>
                            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800 md:text-3xl dark:text-white">
                                <AlertCircleIcon className="text-blue-600" />
                                <span>Medications</span>
                            </h1>
                            <p className="mt-1 text-sm text-gray-600 md:text-base dark:text-gray-300">Manage your medication inventory</p>
                        </div>
                        
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                                <Download size={16} />
                                <span>Export</span>
                            </button>
                            <Link
                                href="/medications/create"
                                className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800"
                            >
                                <PlusCircle size={16} />
                                <span>Add Medication</span>
                            </Link>
                        </div>
                    </div>

                    {/* Alert Banner */}
                    {canNotify && expiringCount > 0 && (
                        <div className="flex items-center gap-3 p-4 mb-6 text-red-800 bg-red-100 border border-l-4 border-red-200 rounded-lg shadow-sm border-l-red-500 dark:text-red-200 dark:bg-red-900/50 dark:border-red-800">
                            <AlertTriangle size={20} className="flex-shrink-0 text-red-600 dark:text-red-400" />
                            <div>
                                <p className="font-medium">{expiringCount} medication{expiringCount > 1 ? 's are' : ' is'} expiring soon!</p>
                                <p className="mt-1 text-sm text-red-700 dark:text-red-300">Please check the expiration dates and take necessary actions.</p>
                            </div>
                        </div>
                    )}

                    {/* Search and Filter Section */}
                    <div className="flex flex-col gap-4 mb-6 sm:flex-row">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                placeholder="Search medications..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="relative">
                            <button 
                                className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                                onClick={() => setFilterOpen(!filterOpen)}
                            >
                                <Filter size={16} />
                                <span>Filter</span>
                                <ChevronDown size={14} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {filterOpen && (
                                <div className="absolute right-0 z-10 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-700 dark:ring-gray-600">
                                    <div className="p-3">
                                        <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Category</h3>
                                        <div className="space-y-2">
                                            {categories.map(category => (
                                                <div key={category} className="flex items-center">
                                                    <input
                                                        id={`category-${category}`}
                                                        type="radio"
                                                        name="category"
                                                        checked={selectedCategory === category}
                                                        onChange={() => setSelectedCategory(category)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600"
                                                    />
                                                    <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700 capitalize dark:text-gray-200">
                                                        {category}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="flex justify-between pt-3 mt-4 border-t border-gray-200 dark:border-gray-600">
                                            <button 
                                                className="flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                                                onClick={() => {
                                                    setSelectedCategory('all')
                                                    setSearchTerm('')
                                                }}
                                            >
                                                <RefreshCw size={14} />
                                                <span>Reset</span>
                                            </button>
                                            <button 
                                                className="text-sm text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                onClick={() => setFilterOpen(false)}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Medications Table */}
                    <div className="mt-6 overflow-hidden bg-white border border-gray-200 shadow-md rounded-xl dark:bg-gray-700 dark:border-gray-600">
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="text-left border-b border-gray-200 bg-gray-50 dark:bg-gray-600 dark:border-gray-600">
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase dark:text-gray-300">Name</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase dark:text-gray-300">Type</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase dark:text-gray-300">Category</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase dark:text-gray-300">End Date</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase dark:text-gray-300">Supplier</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase dark:text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                    {currentItems.map(med => (
                                        <tr key={med.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white">{med.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{med.type}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900/50 dark:text-blue-300">
                                                    {med.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center">
                                                    <span>{formatDate(med.end_date)}</span>
                                                    {med.is_expiring && (
                                                        <div className="flex items-center gap-1 px-2 py-0.5 ml-2 text-xs font-medium text-red-700 bg-red-100 rounded-full dark:bg-red-900/50 dark:text-red-300">
                                                            <Clock size={12} />
                                                            <span>Expiring</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                {med.supplier?.name || 
                                                <span className="italic text-gray-400 dark:text-gray-500">N/A</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => handleViewMedication(med)} 
                                                        className="flex items-center text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <Link 
                                                        href={`/medications/${med.id}/edit`} 
                                                        className="flex items-center text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        <Edit size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteMedication(med)}
                                                        className="flex items-center text-red-600 transition-colors hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {currentItems.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center">
                                                    <AlertCircle size={40} className="mb-3 opacity-40" />
                                                    <p className="text-lg font-medium">No medications found</p>
                                                    {searchTerm || selectedCategory !== 'all' ? (
                                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                            Try adjusting your search or filter criteria
                                                        </p>
                                                    ) : (
                                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                            Get started by adding your first medication
                                                        </p>
                                                    )}
                                                    
                                                    {searchTerm || selectedCategory !== 'all' ? (
                                                        <button 
                                                            className="flex items-center gap-1 px-4 py-2 mt-4 text-sm text-blue-600 transition-colors rounded-md bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                                            onClick={() => {
                                                                setSearchTerm('')
                                                                setSelectedCategory('all')
                                                            }}
                                                        >
                                                            <RefreshCw size={14} />
                                                            <span>Clear filters</span>
                                                        </button>
                                                    ) : (
                                                        <Link
                                                            href="/medications/create"
                                                            className="flex items-center gap-1 px-4 py-2 mt-4 text-sm text-blue-600 transition-colors rounded-md bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                                        >
                                                            <PlusCircle size={14} />
                                                            <span>Add Medication</span>
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        {filteredMedications.length > 0 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-600 sm:px-6">
                                <div className="flex flex-col gap-4 sm:flex-1 sm:items-center sm:justify-between sm:flex-row">
                                    <div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                                            <span className="font-medium">
                                                {indexOfLastItem > filteredMedications.length
                                                    ? filteredMedications.length
                                                    : indexOfLastItem}
                                            </span>{" "}
                                            of <span className="font-medium">{filteredMedications.length}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="inline-flex -space-x-px rounded-md shadow-sm isolate" aria-label="Pagination">
                                            <button
                                                onClick={() => paginate(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-offset-0 ${
                                                    currentPage === 1
                                                        ? "cursor-not-allowed"
                                                        : "hover:bg-gray-50 dark:hover:bg-gray-600"
                                                }`}
                                            >
                                                <ChevronLeft size={16} />
                                            </button>
                                            
                                            {/* Page Numbers */}
                                            {[...Array(totalPages).keys()].map((number) => {
                                                const pageNumber = number + 1;
                                                // Show only current page and immediate neighbors
                                                if (
                                                    pageNumber === 1 ||
                                                    pageNumber === totalPages ||
                                                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                                ) {
                                                    return (
                                                        <button
                                                            key={pageNumber}
                                                            onClick={() => paginate(pageNumber)}
                                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                                currentPage === pageNumber
                                                                    ? "bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-700"
                                                                    : "text-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                                                            }`}
                                                        >
                                                            {pageNumber}
                                                        </button>
                                                    );
                                                }
                                                
                                                // Show ellipsis for gaps
                                                if (
                                                    (pageNumber === 2 && currentPage > 3) ||
                                                    (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                                                ) {
                                                    return (
                                                        <span
                                                            key={pageNumber}
                                                            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600"
                                                        >
                                                            ...
                                                        </span>
                                                    );
                                                }
                                                
                                                return null;
                                            })}
                                            
                                            <button
                                                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-offset-0 ${
                                                    currentPage === totalPages
                                                        ? "cursor-not-allowed"
                                                        : "hover:bg-gray-50 dark:hover:bg-gray-600"
                                                }`}
                                            >
                                                <ChevronRight size={16} />
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Stats Section */}
                    <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3 md:gap-6 md:mt-8">
                        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600 transition-transform hover:scale-[1.02]">
                            <h3 className="mb-3 text-base font-medium text-gray-700 md:text-lg dark:text-gray-200">Total Medications</h3>
                            <p className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-white">{medications.length}</p>
                        </div>
                        
                        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600 transition-transform hover:scale-[1.02]">
                            <h3 className="mb-3 text-base font-medium text-gray-700 md:text-lg dark:text-gray-200">Expiring Soon</h3>
                            <p className="text-2xl font-bold text-red-600 md:text-3xl dark:text-red-400">{expiringCount}</p>
                        </div>
                        
                        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600 transition-transform hover:scale-[1.02]">
                            <h3 className="mb-3 text-base font-medium text-gray-700 md:text-lg dark:text-gray-200">Categories</h3>
                            <p className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-white">{categories.length - 1}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* View Medication Modal */}
            {showViewModal && selectedMedication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Medication Details</h3>
                            <button 
                                onClick={() => setShowViewModal(false)}
                                className="text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center mb-6">
                                <AlertCircleIcon className="w-12 h-12 mr-4 text-blue-600" />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{selectedMedication.name}</h2>
                                    <div className="flex items-center mt-1">
                                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                            {selectedMedication.type}
                                        </span>
                                        <span className="ml-2 px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                                            {selectedMedication.category}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {selectedMedication.reason && (
                                    <div className="flex items-start">
                                        <FileText size={18} className="text-gray-500 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason</p>
                                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                                {selectedMedication.reason}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex items-start">
                                    <Calendar size={18} className="text-gray-500 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</p>
                                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                                            {formatDate(selectedMedication.start_date)} - {formatDate(selectedMedication.end_date)}
                                            {selectedMedication.is_expiring && (
                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium rounded text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300">
                                                    <Clock size={12} className="mr-1" />
                                                    Expiring Soon
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <Building size={18} className="text-gray-500 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Supplier</p>
                                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                                            {selectedMedication.supplier?.name || 'Not specified'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <User size={18} className="text-gray-500 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Created By</p>
                                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                                            {selectedMedication.created_by?.name || 'Unknown'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 px-6 py-4 border-t rounded-b-lg bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                            >
                                Close
                            </button>
                            <Link
                                href={`/medications/${selectedMedication.id}/edit`}
                                className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-800"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Delete Medication</h3>
                            <button 
                                onClick={() => setShowDeleteModal(false)}
                                className="text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-lg font-medium text-gray-800 dark:text-white">
                                Are you sure you want to delete <span className="font-bold">{selectedMedication.name}</span>?
                            </p>
                            <div className="flex items-center gap-3 mt-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        deleteMedication(selectedMedication.id)
                                        setShowDeleteModal(false)
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-800"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

