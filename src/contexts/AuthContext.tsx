
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
        // Ensure all AppUser fields are mapped from the Firebase user (or mock)
        // The mock user object in firebase.ts should provide these fields
        const appUser: AppUser = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: (user as any).photoURL || '', // Cast to any if mock adds fields
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

    if (!currentUser) {
      // Not authenticated
      // If not on an auth page, redirect to /anmelden.
      // This includes the root page '/' which will redirect to /anmelden if not authenticated.
      if (!isAuthPage && pathname !== '/anmelden') {
        router.replace('/anmelden');
      }
    } else {
      // Authenticated
      if (!currentUser.profileComplete) {
        // Profile incomplete
        // If not on the profile setup page or an auth page, redirect to /profil-erstellen.
        // This includes the root page '/' which will redirect to /profil-erstellen if profile is incomplete.
        if (!isProfileSetupPage && !isAuthPage && pathname !== '/profil-erstellen') {
          router.replace('/profil-erstellen');
        }
      } else {
        // Profile complete
        // If on an auth page, profile setup page, or the root page, redirect to dashboard.
        if ((isAuthPage || isProfileSetupPage || pathname === '/') && pathname !== '/dashboard') {
          router.replace('/dashboard');
        }
      }
    }
  }, [currentUser, loading, router, pathname]);

  const updateAuthContextUser = (updatedData: Partial<AppUser>) => {
    setCurrentUser(prevUser => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedData };
      // Also update the mock user in firebase.ts if this were a real backend call
      // For now, this just updates context state.
      // @ts-ignore
      if (auth.currentUser && auth.currentUser.uid === newUser.uid) {
         // @ts-ignore
        Object.assign(auth.currentUser, updatedData); // Keep mock in sync
      }
      return newUser;
    });
  };


  const login = async (email: string, pass: string) => {
    // @ts-ignore
    const result = await auth.signInWithEmailAndPassword(email, pass);
    // @ts-ignore
    if (result.user) { // onAuthStateChanged will handle setting currentUser state
      // No need to setCurrentUser here, onAuthStateChanged will fire
    }
    return result;
  };

  const register = async (email: string, pass: string) => {
    // @ts-ignore
    const result = await auth.createUserWithEmailAndPassword(email, pass);
    // @ts-ignore
    if (result.user) { // onAuthStateChanged will handle setting currentUser state
       // No need to setCurrentUser here, onAuthStateChanged will fire
    }
    return result;
  };

  const logout = async () => {
    // @ts-ignore
    await auth.signOut();
    // setCurrentUser(null); // onAuthStateChanged will handle this
    // router.replace('/anmelden'); // Redirect is handled by useEffect
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
