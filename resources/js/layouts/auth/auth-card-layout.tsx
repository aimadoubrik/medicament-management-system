import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { LogIn, ArrowLeft, ShieldCheck } from 'lucide-react';
import { type PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';

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
        <div className="min-h-svh bg-gradient-to-b from-muted/50 to-muted/80 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-lg mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href={route('home')}
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to home</span>
                    </Link>

                    <Link
                        href={route('home')}
                        className="flex items-center justify-center gap-3 transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none rounded-lg p-1"
                    >
                        <div className="bg-primary/10 rounded-full p-2 shadow-sm">
                            <AppLogoIcon className="size-8 fill-current text-primary" />
                        </div>
                    </Link>
                </div>

                <Card className="rounded-xl shadow-md border-t-4 border-t-primary backdrop-blur-sm bg-card/95">
                    <CardHeader className="space-y-2 px-8 pt-8 pb-4">
                        <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full w-fit">
                            <ShieldCheck className="size-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-center">
                            {title}
                        </CardTitle>
                        {description && (
                            <CardDescription className="text-muted-foreground text-center">
                                {description}
                            </CardDescription>
                        )}
                    </CardHeader>

                    <CardContent className="px-8 py-6">
                        <div className="w-full max-w-sm mx-auto space-y-4">
                            {children}
                        </div>
                    </CardContent>

                    {footerContent && (
                        <CardFooter className="px-8 py-4 border-t bg-muted/30 flex flex-col sm:flex-row gap-2 justify-center items-center rounded-b-xl">
                            {footerContent}
                        </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    );
}