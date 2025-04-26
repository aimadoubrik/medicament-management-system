import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// --- Start Echo Configuration ---

declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}
window.Pusher = Pusher;

// Type checking for environment variables
const reverbAppKey = import.meta.env.VITE_REVERB_APP_KEY as string;
const reverbHost = import.meta.env.VITE_REVERB_HOST as string;
const reverbPort = parseInt(import.meta.env.VITE_REVERB_PORT || '8080', 10);
const reverbScheme = import.meta.env.VITE_REVERB_SCHEME || 'http';

// Throw error if essential config is missing
if (!reverbAppKey || !reverbHost) {
    throw new Error('Reverb environment variables (VITE_REVERB_APP_KEY, VITE_REVERB_HOST) are not set.');
}

// Instantiate Echo
const echoInstance = new Echo({
    broadcaster: 'reverb',
    key: reverbAppKey,
    wsHost: reverbHost,
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS: reverbScheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/broadcasting/auth',
});

// Export the instance for use in other components
export const AppEcho = echoInstance;

// --- End Echo Configuration ---