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

if (!reverbAppKey || !reverbHost) {
    console.error('Reverb environment variables (VITE_REVERB_APP_KEY, VITE_REVERB_HOST) are not set.');
    // You might want to throw an error or handle this case appropriately
}

// Instantiate Echo
const echoInstance = new Echo({
    broadcaster: 'reverb',
    key: reverbAppKey,
    wsHost: reverbHost,
    wsPort: reverbPort,
    wssPort: reverbPort, // Use same port for secure connections
    forceTLS: reverbScheme === 'https',
    enabledTransports: ['ws', 'wss'], // Enable WebSocket transports
    // You might need to explicitly type Pusher if Echo doesn't infer it well
    // client: new Pusher(reverbAppKey, { ... pusher options ... })
    authEndpoint: '/broadcasting/auth', // For private/presence channels
});

// Export the instance for use in other components
export const AppEcho = echoInstance;
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
