'use client';

import React from 'react';
import Image from 'next/image';
import { AppShell } from '@/components/layout/AppShell';
import { GroupsProvider } from '@/contexts/GroupsContext';
import { BuddiesProvider } from '@/contexts/PartnersContext';
import { ChatsProvider } from '@/contexts/ChatsContext';
import { CalendarProvider } from '@/contexts/CalendarContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="fixed inset-0 z-0">
        <Image
          src="https://i.imgur.com/t05wynC.jpeg"
          alt="Campus background"
          fill
          sizes="100vw"
          className="object-cover"
          data-ai-hint="university campus"
        />
        <div className="absolute inset-0 bg-background/80" />
      </div>
      <div className="relative z-10">
        <CalendarProvider>
          <GroupsProvider>
            <BuddiesProvider>
              <ChatsProvider>
                <AppShell>{children}</AppShell>
              </ChatsProvider>
            </BuddiesProvider>
          </GroupsProvider>
        </CalendarProvider>
      </div>
    </div>
  );
}
