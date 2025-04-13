import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative min-h-dvh grid lg:grid-cols-2">
            {/* Left Panel - Hidden on mobile */}
            <div className="bg-muted relative hidden lg:flex flex-col p-12 text-white dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                {/* Logo and Brand */}
                <Link href={route('home')} className="relative z-20 flex items-center text-xl font-semibold">
                    <AppLogoIcon className="mr-3 size-10 fill-current text-white" />
                    {name}
                </Link>
                {/* Quote Section */}
                {quote && (
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-3">
                            <p className="text-xl font-light italic leading-relaxed">
                                &ldquo;{quote.message}&rdquo;
                            </p>
                            <footer className="text-sm font-medium text-neutral-200">
                                — {quote.author}
                            </footer>
                        </blockquote>
                    </div>
                )}
            </div>

            {/* Right Panel - Content */}
            <div className="flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-[400px] space-y-8">
                    {/* Mobile Logo */}
                    <Link 
                        href={route('home')} 
                        className="relative z-20 flex items-center justify-center lg:hidden mb-8"
                    >
                        <AppLogoIcon className="h-12 fill-current text-black sm:h-14" />
                    </Link>
                    
                    {/* Header Section */}
                    <div className="flex flex-col items-start gap-3 text-left sm:items-center sm:text-center">
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        <p className="text-muted-foreground text-base text-balance leading-relaxed">
                            {description}
                        </p>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
