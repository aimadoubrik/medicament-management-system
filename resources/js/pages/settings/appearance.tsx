import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { useIntl } from 'react-intl';

export default function Appearance() {

    // --- Internationalization (i18n) Setup ---
    const intl = useIntl();
    const appearanceTitle = intl.formatMessage({
        id: 'pages.settings.appearance.title',
        defaultMessage: 'Appearance settings',
    });
    const headTitle = intl.formatMessage({
        id: 'pages.settings.appearance.head_title',
        defaultMessage: 'Appearance settings',
    });
    const appearanceDescription = intl.formatMessage({
        id: 'pages.settings.appearance.description',
        defaultMessage: 'Update your account\'s appearance settingss',
    });
    // --- End of Internationalization (i18n) Setup ---

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: appearanceTitle,
            href: '/settings/appearance',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={headTitle} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={appearanceTitle} description={appearanceDescription} />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
