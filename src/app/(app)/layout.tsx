import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { GroupsProvider } from '@/contexts/GroupsContext';
import { BuddiesProvider } from '@/contexts/PartnersContext';
import { ChatsProvider } from '@/contexts/ChatsContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <GroupsProvider>
      <BuddiesProvider>
        <ChatsProvider>
          <AppShell>{children}</AppShell>
        </ChatsProvider>
      </BuddiesProvider>
    </GroupsProvider>
  );
}
