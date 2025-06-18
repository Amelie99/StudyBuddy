
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
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    authStateChangedCallback = callback; // Store the callback

    // Simulate initial auth check based on the current mockAuth.currentUser state
    setTimeout(() => {
      // @ts-ignore
      if (authStateChangedCallback) authStateChangedCallback(mockAuth.currentUser);
    }, 50); // Short delay for initial check

    return () => { // Unsubscribe function
      authStateChangedCallback = null;
    };
  },
  signInWithEmailAndPassword: async (email?: string, password?: string) => {
    if (email && password && email.endsWith('@stud.haw-landshut.de')) {
      let mockUserProperties = {
        uid: 'mock-user-id-' + email.split('@')[0], // Make UID somewhat unique for testing
        email,
        displayName: 'Neuer Nutzer', 
        photoURL: '',
        profileComplete: false, // Default for new users
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
          mockUserProperties.profileComplete = true; // Max's profile is complete
          // Optionally, pre-fill Max's other details if needed for testing
          mockUserProperties.studiengang = "Informatik";
          mockUserProperties.semester = "4";
      }
      
      // @ts-ignore
      mockAuth.currentUser = mockUserProperties;
      // @ts-ignore
      if (authStateChangedCallback) authStateChangedCallback(mockAuth.currentUser); // Manually trigger
      return { user: mockUserProperties };
    }
    // @ts-ignore
    mockAuth.currentUser = null; // Failed login
    // @ts-ignore
    if (authStateChangedCallback) authStateChangedCallback(mockAuth.currentUser); // Manually trigger
    throw new Error('Ungültige Anmeldeinformationen oder Domain.');
  },
  createUserWithEmailAndPassword: async (email?: string, password?: string) => {
     if (email && password && email.endsWith('@stud.haw-landshut.de')) {
      const mockUser = {
        uid: 'new-mock-user-id-' +  email.split('@')[0],
        email,
        displayName: null, // New users don't have a display name yet
        photoURL: '',
        profileComplete: false, // New users need to complete profile
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
      // @ts-ignore
      if (authStateChangedCallback) authStateChangedCallback(mockAuth.currentUser); // Manually trigger
      return { user: mockUser };
    }
    // @ts-ignore
    mockAuth.currentUser = null; // Failed registration
    // @ts-ignore
    if (authStateChangedCallback) authStateChangedCallback(mockAuth.currentUser); // Manually trigger
    throw new Error('Ungültige E-Mail-Domain oder Passwort.');
  },
  signOut: async () => {
     // @ts-ignore
    mockAuth.currentUser = null;
    // @ts-ignore
    if (authStateChangedCallback) authStateChangedCallback(mockAuth.currentUser); // Manually trigger
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
