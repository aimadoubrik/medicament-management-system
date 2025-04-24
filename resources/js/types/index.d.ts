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
    role_id: number;
    role: {
        id: number;
        name: string;
        description: string | null;
        created_at: string;
        updated_at: string;
    };
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Role {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

// Define notification data structure based on actual response
export type NotificationData = {
    batch_id: number;
    batch_number: string;
    medicine_id: number;
    medicine_name: string;
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
    flash: {
        // Standard Laravel flash messages
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

export interface NewNotificationEventPayload {
    message: string;
    type: 'info' | 'success' | 'error' | 'warning'; // Use specific types if possible
    userId: number; // Included in the event, though not directly used by sonner here
    // Add any other properties you might broadcast
}

export type Category = {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
};

export type Medicine = {
    id: number;
    name: string;
    generic_name: string | null;
    manufacturer: string | null;
    strength: string | null;
    form: string | null;
    description: string | null;
    category_id: number;
    category: {
        id: number;
        name: string;
        description: string;
        created_at: string;
        updated_at: string;
    };
    requires_prescription: boolean;
    low_stock_threshold: number | null;
    created_at: string;
    updated_at: string;
};

export type Supplier = {
    id: number;
    name: string;
    contact_person: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    created_at: string;
    updated_at: string;
};

export type Batch = {
    id: number;
    medicine: {
        id: number;
        name: string;
        generic_name: string | null;
        manufacturer: string | null;
        strength: string | null;
        form: string | null;
        description: string | null;
        category_id: number;
        requires_prescription: boolean;
        low_stock_threshold: number;
        created_at: string;
        updated_at: string;
    };
    supplier: {
        id: number;
        name: string;
        contact_person: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        created_at: string;
        updated_at: string;
    };
    supplier_id: number;
    batch_number: string | null;
    quantity_received: number;
    current_quantity: number;
    manufacture_date: string | null;
    expiry_date: string;
    created_at: string;
    updated_at: string;
};
