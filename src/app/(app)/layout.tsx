import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { GroupsProvider } from '@/contexts/GroupsContext';
import { BuddiesProvider } from '@/contexts/PartnersContext';
import { ChatsProvider } from '@/contexts/ChatsContext';
import { CalendarProvider } from '@/contexts/CalendarContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CalendarProvider>
      <GroupsProvider>
        <BuddiesProvider>
          <ChatsProvider>
            <AppShell>{children}</AppShell>
          </ChatsProvider>
        </BuddiesProvider>
      </GroupsProvider>
    </CalendarProvider>
  );
}
