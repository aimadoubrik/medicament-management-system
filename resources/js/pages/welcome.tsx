import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>
                <div className="flex w-full items-center justify-center lg:grow">
                    <main className="flex w-full max-w-[335px] flex-col items-center text-center lg:max-w-4xl lg:flex-row lg:items-start lg:text-left">
                        <div className="lg:w-1/2">
                            <h1 className="text-4xl font-bold leading-tight text-[#1b1b18] dark:text-[#EDEDEC]">
                                Welcome to Medicament Management System
                            </h1>
                            <p className="mt-4 text-lg text-[#4A4A46] dark:text-[#A5A5A1]">
                                Simplify your medication management with our intuitive platform.
                            </p>
                            <div className="mt-6 flex flex-col gap-4 lg:flex-row">
                                <Link
                                    href={route('register')}
                                    className="inline-block rounded-md bg-[#1b1b18] px-6 py-3 text-sm font-medium text-white hover:bg-[#33312e] dark:bg-[#EDEDEC] dark:text-[#1b1b18] dark:hover:bg-[#d6d6d4]"
                                >
                                    Get Started
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded-md border border-[#1b1b18] px-6 py-3 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f4] dark:border-[#EDEDEC] dark:text-[#EDEDEC] dark:hover:bg-[#33312e]"
                                >
                                    Log In
                                </Link>
                            </div>
                        </div>
                        <div className="mt-8 lg:mt-0 lg:w-1/2">
                            <img
                                src="https://images.unsplash.com/photo-1581091870620-4f2b8a1c5d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fG1lZGljYXRpb258ZW58MHx8fHwxNjg5NTQyMjA0&ixlib=rb-4.0.3&q=80&w=1080"
                                alt="Hero"
                                className="w-full rounded-lg shadow-lg"
                            />
                        </div>
                    </main>
                </div>
                <footer className="mt-12 text-sm text-[#4A4A46] dark:text-[#A5A5A1]">
                    © {new Date().getFullYear()} Medicament Management System. All rights reserved.
                </footer>
            </div>
        </>
    );
}
