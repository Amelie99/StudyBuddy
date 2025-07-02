import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { GroupsProvider } from '@/contexts/GroupsContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <GroupsProvider>
      <AppShell>{children}</AppShell>
    </GroupsProvider>
  );
}
