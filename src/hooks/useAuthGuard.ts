// This file can be removed if logic is fully handled in AuthContext.tsx
// Or it can be expanded for more complex route guarding scenarios outside of context.
// For now, the primary redirect logic is within AuthContext.tsx.
// This file is kept as a placeholder for potential future expansion of route guarding.

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface UseAuthGuardOptions {
  redirectTo?: string; // Page to redirect to if not authenticated
  redirectIfAuthedTo?: string; // Page to redirect to if authenticated (e.g., for login/register pages)
  requireProfileComplete?: boolean; // If true, redirect to profile creation if profile is incomplete
  profileRedirectTo?: string; // Page to redirect to if profile is incomplete
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { 
    redirectTo = '/anmelden', 
    redirectIfAuthedTo,
    requireProfileComplete = false,
    profileRedirectTo = '/profil-erstellen'
  } = options;

  useEffect(() => {
    if (loading) {
      return; // Don't redirect until loading is false
    }

    // If trying to access a protected route without being authenticated
    if (!currentUser && !pathname.startsWith(redirectTo) && !pathname.startsWith('/registrierung')) {
       if (pathname !== redirectTo && !pathname.startsWith('/api')) { // Avoid redirect loops for auth pages
        router.push(redirectTo);
       }
      return;
    }
    
    // If authenticated and trying to access login/register pages
    if (currentUser && redirectIfAuthedTo && (pathname.startsWith('/anmelden') || pathname.startsWith('/registrierung'))) {
      router.push(redirectIfAuthedTo);
      return;
    }

    // If profile completion is required and profile is not complete
    if (currentUser && requireProfileComplete && !currentUser.profileComplete && pathname !== profileRedirectTo) {
      router.push(profileRedirectTo);
      return;
    }

  }, [currentUser, loading, router, redirectTo, redirectIfAuthedTo, requireProfileComplete, profileRedirectTo, pathname]);

  return { currentUser, loading };
}
