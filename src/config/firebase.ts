
// import { initializeApp, getApps, getApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Store the onAuthStateChanged callback
let authStateChangedCallback: ((user: any) => void) | null = null;

// Mock implementation for UI development without actual Firebase backend
const mockAuth = {
  currentUser: null, // This will be largely overridden by AuthContext's direct user setting
  onAuthStateChanged: (callback: (user: any) => void) => {
    // This mock onAuthStateChanged is simplified as AuthContext will now directly set a user.
    // It can call back with null initially if desired, but AuthContext will override.
    authStateChangedCallback = callback;
    // console.log("firebase.ts: onAuthStateChanged listener registered by AuthContext.");
    // // Optionally, simulate an initial "not logged in" state if AuthContext doesn't set user immediately
    // setTimeout(() => {
    //   if (authStateChangedCallback) authStateChangedCallback(mockAuth.currentUser);
    // }, 0); 
    return () => { // Unsubscribe function
      // console.log("firebase.ts: onAuthStateChanged listener unregistered.");
      authStateChangedCallback = null;
    };
  },
  signInWithEmailAndPassword: async (email?: string, password?: string) => {
    console.log("firebase.ts: signInWithEmailAndPassword called (mock)");
    if (email && password && email.endsWith('@stud.haw-landshut.de')) {
      let mockUserProperties: any = {
        uid: 'mock-user-id-' + email.split('@')[0],
        email,
        displayName: 'Eingeloggter Nutzer', 
        photoURL: '',
        profileComplete: false, 
        studiengang: '',
        semester: '',
        ueberMich: '',
        lerninteressen: [],
        lernstil: '',
        kurse: [],
        verfuegbarkeit: [],
      };

      if (email === 'max.mustermann@stud.haw-landshut.de') {
          mockUserProperties.displayName = 'Max Mustermann';
          mockUserProperties.profileComplete = true; 
          mockUserProperties.studiengang = "Informatik";
          mockUserProperties.semester = "4";
      }
      
      // @ts-ignore
      mockAuth.currentUser = mockUserProperties;
      if (authStateChangedCallback) authStateChangedCallback(mockAuth.currentUser);
      return { user: mockUserProperties };
    }
    // @ts-ignore
    mockAuth.currentUser = null; 
    if (authStateChangedCallback) authStateChangedCallback(mockAuth.currentUser);
    throw new Error('Ungültige Anmeldeinformationen oder Domain.');
  },
  createUserWithEmailAndPassword: async (email?: string, password?: string) => {
    console.log("firebase.ts: createUserWithEmailAndPassword called (mock)");
     if (email && password && email.endsWith('@stud.haw-landshut.de')) {
      const mockUser = {
        uid: 'new-mock-user-id-' +  email.split('@')[0],
        email,
        displayName: null, 
        photoURL: '',
        profileComplete: false, 
        studiengang: '',
        semester: '',
        ueberMich: '',
        lerninteressen: [],
        lernstil: '',
        kurse: [],
        verfuegbarkeit: [],
      };
      // @ts-ignore
      mockAuth.currentUser = mockUser;
      if (authStateChangedCallback) authStateChangedCallback(mockAuth.currentUser);
      return { user: mockUser };
    }
    // @ts-ignore
    mockAuth.currentUser = null;
    if (authStateChangedCallback) authStateChangedCallback(mockAuth.currentUser);
    throw new Error('Ungültige E-Mail-Domain oder Passwort.');
  },
  signOut: async () => {
    console.log("firebase.ts: signOut called (mock)");
    // @ts-ignore
    mockAuth.currentUser = null;
    if (authStateChangedCallback) authStateChangedCallback(mockAuth.currentUser);
  },
  sendPasswordResetEmail: async (email:string) => {
    if (!email) throw new Error("Email is required for password reset");
    console.log(`Password reset email sent to ${email} (mock)`);
    return Promise.resolve();
  }
};

const mockDb = {};
const mockStorage = {};

export { mockAuth as auth, mockDb as db, mockStorage as storage };
