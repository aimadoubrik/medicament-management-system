import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="min-h-svh bg-gradient-to-b from-background to-background/95 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center space-y-4">
                        <Link 
                            href={route('home')} 
                            className="group transition-transform hover:scale-105"
                        >
                            <div className="flex items-center justify-center p-2 rounded-full bg-primary/5">
                                <AppLogoIcon className="size-10 fill-current text-primary dark:text-white transition-colors" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="text-center space-y-3">
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                {title}
                            </h1>
                            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                                {description}
                            </p>
                        </div>
                    </div>
                    
                    <div className="bg-background/50 dark:bg-gray-700/50 rounded-lg p-4 md:p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
