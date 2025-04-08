import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  ChevronDown,
  ChevronRight, 
  Home, 
  User, 
  LogOut,
  Settings,
  Bell,
  Search,
  Calendar,
  BarChart3,
  Users,
  FileText,
  Moon,
  Sun,
  Package,
  Settings2,
  BriefcaseMedical
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, text: "New message received", read: false },
        { id: 2, text: "Your report is ready", read: false }
    ]);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    // Handle sidebar collapse for desktop view
    const toggleSidebarCollapse = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
        const enabledDark = storedTheme === 'dark' || (!storedTheme && prefersDark);
    
        setDarkMode(enabledDark);
        if (enabledDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    
    // Handle dark mode toggle
    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            const sidebar = document.getElementById('sidebar');
            if (sidebarOpen && sidebar && !sidebar.contains(event.target) && window.innerWidth < 1024) {
                setSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [sidebarOpen]);

    // Navigation items for sidebar
    const navigationItems = [
        { name: 'Home', href: route('dashboard'), icon: Home, current: route().current('dashboard') },
        { name: 'Medicaments', href: route('medications.index'), icon: BriefcaseMedical, current: false },
        { name: 'Stocks', href: route('stocks.index'), icon: Package, current: false },
        { name: 'Suppliers', href: route('suppliers.index'), icon: Users, current: false },
        { name: 'Settings', href: '#', icon: Settings2, current: false },
    ];

    return (
        <div className={`flex min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
            {/* Sidebar overlay for mobile */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden dark:bg-opacity-50" 
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div 
                id="sidebar"
                className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-all duration-300 ease-in-out dark:bg-gray-800 
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} lg:translate-x-0`}
            >
                {/* Sidebar header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
                    <Link href="/" className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <ApplicationLogo className={`fill-current text-gray-800 dark:text-white ${sidebarCollapsed ? 'h-8 w-8' : 'h-9 w-auto'}`} />
                        {!sidebarCollapsed && <span className="ml-2 text-xl font-semibold dark:text-white">MediTrack</span>}
                    </Link>
                    <div className="flex">
                        <button 
                            onClick={toggleSidebarCollapse} 
                            className="hidden p-1 text-gray-500 rounded hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white lg:block"
                        >
                            <ChevronRight size={20} className={`transform transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                        </button>
                        <button 
                            onClick={() => setSidebarOpen(false)} 
                            className="p-1 text-gray-500 rounded hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white lg:hidden"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Sidebar content */}
                <div className="flex h-[calc(100%-4rem)] flex-col justify-between py-4">
                    <nav className="flex-1 px-2 space-y-1">
                        {/* Search bar in sidebar for desktop */}
                        {!sidebarCollapsed && (
                            <div className="relative px-2 mb-4">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <Search size={16} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full py-2 pl-10 pr-3 text-sm placeholder-gray-400 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        )}

                        {/* Navigation items */}
                        {navigationItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors duration-150 ease-in-out
                                ${item.current 
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:bg-opacity-40 dark:text-blue-300' 
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                            >
                                <item.icon size={20} className={`${sidebarCollapsed ? 'mx-auto' : 'mr-3'} ${item.current ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`} />
                                {!sidebarCollapsed && <span>{item.name}</span>}
                                {sidebarCollapsed && (
                                    <span className="absolute w-auto px-2 py-1 ml-2 text-xs font-medium text-white transition-opacity bg-gray-800 rounded-md shadow opacity-0 left-full min-w-max group-hover:opacity-100 dark:bg-gray-700">
                                        {item.name}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* User profile section */}
                    <div className={`border-t border-gray-200 px-3 pt-4 dark:border-gray-700 ${sidebarCollapsed ? 'text-center' : ''}`}>
                        {!sidebarCollapsed ? (
                            <div className="flex items-center px-2 mb-4">
                                <div className="flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-600">
                                    <div className="flex items-center justify-center w-full h-full text-gray-500 dark:text-gray-400">
                                        <User size={20} />
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center mb-4">
                                <div className="w-10 h-10 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-600">
                                    <div className="flex items-center justify-center w-full h-full text-gray-500 dark:text-gray-400">
                                        <User size={20} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* User action buttons */}
                        <div className="space-y-1">
                            <Link
                                href={route('profile.edit')}
                                className={`flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${sidebarCollapsed ? 'justify-center' : ''}`}
                            >
                                <Settings size={18} className={sidebarCollapsed ? '' : 'mr-3'} />
                                {!sidebarCollapsed && <span>Settings</span>}
                                {sidebarCollapsed && (
                                    <span className="absolute w-auto px-2 py-1 ml-2 text-xs font-medium text-white transition-opacity bg-gray-800 rounded-md shadow opacity-0 left-full min-w-max group-hover:opacity-100 dark:bg-gray-700">
                                        Settings
                                    </span>
                                )}
                            </Link>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className={`flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${sidebarCollapsed ? 'justify-center' : ''}`}
                            >
                                <LogOut size={18} className={sidebarCollapsed ? '' : 'mr-3'} />
                                {!sidebarCollapsed && <span>Log Out</span>}
                                {sidebarCollapsed && (
                                    <span className="absolute w-auto px-2 py-1 ml-2 text-xs font-medium text-white transition-opacity bg-gray-800 rounded-md shadow opacity-0 left-full min-w-max group-hover:opacity-100 dark:bg-gray-700">
                                        Log Out
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className={`flex flex-1 flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                {/* Top navigation */}
                <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Left section: Mobile menu button + Search */}
                            <div className="flex items-center">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:bg-gray-100 hover:text-gray-500 focus:outline-none dark:hover:bg-gray-700 dark:hover:text-gray-300 lg:hidden"
                                >
                                    <Menu size={24} />
                                </button>
                                
                                {/* Search bar - expands when clicked on mobile, always visible on larger screens */}
                                <div className={`relative ml-4 transition-all duration-200 ${searchExpanded ? 'w-full' : 'hidden sm:block sm:w-64'}`}>
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Search size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full py-2 pl-10 pr-3 text-sm placeholder-gray-400 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        onBlur={() => setSearchExpanded(false)}
                                    />
                                </div>
                                
                                <button 
                                    className="inline-flex items-center justify-center p-2 ml-2 text-gray-400 rounded-md hover:bg-gray-100 hover:text-gray-500 focus:outline-none dark:hover:bg-gray-700 dark:hover:text-gray-300 sm:hidden"
                                    onClick={() => setSearchExpanded(!searchExpanded)}
                                >
                                    <Search size={20} />
                                </button>
                            </div>

                            {/* Right section: Actions and user menu */}
                            <div className="flex items-center space-x-1 sm:space-x-3">
                                {/* Dark mode toggle */}
                                <button
                                    onClick={toggleDarkMode}
                                    className="relative inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:bg-gray-100 hover:text-gray-500 focus:outline-none dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                >
                                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                                </button>
                                
                                {/* Notifications */}
                                <div className="relative">
                                    <button
                                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                                        className="relative inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:bg-gray-100 hover:text-gray-500 focus:outline-none dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                    >
                                        <Bell size={20} />
                                        {notifications.some(n => !n.read) && (
                                            <span className="absolute w-2 h-2 bg-red-500 rounded-full right-1 top-1"></span>
                                        )}
                                    </button>
                                    
                                    {notificationsOpen && (
                                        <div className="absolute right-0 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg w-80 ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700">
                                            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notifications</h3>
                                            </div>
                                            {notifications.length > 0 ? (
                                                <div className="overflow-y-auto max-h-60">
                                                    {notifications.map(notification => (
                                                        <div 
                                                            key={notification.id} 
                                                            className="px-4 py-3 border-b border-gray-200 last:border-0 dark:border-gray-700"
                                                        >
                                                            <p className="text-sm text-gray-700 dark:text-gray-300">{notification.text}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="px-4 py-2">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                                                </div>
                                            )}
                                            <div className="px-4 py-2 text-xs font-medium text-center text-blue-600 border-t border-gray-200 dark:border-gray-700 dark:text-blue-400">
                                                <a href="#">View all notifications</a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* User dropdown */}
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <div className="relative overflow-hidden bg-gray-200 rounded-full cursor-pointer dark:bg-gray-600">
                                            <div className="flex items-center justify-center w-8 h-8 text-gray-500 dark:text-gray-400">
                                                <User size={18} />
                                            </div>
                                        </div>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content width="48">
                                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate dark:text-gray-400">{user.email}</p>
                                        </div>
                                        
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link href="#">
                                            Settings
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900 dark:hover:bg-opacity-20"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Page header */}
                {header && (
                    <header className="bg-white shadow dark:bg-gray-800 dark:shadow-gray-900/10">
                        <div className="px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                {/* Main content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 dark:text-gray-200">
                    {children}
                </main>

                {/* Footer */}
                <footer className="py-4 text-sm text-center text-gray-500 border-t border-gray-200 dark:border-gray-700 dark:text-gray-400">
                    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        &copy; {new Date().getFullYear()} MediTrack. All rights reserved.
                    </div>
                </footer>
            </div>
        </div>
    );
}
