import LanguageToggleTab from '@/components/language-tabs';
import { Head } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { useIntl } from 'react-intl';

export default function Preferences() {
    // --- Internationalization (i18n) Setup ---
    const intl = useIntl();

    const preferencesTitle = intl.formatMessage({
        id: 'pages.settings.preferences.title',
        defaultMessage: 'Preferences settings',
    });

    const preferencesDescription = intl.formatMessage({
        id: 'pages.settings.preferences.description',
        defaultMessage: 'Manage your application preferences',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: preferencesTitle,
            href: '/settings/preferences',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={preferencesTitle} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={preferencesTitle} description={preferencesDescription} />
                </div>
                <LanguageToggleTab />
            </SettingsLayout>
        </AppLayout>
    );
}
