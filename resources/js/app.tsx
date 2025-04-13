import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// --- Start Echo Configuration ---

(window as any).Pusher = Pusher; // TypeScript fix for Pusher

// Type checking for environment variables
const reverbAppKey = import.meta.env.VITE_REVERB_APP_KEY;
const reverbHost = import.meta.env.VITE_REVERB_HOST;
const reverbPort = parseInt(import.meta.env.VITE_REVERB_PORT || '8080', 10);
const reverbScheme = import.meta.env.VITE_REVERB_SCHEME || 'http';

// Initialize Echo only if environment variables are present
let AppEcho: Echo | null = null;

try {
    if (!reverbAppKey || !reverbHost) {
        console.warn('Reverb environment variables are not set. Real-time features will be disabled.');
    } else {
        AppEcho = new Echo({
            broadcaster: 'reverb',
            key: reverbAppKey,
            wsHost: reverbHost,
            wsPort: reverbPort,
            wssPort: reverbPort,
            forceTLS: reverbScheme === 'https',
            enabledTransports: ['ws', 'wss'],
            authEndpoint: '/broadcasting/auth',
        });
    }
} catch (error) {
    console.error('Failed to initialize Echo:', error);
}

// Export the instance for use in other components
export { AppEcho };
// --- End Echo Configuration ---

const appName = import.meta.env.VITE_APP_NAME || 'MediTrack';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
