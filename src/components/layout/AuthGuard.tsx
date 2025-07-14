
'use client';

import React from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  useAuthGuard({
    redirectTo: '/anmelden',
    redirectIfAuthedTo: '/dashboard',
    requireProfileComplete: true,
  });

  return <>{children}</>;
}
