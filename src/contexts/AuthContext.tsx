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
        setCurrentUser({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          // @ts-ignore
          profileComplete: user.profileComplete !== undefined ? user.profileComplete : false,
        });
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

    if (!currentUser) {
      // Not authenticated
      // If not on an auth page, redirect to /anmelden.
      // This includes the root page '/' which will redirect to /anmelden if not authenticated.
      if (!isAuthPage) {
        router.replace('/anmelden');
      }
    } else {
      // Authenticated
      if (!currentUser.profileComplete) {
        // Profile incomplete
        // If not on the profile setup page or an auth page, redirect to /profil-erstellen.
        // This includes the root page '/' which will redirect to /profil-erstellen if profile is incomplete.
        if (!isProfileSetupPage && !isAuthPage) {
          router.replace('/profil-erstellen');
        }
      } else {
        // Profile complete
        // If on an auth page, profile setup page, or the root page, redirect to dashboard.
        if (isAuthPage || isProfileSetupPage || pathname === '/') {
          router.replace('/dashboard');
        }
      }
    }
  }, [currentUser, loading, router, pathname]);


  const login = async (email: string, pass: string) => {
    // @ts-ignore
    const result = await auth.signInWithEmailAndPassword(email, pass);
    // @ts-ignore
    if (result.user) {
       // @ts-ignore
      const user = result.user;
      setCurrentUser({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Mock User',
        // @ts-ignore // Assume profileComplete from mock or default
        profileComplete: user.profileComplete !== undefined ? user.profileComplete : false, 
      });
    }
    return result;
  };

  const register = async (email: string, pass: string) => {
    // @ts-ignore
    const result = await auth.createUserWithEmailAndPassword(email, pass);
    // @ts-ignore
    if (result.user) {
      // @ts-ignore
      const user = result.user;
      setCurrentUser({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || null, // DisplayName is set during profile creation
        profileComplete: false, // Profile is not complete upon registration
      });
    }
    return result;
  };

  const logout = async () => {
    // @ts-ignore
    await auth.signOut();
    setCurrentUser(null);
    router.replace('/anmelden'); // Use replace to avoid back button to authenticated state
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
