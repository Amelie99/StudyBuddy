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
        // In a real app, you might fetch additional profile data from Firestore here
        // For mock, we assume profileComplete based on a mock property or default to false
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
    if (!loading && !currentUser && !pathname.startsWith('/anmelden') && !pathname.startsWith('/registrierung')) {
      router.push('/anmelden');
    } else if (!loading && currentUser && !currentUser.profileComplete && !pathname.startsWith('/profil-erstellen') && !pathname.startsWith('/anmelden') && !pathname.startsWith('/registrierung')) {
      router.push('/profil-erstellen');
    } else if (!loading && currentUser && currentUser.profileComplete && (pathname.startsWith('/anmelden') || pathname.startsWith('/registrierung') || pathname === '/profil-erstellen' || pathname === '/')) {
       router.push('/dashboard');
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
    router.push('/anmelden');
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
