import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BriefcaseBusiness,
    LayoutGrid,
    Settings2,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    { title: 'Ringkasan', href: dashboard(), icon: LayoutGrid },
    { title: 'Antrean hari ini', href: '/dashboard#antrean', icon: Users },
    { title: 'Layanan', href: '/services', icon: BriefcaseBusiness },
    { title: 'Laporan', href: '/reports', icon: BarChart3 },
    { title: 'Tim usaha', href: '/team', icon: Users },
    { title: 'Pengaturan usaha', href: '/business/settings', icon: Settings2 },
];

export function AppSidebar() {
    const { permissions, branch } = usePage().props as {
        permissions?: { manage_business: boolean; manage_services: boolean };
        branch?: { id: number };
    };
    const visibleNavItems = mainNavItems
        .map((item) =>
            item.title === 'Antrean hari ini' && branch
                ? { ...item, href: `/dashboard?branch_id=${branch.id}#antrean` }
                : item,
        )
        .filter((item) => {
            if (item.title === 'Layanan')
                return permissions?.manage_services ?? true;
            if (item.title === 'Tim usaha' || item.title === 'Pengaturan usaha')
                return permissions?.manage_business ?? true;
            return true;
        });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={visibleNavItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
