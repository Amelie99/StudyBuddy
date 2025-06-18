'use client';
import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
// import { useAuthGuard } from '@/hooks/useAuthGuard'; // Auth guarding is now primarily handled by AuthContext

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // The AuthContext, applied in the root layout, now handles the primary redirection logic
  // for authentication and profile completion status.
  // Thus, useAuthGuard is no longer strictly needed here for those core checks.
  // If loading or not authenticated/profile incomplete, AuthContext should redirect.
  
  return <AppShell>{children}</AppShell>;
}
