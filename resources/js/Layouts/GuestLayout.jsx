

export default function GuestLayout({ children }) {
    return (
        <div className="flex flex-col items-center min-h-screen pt-6 bg-white dark:bg-gray-900 sm:justify-center sm:pt-0">
            <div className="w-full px-6 py-4 mt-6 overflow-hidden bg-white rounded-lg sm:max-w-md dark:bg-gray-800">
                {children}
            </div>
        </div>
    );
}
