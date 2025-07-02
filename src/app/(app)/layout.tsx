import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { GroupsProvider } from '@/contexts/GroupsContext';
import { BuddiesProvider } from '@/contexts/PartnersContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <GroupsProvider>
      <BuddiesProvider>
        <AppShell>{children}</AppShell>
      </BuddiesProvider>
    </GroupsProvider>
  );
}
