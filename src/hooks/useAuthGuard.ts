
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface UseAuthGuardOptions {
  redirectTo?: string;
  redirectIfAuthedTo?: string;
  requireProfileComplete?: boolean;
  profileRedirectTo?: string;
}

const AUTH_ROUTES = ['/anmelden', '/registrierung'];
const PROFILE_CREATION_ROUTE = '/profil-erstellen';

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(true);

  const {
    redirectTo = '/anmelden',
    redirectIfAuthedTo = '/dashboard',
    requireProfileComplete = false,
    profileRedirectTo = PROFILE_CREATION_ROUTE,
  } = options;

  useEffect(() => {
    if (authLoading) {
      return; // Wait for auth state to be determined
    }

    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    const isProfileCreationRoute = pathname === profileRedirectTo;

    // Case 1: User is logged in
    if (currentUser) {
      // And their profile is incomplete
      if (requireProfileComplete && !currentUser.profileComplete) {
        // If they are not on the profile creation page, redirect them
        if (!isProfileCreationRoute) {
          router.replace(profileRedirectTo);
          return;
        }
      }
      // Profile is complete, but they are on an auth or profile creation page
      else if (isAuthRoute || (requireProfileComplete && isProfileCreationRoute)) {
        router.replace(redirectIfAuthedTo);
        return;
      }
    }
    // Case 2: User is not logged in
    else {
      // And they are trying to access a protected page
      if (!isAuthRoute && !isProfileCreationRoute) {
        router.replace(redirectTo);
        return;
      }
    }
    
    // If no redirection is needed, allow rendering
    setIsRedirecting(false);

  }, [
    currentUser,
    authLoading,
    pathname,
    router,
    redirectTo,
    redirectIfAuthedTo,
    requireProfileComplete,
    profileRedirectTo,
  ]);
  
  // Return rendering decision
  return { 
      shouldRender: !isRedirecting,
      isLoading: authLoading
   };
}
