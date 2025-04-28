import '../css/app.css';
import './echo';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { IntlProvider } from 'react-intl';
import { flattenMessages } from '@/lib/utils';

const appName = import.meta.env.VITE_APP_NAME || 'MediTrack';



createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // --- Get locale and messages from Inertia props ---
        const initialPage = props.initialPage;
        const locale = initialPage.props.locale as string || 'en'; // Type assertion and fallback
        const messages = initialPage.props.messages as Record<string, string> || {}; // Type assertion and fallback

        // --- Flatten messages if they are nested ---
        const flattenedMessages = flattenMessages(messages);

        root.render(
            <IntlProvider
                key={locale}
                locale={locale}
                messages={flattenedMessages}
                defaultLocale="en"
                onError={
                    (err) => {
                        if (err.code === 'MISSING_TRANSLATION') {
                            console.warn('Missing translation:', err.message);
                            return; // Don't throw for missing translations
                        }
                        console.error(err);
                    }
                }
            >
                <App {...props} />
            </IntlProvider >
        );
    },
    progress: {
        color: 'var(--primary)',
    },
});

// This will set light / dark mode on load...
initializeTheme();
