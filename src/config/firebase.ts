
// Store the onAuthStateChanged callback
let authStateChangedCallback: ((user: any) => void) | null = null;

// Mock user database
let mockUserDatabase: any[] = [
  {
    uid: 'mock-user-id-max.mustermann',
    email: 'max.mustermann@stud.haw-landshut.de',
    displayName: 'Max Mustermann',
    photoURL: 'https://i.imgur.com/8b2434u.jpeg',
    profileComplete: true,
    studiengang: 'Informatik',
    semester: '4',
    ueberMich: "Suche jemanden, um komplexe Algorithmen zu besprechen und mich auf die Klausur in 'Software Engineering' vorzubereiten.",
    lerninteressen: ['Klausurvorbereitung', 'Tiefgehendes Verständnis'],
    lernstil: 'Durch Übung',
    kurse: ['Software Engineering', 'Datenbanken II', 'Theoretische Informatik'],
    verfuegbarkeit: ['wochentags', 'abends'],
  },
  {
    uid: '2',
    email: 'david.meier@stud.haw-landshut.de',
    displayName: 'David Meier',
    photoURL: 'https://i.imgur.com/ZiKvLxU.jpeg',
    profileComplete: true,
    studiengang: 'Master Elektrotechnik',
    semester: '2',
    ueberMich: 'Ich bin David, 25, und suche einen Lernpartner für Schaltungstechnik. Ich lerne am besten durch visuelle Beispiele.',
    lerninteressen: ['Projektarbeit', 'Hausaufgaben'],
    lernstil: 'Visuell',
    kurse: ['Schaltungstechnik', 'Digitale Signalverarbeitung'],
    verfuegbarkeit: ['wochenende', 'nachmittags'],
  },
  {
    uid: '3',
    email: 'anna.schmidt@stud.haw-landshut.de',
    displayName: 'Anna Schmidt',
    photoURL: 'https://i.imgur.com/4bC3Xf8.jpeg',
    profileComplete: true,
    studiengang: 'Wirtschaftsinformatik',
    semester: '6',
    ueberMich: 'Hallo! Ich bin Anna und bereite mich auf meine Bachelorarbeit vor. Ich suche jemanden für gegenseitiges Korrekturlesen und Motivation.',
    lerninteressen: ['Abschlussarbeit', 'Projekte'],
    lernstil: 'Diskussion',
    kurse: ['Data Warehousing', 'IT-Projektmanagement'],
    verfuegbarkeit: ['wochentags', 'abends'],
  },
];

// Mock implementation for UI development without actual Firebase backend
const mockAuth = {
  currentUser: null, // This will be largely overridden by AuthContext's direct user setting
  onAuthStateChanged: (callback: (user: any) => void) => {
    authStateChangedCallback = callback;
    // Simulate the async nature of the real onAuthStateChanged, which
    // is crucial for the app's loading state and initial redirection.
    setTimeout(() => {
      if (authStateChangedCallback) authStateChangedCallback(mockAuth.currentUser);
    }, 0);
    return () => { // Unsubscribe function
      authStateChangedCallback = null;
    };
  },
  signInWithEmailAndPassword: async (email?: string, password?: string) => {
    console.log("firebase.ts: signInWithEmailAndPassword called (mock)");
    if (email && password && email.endsWith('@stud.haw-landshut.de')) {
      const userInDb = mockUserDatabase.find(user => user.email === email);
      if (userInDb) {
        // @ts-ignore
        mockAuth.currentUser = userInDb;
        if (authStateChangedCallback) authStateChangedCallback(mockAuth.currentUser);
        return { user: userInDb };
      }
    }
    // @ts-ignore
    mockAuth.currentUser = null;
    if (authStateChangedCallback) authStateChangedCallback(mockAuth.currentUser);
    throw new Error('Ungültige Anmeldeinformationen oder Domain.');
  },
  createUserWithEmailAndPassword: async (email?: string, password?: string) => {
    console.log("firebase.ts: createUserWithEmailAndPassword called (mock)");
    if (email && password && email.endsWith('@stud.haw-landshut.de')) {
      const existingUser = mockUserDatabase.find(user => user.email === email);
      if (existingUser) {
        throw new Error('E-Mail-Adresse wird bereits verwendet.');
      }

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

      mockUserDatabase.push(mockUser); // Add user to our mock DB

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

const mockDb = {
  updateUserProfile: (uid: string, profileData: any) => {
    const userIndex = mockUserDatabase.findIndex(user => user.uid === uid);
    if (userIndex !== -1) {
      mockUserDatabase[userIndex] = { ...mockUserDatabase[userIndex], ...profileData, profileComplete: true };
    }
  },
  deleteUserProfile: (uid: string) => {
    const userIndex = mockUserDatabase.findIndex(user => user.uid === uid);
    if (userIndex > -1) {
      mockUserDatabase.splice(userIndex, 1);
    }
  },
  getAllUsers: () => {
    return mockUserDatabase;
  }
};
const mockStorage = {};

export { mockAuth as auth, mockDb as db, mockStorage as storage };
