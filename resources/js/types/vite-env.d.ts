/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
    readonly VITE_REVERB_APP_KEY: string;
    readonly VITE_REVERB_HOST: string;
    readonly VITE_REVERB_PORT: string; // Store as string, parse in code
    readonly VITE_REVERB_SCHEME: string; // 'http' or 'https'
    // Add other environment variables you use here
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
