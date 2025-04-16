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
        <div className="from-background to-background/95 flex min-h-svh items-center justify-center bg-gradient-to-b p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg md:p-8 dark:bg-gray-800">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center space-y-4">
                        <Link href={route('home')} className="group transition-transform hover:scale-105">
                            <div className="bg-primary/5 flex items-center justify-center rounded-full p-2">
                                <AppLogoIcon className="text-primary size-10 fill-current transition-colors dark:text-white" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-3 text-center">
                            <h1 className="text-foreground text-2xl font-semibold tracking-tight">{title}</h1>
                            <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">{description}</p>
                        </div>
                    </div>

                    <div className="bg-background/50 rounded-lg p-4 md:p-6 dark:bg-gray-700/50">{children}</div>
                </div>
            </div>
        </div>
    );
}
