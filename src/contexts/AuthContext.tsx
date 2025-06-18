
'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/config/firebase'; // Using mocked auth
import type { AppUser } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  currentUser: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  register: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  isHochschuleEmail: (email: string) => boolean;
  updateAuthContextUser: (updatedUser: Partial<AppUser>) => void; // For profile updates
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // @ts-ignore
    const unsubscribe = auth.onAuthStateChanged((user: FirebaseUser | null) => {
      if (user) {
        const appUser: AppUser = {
          uid: user.uid,
          email: user.email || '',
          displayName: (user as any).displayName || '',
          photoURL: (user as any).photoURL || '',
          profileComplete: (user as any).profileComplete !== undefined ? (user as any).profileComplete : false,
          studiengang: (user as any).studiengang || '',
          semester: (user as any).semester || '',
          ueberMich: (user as any).ueberMich || '',
          lerninteressen: (user as any).lerninteressen || [],
          lernstil: (user as any).lernstil || '',
          kurse: (user as any).kurse || [],
          verfuegbarkeit: (user as any).verfuegbarkeit || [],
        };
        setCurrentUser(appUser);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);
  
  useEffect(() => {
    if (loading) {
      return; // Wait until auth state is resolved
    }

    const isAuthPage = pathname.startsWith('/anmelden') || pathname.startsWith('/registrierung');
    const isProfileSetupPage = pathname.startsWith('/profil-erstellen');
    const isRootPage = pathname === '/';

    if (currentUser) {
      // User is authenticated
      if (!currentUser.profileComplete) {
        // Profile is incomplete
        if (!isProfileSetupPage) { // If not already on profile setup page, redirect
          router.replace('/profil-erstellen');
        }
      } else {
        // Profile is complete
        // If on auth page, profile setup page, or the root page, redirect to dashboard
        if (isAuthPage || isProfileSetupPage || isRootPage) {
          if (pathname !== '/dashboard') { // Avoid redirect loop if already on dashboard for some reason
             router.replace('/dashboard');
          }
        }
      }
    } else {
      // User is not authenticated
      // If trying to access a protected page (not auth, not profile setup, not root)
      // or if on the root page and not authenticated, redirect to /anmelden.
      if ((!isAuthPage && !isProfileSetupPage && !isRootPage) || (isRootPage && !isAuthPage)) {
         router.replace('/anmelden');
      }
      // If on an auth page (/anmelden, /registrierung) and not authenticated, no redirect is needed.
      // If on profile setup page and not authenticated, this case should also lead to /anmelden.
      // (The profile setup page should ideally be protected too, but this logic covers it).
      if(isProfileSetupPage && !isAuthPage){ // Edge case: if somehow on profile setup without auth
          router.replace('/anmelden');
      }
    }
  }, [currentUser, loading, router, pathname]);

  const updateAuthContextUser = (updatedData: Partial<AppUser>) => {
    setCurrentUser(prevUser => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedData };
      // @ts-ignore
      if (auth.currentUser && auth.currentUser.uid === newUser.uid) {
         // @ts-ignore
        Object.assign(auth.currentUser, updatedData); 
      }
      return newUser;
    });
  };

  const login = async (email: string, pass: string) => {
    // @ts-ignore
    return auth.signInWithEmailAndPassword(email, pass);
    // onAuthStateChanged in useEffect will handle setting currentUser and loading state
  };

  const register = async (email: string, pass: string) => {
    // @ts-ignore
    return auth.createUserWithEmailAndPassword(email, pass);
    // onAuthStateChanged in useEffect will handle setting currentUser and loading state
  };

  const logout = async () => {
    // @ts-ignore
    await auth.signOut();
    // onAuthStateChanged will handle currentUser = null
    // The useEffect hook will then handle redirecting to /anmelden
  };

  const sendPasswordReset = async (email: string) => {
    // @ts-ignore
    return auth.sendPasswordResetEmail(email);
  };

  const isHochschuleEmail = (email: string) => {
    return email.endsWith('@stud.haw-landshut.de');
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    sendPasswordReset,
    isHochschuleEmail,
    updateAuthContextUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
