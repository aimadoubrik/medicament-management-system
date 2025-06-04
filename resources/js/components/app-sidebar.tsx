import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Package, PillBottle, Users, FileSpreadsheet } from 'lucide-react';
import { useIntl } from 'react-intl';
import AppLogo from './app-logo';

export function AppSidebar() {
    // --- Internationalization (i18n) Setup ---
    const intl = useIntl();
    const dashboardTitle = intl.formatMessage({
        id: 'sidebar.nav_links.dashboard',
        defaultMessage: 'Dashboard',
    });
    const medicinesTitle = intl.formatMessage({
        id: 'sidebar.nav_links.medicines',
        defaultMessage: 'Medicines',
    });
    const stockTitle = intl.formatMessage({
        id: 'sidebar.nav_links.stock',
        defaultMessage: 'Stock',
    });
    const suppliersTitle = intl.formatMessage({
        id: 'sidebar.nav_links.suppliers',
        defaultMessage: 'Suppliers',
    });
    const usersTitle = intl.formatMessage({
        id: 'sidebar.nav_links.users',
        defaultMessage: 'Users',
    });
    const reportsTitle = intl.formatMessage({
        id: 'sidebar.nav_links.reports',
        defaultMessage: 'Reports',
    })
    // --- End of Internationalization (i18n) Setup ---

    const mainNavItems: NavItem[] = [
        {
            title: dashboardTitle,
            href: '/dashboard',
            icon: LayoutGrid,
            permission: 'viewDashboard',
        },
        {
            title: medicinesTitle,
            href: '/medicines',
            icon: PillBottle,
            permission: 'viewAnyMedicines',
        },
        {
            title: stockTitle,
            href: '/stock',
            icon: Package,
            permission: 'viewAnyBatches',
        },
        {
            title: suppliersTitle,
            href: '/suppliers',
            icon: Users,
            permission: 'viewAnySuppliers',
        },
        {
            title: usersTitle,
            href: '/users',
            icon: Users,
            permission: 'viewAnyUsers',
        },
        {
            title: reportsTitle,
            href: '/reports',
            icon: FileSpreadsheet,
            permission: 'viewReports',
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="mt-6">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
