'use client';

import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileTabBar } from './MobileTabBar';
import { SidebarProvider } from '@/components/ui/sidebar'; // Import SidebarProvider

export function AppShell({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={true}> {/* Wrap with SidebarProvider */}
      <div className="flex min-h-screen">
        {!isMobile && <DesktopSidebar />}
        <main className="flex-1 flex flex-col overflow-x-hidden">
          <div className="flex-grow p-4 md:p-6 lg:p-8">
            {children}
          </div>
          {isMobile && <div className="h-16" />} {/* Spacer for mobile tab bar */}
        </main>
        {isMobile && <MobileTabBar />}
      </div>
    </SidebarProvider>
  );
}
