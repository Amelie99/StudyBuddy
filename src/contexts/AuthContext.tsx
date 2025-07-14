
'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { auth, db, storage } from '@/config/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { AppUser } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  register: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  isHochschuleEmail: (email: string) => boolean;
  updateUserProfile: (profileData: Partial<AppUser>) => Promise<void>;
  uploadProfilePicture: (file: File, userId: string) => Promise<string>;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as AppUser;
          setCurrentUser({ ...userData, uid: user.uid });
        } else {
          // This case handles users created via Firebase Auth but without a Firestore doc yet
          const appUser: AppUser = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || null,
            photoURL: user.photoURL || '',
            profileComplete: false, 
          };
          setCurrentUser(appUser);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);
  
  const updateAuthContextUser = useCallback((updatedData: Partial<AppUser>) => {
    setCurrentUser(prevUser => {
      if (!prevUser) return null;
      return { ...prevUser, ...updatedData };
    });
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    router.replace('/anmelden');
  }, [router]);

  const updateUserProfile = useCallback(async (profileData: Partial<AppUser>) => {
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      await setDoc(userDocRef, profileData, { merge: true });
      updateAuthContextUser(profileData);
    }
  }, [currentUser, updateAuthContextUser]);

  const uploadProfilePicture = useCallback(async (file: File, userId: string): Promise<string> => {
    const storageRef = ref(storage, `profile-pictures/${userId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    await updateUserProfile({ photoURL: downloadURL });
    return downloadURL;
  }, [updateUserProfile]);

  const deleteCurrentUser = useCallback(() => {
    if (currentUser) {
      console.log("Deleting profile for:", currentUser.uid);
      logout();
    }
  }, [currentUser, logout]);

  const login = useCallback(async (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  }, []);

  const register = useCallback(async (email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (userCredential.user) {
      const { uid } = userCredential.user;
      const initialProfile = {
        uid,
        email,
        displayName: email.split('@')[0], 
        profileComplete: false,
      };
      await setDoc(doc(db, "users", uid), initialProfile);
    }
    return userCredential;
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    return sendPasswordResetEmail(auth, email);
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
    uploadProfilePicture,
    updateAuthContextUser,
    deleteCurrentUser,
  }), [currentUser, loading, login, register, logout, sendPasswordReset, isHochschuleEmail, updateUserProfile, uploadProfilePicture, updateAuthContextUser, deleteCurrentUser]);

  // The AuthProvider no longer needs to render the loader itself,
  // as the HomePage now acts as the "splash screen".
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
