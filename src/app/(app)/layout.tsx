'use client';
import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthGuard } from '@/hooks/useAuthGuard'; // Use the guard

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Protect these routes, require profile to be complete
  useAuthGuard({ requireProfileComplete: true, redirectIfAuthedTo: '/dashboard' }); 
  
  // If loading or not authenticated, AuthGuard/AuthContext might redirect
  // or you can show a loader here. For now, AppShell will render.
  return <AppShell>{children}</AppShell>;
}
