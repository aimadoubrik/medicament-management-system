import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { useIntl } from 'react-intl';

export default function SettingsLayout({ children }: PropsWithChildren) {
    // --- Internationalization (i18n) Setup ---
    const intl = useIntl();

    const settingsTitle = intl.formatMessage({
        id: 'pages.settings.title',
        defaultMessage: 'Settings',
    });
    const settingsDescription = intl.formatMessage({
        id: 'pages.settings.description',
        defaultMessage: 'Manage your profile and account settings',
    });
    const profileTitle = intl.formatMessage({
        id: 'pages.settings.profile.nav_title',
        defaultMessage: 'Profile',
    });
    const passwordTitle = intl.formatMessage({
        id: 'pages.settings.password.nav_title',
        defaultMessage: 'Password',
    });
    const appearanceTitle = intl.formatMessage({
        id: 'pages.settings.appearance.nav_title',
        defaultMessage: 'Appearance',
    });
    const preferencesTitle = intl.formatMessage({
        id: 'pages.settings.preferences.nav_title',
        defaultMessage: 'Preferences',
    });

    const sidebarNavItems: NavItem[] = [
        {
            title: profileTitle,
            href: '/settings/profile',
            icon: null,
        },
        {
            title: passwordTitle,
            href: '/settings/password',
            icon: null,
        },
        {
            title: appearanceTitle,
            href: '/settings/appearance',
            icon: null,
        },
        {
            title: preferencesTitle,
            href: '/settings/preferences',
            icon: null,
        },
    ];

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <div className="px-4 py-6">
            <Heading title={settingsTitle} description={settingsDescription} />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${item.href}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': currentPath === item.href,
                                })}
                            >
                                <Link href={item.href} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
