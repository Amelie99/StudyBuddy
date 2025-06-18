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

// Initialize Firebase
// const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const auth = getAuth(app);
// const db = getFirestore(app);
// const storage = getStorage(app);

// export { app, auth, db, storage };

// Mock implementation for UI development without actual Firebase backend
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Simulate initial auth check based on the current mockAuth.currentUser state
    setTimeout(() => {
      // @ts-ignore
      callback(mockAuth.currentUser);
    }, 50); // Short delay for initial check

    // This mock doesn't simulate real-time changes after the initial one.
    // A full mock would need to store callbacks and call them when login/logout methods change mockAuth.currentUser.
    return () => {}; // Unsubscribe function
  },
  signInWithEmailAndPassword: async (email?: string, password?: string) => {
    if (email && password && email.endsWith('@stud.haw-landshut.de')) {
      const mockUser = { uid: 'mock-user-id', email, displayName: 'Max Mustermann', profileComplete: true };
      // @ts-ignore
      mockAuth.currentUser = mockUser;
      return { user: mockUser };
    }
    throw new Error('Ungültige Anmeldeinformationen oder Domain.');
  },
  createUserWithEmailAndPassword: async (email?: string, password?: string) => {
     if (email && password && email.endsWith('@stud.haw-landshut.de')) {
      const mockUser = { uid: 'new-mock-user-id', email, displayName: null, profileComplete: false };
       // @ts-ignore
      mockAuth.currentUser = mockUser;
      return { user: mockUser };
    }
    throw new Error('Ungültige E-Mail-Domain oder Passwort.');
  },
  signOut: async () => {
     // @ts-ignore
    mockAuth.currentUser = null;
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
