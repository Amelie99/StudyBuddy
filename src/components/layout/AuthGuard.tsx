
'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthGuard as useAuthGuardHook } from '@/hooks/useAuthGuard'; // Renamed to avoid conflict

interface AuthGuardProps {
  children: React.ReactNode;
}

// This component uses the hook and decides what to render.
// It can render children, a loader, or nothing (while redirecting).
export function AuthGuard({ children }: AuthGuardProps) {
  const { shouldRender, isLoading } = useAuthGuardHook({
    requireProfileComplete: true, // Enforce profile completion for the main app
  });

  // You could return a global loader here if you want
  if (isLoading || !shouldRender) {
    return null; 
  }

  return <>{children}</>;
}
