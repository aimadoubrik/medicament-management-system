import AppLogoIcon from '@/components/app-logo-icon';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { type PropsWithChildren } from 'react';

export default function AuthCardLayout({
    children,
    title,
    description,
    footerContent,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
    footerContent?: React.ReactNode;
}>) {
    return (
        <div className="from-muted/50 to-muted/80 flex min-h-svh items-center justify-center bg-gradient-to-b p-4 sm:p-6 md:p-8">
            <div className="mx-auto w-full max-w-lg space-y-6">
                <div className="flex items-center justify-between">
                    <Link href={route('home')} className="text-muted-foreground hover:text-primary group flex items-center gap-2 transition-colors">
                        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                        <span className="text-sm font-medium">Back to home</span>
                    </Link>

                    <Link
                        href={route('home')}
                        className="focus-visible:ring-ring flex items-center justify-center gap-3 rounded-lg p-1 transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                        <div className="bg-primary/10 rounded-full p-2 shadow-sm">
                            <AppLogoIcon className="text-primary size-8 fill-current" />
                        </div>
                    </Link>
                </div>

                <Card className="border-t-primary bg-card/95 rounded-xl border-t-4 shadow-md backdrop-blur-sm">
                    <CardHeader className="space-y-2 px-8 pt-8 pb-4">
                        <div className="bg-primary/10 mx-auto mb-4 w-fit rounded-full p-3">
                            <ShieldCheck className="text-primary size-6" />
                        </div>
                        <CardTitle className="text-center text-2xl font-bold tracking-tight">{title}</CardTitle>
                        {description && <CardDescription className="text-muted-foreground text-center">{description}</CardDescription>}
                    </CardHeader>

                    <CardContent className="px-8 py-6">
                        <div className="mx-auto w-full max-w-sm space-y-4">{children}</div>
                    </CardContent>

                    {footerContent && (
                        <CardFooter className="bg-muted/30 flex flex-col items-center justify-center gap-2 rounded-b-xl border-t px-8 py-4 sm:flex-row">
                            {footerContent}
                        </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    );
}
