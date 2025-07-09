
'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { auth, db } from '@/config/firebase'; // Using mocked auth
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
  updateUserProfile: (profileData: Partial<AppUser>) => void;
  updateAuthContextUser: (updatedUser: Partial<AppUser>) => void;
  deleteCurrentUser: () => void;
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
    const unsubscribe = auth.onAuthStateChanged((user: FirebaseUser | null) => {
      if (user) {
        const appUser: AppUser = {
          uid: user.uid,
          email: user.email || '',
          displayName: (user as any).displayName || null,
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
      return; 
    }

    const isAuthPage = pathname.startsWith('/anmelden') || pathname.startsWith('/registrierung');
    const isProfileSetupPage = pathname.startsWith('/profil-erstellen');
    const isRootPage = pathname === '/';

    if (currentUser) {
      if (!currentUser.profileComplete) {
        if (!isProfileSetupPage) {
          router.replace('/profil-erstellen');
        }
      } else {
        if (isAuthPage || isProfileSetupPage || isRootPage) {
          // After login, redirect to a useful page like the dashboard
          router.replace('/dashboard');
        }
      }
    } else {
      // If not logged in, and not on an auth-related page, redirect to login
      if (!isAuthPage) {
         router.replace('/anmelden');
      }
    }
  }, [currentUser, loading, router, pathname]);

  const updateAuthContextUser = useCallback((updatedData: Partial<AppUser>) => {
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
  }, []);

  const logout = useCallback(async () => {
     // @ts-ignore
    await auth.signOut();
    setCurrentUser(null); 
    router.replace('/anmelden');
  }, [router]);

  const updateUserProfile = useCallback((profileData: Partial<AppUser>) => {
    if (currentUser) {
      db.updateUserProfile(currentUser.uid, profileData);
      updateAuthContextUser(profileData);
    }
  }, [currentUser, updateAuthContextUser]);

  const deleteCurrentUser = useCallback(() => {
    if (currentUser) {
      db.deleteUserProfile(currentUser.uid);
      logout();
    }
  }, [currentUser, logout]);

  const login = useCallback(async (email: string, pass: string) => {
    // @ts-ignore
    return auth.signInWithEmailAndPassword(email, pass);
  }, []);

  const register = useCallback(async (email: string, pass: string) => {
    // @ts-ignore
    const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
    if (userCredential.user) {
      const { uid } = userCredential.user;
      const initialProfile = {
        email,
        displayName: email.split('@')[0], 
        profileComplete: false,
      };
      db.updateUserProfile(uid, initialProfile);
    }
    return userCredential;
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
     // @ts-ignore
    return auth.sendPasswordResetEmail(email);
  }, []);

  const isHochschuleEmail = useCallback((email: string) => {
    return email.endsWith('@stud.haw-landshut.de');
  }, []);

  const value = useMemo(() => ({
    currentUser,
    loading,
    login,
    register,
    logout,
    sendPasswordReset,
    isHochschuleEmail,
    updateUserProfile,
    updateAuthContextUser,
    deleteCurrentUser,
  }), [currentUser, loading, login, register, logout, sendPasswordReset, isHochschuleEmail, updateUserProfile, updateAuthContextUser, deleteCurrentUser]);


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
