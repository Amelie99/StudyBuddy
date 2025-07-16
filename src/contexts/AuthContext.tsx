
'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { auth, db, storage } from '@/config/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  deleteUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { AppUser, UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: AppUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  register: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  isHochschuleEmail: (email: string) => boolean;
  updateUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  uploadProfilePicture: (file: File, userId: string) => Promise<string>;
  updateAuthContextUser: (updatedUser: Partial<AppUser>) => void;
  deleteCurrentUser: () => Promise<void>;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          // This case handles users created via Firebase Auth but without a Firestore doc yet
          const appUser: AppUser = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'New User',
            photoURL: user.photoURL || '',
            profileComplete: false, 
          };
          // Create the document in firestore for this new user
          await setDoc(userDocRef, appUser);
          setCurrentUser(appUser);
          const newUserProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            name: user.displayName || user.email?.split('@')[0] || 'New User',
            profileComplete: false,
            bio: '',
            courses: [],
            studySubject: '',
            semester: 1,
            profilePicture: user.photoURL || '',
            availability: {
              'Montag': [],
              'Dienstag': [],
              'Mittwoch': [],
              'Donnerstag': [],
              'Freitag': [],
              'Samstag': [],
              'Sonntag': [],
            }
          };
          setUserProfile(newUserProfile);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
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

  const updateUserProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, profileData);
      setUserProfile(prevProfile => {
        if (!prevProfile) return null;
        return { ...prevProfile, ...profileData };
      });
    }
  }, [currentUser]);

  const uploadProfilePicture = useCallback(async (file: File, userId: string): Promise<string> => {
    const storageRef = ref(storage, `profile-pictures/${userId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    // Directly update the user profile after getting the URL
    await updateUserProfile({ profilePicture: downloadURL });
    return downloadURL;
  }, [updateUserProfile]);

  const deleteCurrentUser = useCallback(async () => {
      const user = auth.currentUser;
      if (user) {
          try {
              // First, delete the Firestore document.
              const userDocRef = doc(db, 'users', user.uid);
              await deleteDoc(userDocRef);
              
              // Then, delete the user from Firebase Auth.
              // This action will trigger the onAuthStateChanged listener,
              // which will set currentUser to null and cause a redirect.
              await deleteUser(user);
              
              console.log("User deleted successfully");
          } catch (error) {
              console.error("Error deleting user:", error);
              // This might be a "re-authentication needed" error.
              // For simplicity in this app, we'll just log out.
              // In a production app, you'd prompt for re-login.
              await logout();
              throw error; // Re-throw so the UI can catch it.
          }
      }
  }, [logout]);

  const login = useCallback(async (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  }, []);

  const register = useCallback(async (email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (userCredential.user) {
      const { uid } = userCredential.user;
      const initialProfile: UserProfile = {
        uid,
        email,
        name: email.split('@')[0], 
        profileComplete: false,
        bio: '',
        courses: [],
        studySubject: '',
        semester: 1,
        profilePicture: '',
        availability: {
          'Montag': [],
          'Dienstag': [],
          'Mittwoch': [],
          'Donnerstag': [],
          'Freitag': [],
          'Samstag': [],
          'Sonntag': [],
        }
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
    userProfile,
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
  }), [currentUser, userProfile, loading, login, register, logout, sendPasswordReset, isHochschuleEmail, updateUserProfile, uploadProfilePicture, updateAuthContextUser, deleteCurrentUser]);

  // The AuthProvider no longer needs to render the loader itself,
  // as the HomePage now acts as the "splash screen".
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
