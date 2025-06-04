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
    permission?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface Role {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role_id: Role['id'];
    role_name: Role['name'];
    role: Role;
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
    batch_id: Batch['id'];
    batch_number: Batch['batch_number'];
    medicine_id: Medicine['id'];
    medicine_name: Medicine['name'];
    expiry_date: Batch['expiry_date'];
    quantity: Batch['current_quantity'];
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

export type StockTransactionTypeEnumMap = Record<string, string>;

export interface NewNotificationEventPayload {
    message: string;
    type: 'info' | 'success' | 'error' | 'warning'; // Use specific types if possible
    userId: number; // Included in the event, though not directly used by sonner here
    // Add any other properties you might broadcast
}

export type Medicine = {
    id: number;
    name: string;
    manufacturer_distributor: string | null;
    dosage: string | null;
    form: string | null;
    unit_of_measure: string | null;
    reorder_level?: number | null;
    description: string | null;
    quantity: number;
    created_at: string;
    updated_at: string;
};

export type MedicineStockSummary = {
    id: number;
    medicine_id: Medicine['id'];
    total_quantity_in_stock: number;
    created_at: string;
    updated_at: string;
}

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
    medicine: Medicine;
    supplier: Supplier;
    medicine_id: Medicine['id'];
    medicine_name: Medicine['name'];
    supplier_id: Supplier['id'];
    supplier_name: Supplier['name'];
    batch_number: string | null;
    quantity_received: number;
    current_quantity: number;
    manufacture_date: Date | null;
    expiry_date: Date;
    created_at: string;
    updated_at: string;
};

export type StockLedgerEntry = {
    id: number;
    medicine_id: Medicine['id'];
    medicine_name: Medicine['name'];
    batch_id: Batch['id'];
    batch_number: Batch['batch_number'];
    transaction_type: string;
    quantity_change: number;
    quantity_after_transaction: number | null;
    transaction_date: string;
    related_transaction_id: number | null;
    notes: string | null;
    user_id: User['id'] | null;
    user_name: User['name'];
    created_at: string;
    updated_at: string;
};
