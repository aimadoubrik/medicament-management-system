import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

// Define notification data structure based on actual response
export type NotificationData = {
    batch_id: number;
    batch_number: string;
    product_id: number;
    product_name: string;
    expiry_date: string;
    quantity: number | null;
    message: string;
    action_url: string;
};

// Inertia Page Props
export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
        roles: string[]; // Assuming roles are passed if needed
    };
    ziggy: Ziggy; // Assuming ziggy setup
    flash: { // Standard Laravel flash messages
        success?: string;
        error?: string;
        // Add other flash types if used
    };
    // Add other shared props from HandleInertiaRequests
};

// Generic Paginated Response Type from Laravel Resource/Controller
export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}