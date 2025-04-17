import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { ChevronRight, Lock, Palette, Settings as SettingsIcon, User } from 'lucide-react';
import { type PropsWithChildren } from 'react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: '/settings/profile',
        icon: User,
    },
    {
        title: 'Password',
        href: '/settings/password',
        icon: Lock,
    },
    {
        title: 'Appearance',
        href: '/settings/appearance',
        icon: Palette,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    // Client-side only rendering
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <div className="container px-4 py-8 md:px-6">
            <div className="mb-8 flex items-center gap-2">
                <SettingsIcon className="text-muted-foreground size-5" />
                <Heading title="Settings" description="Manage your profile and account settings" />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                <Card className="border-muted h-fit shadow-sm lg:col-span-1">
                    <CardContent className="p-0">
                        <nav className="flex flex-col">
                            {sidebarNavItems.map((item, index) => {
                                const isActive = currentPath === item.href;
                                const Icon = item.icon;

                                return (
                                    <div key={`${item.href}-${index}`} className="relative">
                                        {isActive && <div className="bg-primary absolute top-0 bottom-0 left-0 w-1" />}
                                        <Button
                                            variant={isActive ? 'default' : 'ghost'}
                                            asChild
                                            className={cn(
                                                'h-auto w-full justify-start rounded-none border-0 px-4 py-3',
                                                isActive ? 'bg-primary/10 text-primary hover:bg-primary/15' : 'hover:bg-muted',
                                            )}
                                        >
                                            <Link href={item.href} prefetch className="flex items-center gap-3">
                                                {Icon && <Icon size={16} className={cn(isActive ? 'text-primary' : 'text-muted-foreground')} />}
                                                <span>{item.title}</span>
                                                {isActive && <ChevronRight size={16} className="text-primary ml-auto" />}
                                            </Link>
                                        </Button>
                                        {index < sidebarNavItems.length - 1 && <Separator />}
                                    </div>
                                );
                            })}
                        </nav>
                    </CardContent>
                </Card>

                <div className="lg:col-span-3">
                    <Card className="shadow-sm">
                        <CardContent className="p-6 md:p-8">
                            <section className="max-w-3xl space-y-8">{children}</section>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
