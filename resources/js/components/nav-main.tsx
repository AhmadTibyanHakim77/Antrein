import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items }: { items: NavItem[] }) {
    const { currentHash, currentUrl, isCurrentUrl } = useCurrentUrl();
    const isQueueSection =
        currentUrl === '/dashboard' && currentHash === '#antrean';

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Ruang usaha</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const active =
                        isCurrentUrl(item.href) &&
                        !(item.title === 'Ringkasan' && isQueueSection);

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={{ children: item.title }}
                                className="my-0.5 h-10 rounded-xl transition-colors data-[active=true]:bg-gradient-to-r data-[active=true]:from-teal-50 data-[active=true]:to-cyan-50 data-[active=true]:font-extrabold data-[active=true]:text-teal-900 data-[active=true]:shadow-[inset_3px_0_0_0_#0f766e] dark:data-[active=true]:from-teal-500/15 dark:data-[active=true]:to-cyan-500/10 dark:data-[active=true]:text-teal-100"
                            >
                                <Link
                                    href={item.href}
                                    prefetch
                                    aria-current={active ? 'page' : undefined}
                                >
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
