
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
  updateAuthContextUser: (updatedUser: Partial<AppUser>) => void;
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
    // Simulate an automatically logged-in user with a complete profile
    const mockUser: AppUser = {
      uid: 'mock-profil-user-id',
      email: 'profil.user@stud.haw-landshut.de',
      displayName: 'Profil User',
      photoURL: 'https://placehold.co/128x128.png',
      profileComplete: true, // Key for redirecting
      studiengang: 'Wirtschaftsingenieurwesen',
      semester: '2',
      ueberMich: 'Dies ist mein Profil. Ich lerne gerne durch Diskussionen und gemeinsame Projekte.',
      lerninteressen: ['diskussion', 'projektarbeit'],
      lernstil: 'diskussion',
      kurse: ['Projektmanagement', 'Marketing I'],
      verfuegbarkeit: ['wochenende', 'abends'],
    };
    setCurrentUser(mockUser);
    setLoading(false);

    // The original onAuthStateChanged listener is commented out to enforce the mock user
    /*
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
    */
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
          if (pathname !== '/partner-finden') {
             router.replace('/partner-finden');
          }
        }
      }
    } else {
      if ((!isAuthPage && !isProfileSetupPage && !isRootPage) || (isRootPage && !isAuthPage)) {
         router.replace('/anmelden');
      }
      if(isProfileSetupPage && !isAuthPage){
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

  // These functions will not be actively used when bypassing login,
  // but they are kept for structural integrity.
  const login = async (email: string, pass: string) => {
    console.warn("Login function called, but AuthContext is set to bypass login.");
    // @ts-ignore
    return auth.signInWithEmailAndPassword(email, pass);
  };

  const register = async (email: string, pass: string) => {
    console.warn("Register function called, but AuthContext is set to bypass login.");
    // @ts-ignore
    return auth.createUserWithEmailAndPassword(email, pass);
  };

  const logout = async () => {
    console.warn("Logout function called. To re-enable login, AuthContext needs to be reverted.");
     // @ts-ignore
    await auth.signOut(); 
    // To truly log out and go back to login screen, you'd need to revert the auto-login in useEffect.
    // For now, this will clear the mock auth state but the auto-login might kick back in on refresh.
    setCurrentUser(null); 
    router.replace('/anmelden'); // Manually redirect to login
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
