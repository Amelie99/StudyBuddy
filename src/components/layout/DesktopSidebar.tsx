'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS_CONFIG, type NavItem } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar'; // Using the provided advanced sidebar

export function DesktopSidebar() {
  const pathname = usePathname();
  const { logout, currentUser, loading } = useAuth();

  const isActive = (item: NavItem) => {
    if (item.matchSubpaths) {
      return pathname.startsWith(item.href);
    }
    return pathname === item.href;
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4 flex flex-col items-center group-data-[state=collapsed]:p-1 transition-all duration-200">
        <Link href="/dashboard" className="mb-4 block h-12 w-full flex items-center justify-start group-data-[state=collapsed]:justify-center">
          {/* Expanded Logo */}
          <div className="relative w-48 h-11 group-data-[state=collapsed]:hidden">
            <Image 
              src="https://i.imgur.com/TcVJosu.png"
              alt="HAW Landshut Logo"
              fill
              priority
              className="object-contain"
            />
          </div>
          {/* Collapsed Logo */}
          <div className="relative w-8 h-8 hidden group-data-[state=collapsed]:block">
             <Image 
              src="https://i.imgur.com/TcVJosu.png"
              alt="HAW Landshut Logo"
              fill
              priority
              className="object-contain"
            />
          </div>
        </Link>
        <div className="w-full flex justify-start group-data-[state=collapsed]:justify-center">
           <SidebarTrigger />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex-grow p-2">
        <SidebarMenu>
          {loading && !currentUser ? (
            <>
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
            </>
          ) : (
            NAV_ITEMS_CONFIG.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item)}
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                  className={cn(
                    "justify-start",
                    isActive(item) && "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4 mt-auto border-t group-data-[state=collapsed]:p-1 transition-all duration-200">
        {currentUser && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={logout}
                className="w-full justify-start"
                tooltip={{ children: 'Abmelden', side: 'right', align: 'center' }}
              >
                <LogOut className="h-5 w-5" />
                <span>Abmelden</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
