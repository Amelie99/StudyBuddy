import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { GroupsProvider } from '@/contexts/GroupsContext';
import { PartnersProvider } from '@/contexts/PartnersContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <GroupsProvider>
      <PartnersProvider>
        <AppShell>{children}</AppShell>
      </PartnersProvider>
    </GroupsProvider>
  );
}
