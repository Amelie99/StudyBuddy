
export interface AppUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL?: string;
  profileComplete: boolean; // Custom flag
  // Fields from Profil Erstellen/Bearbeiten
  studiengang?: string;
  semester?: string;
  ueberMich?: string;
  lerninteressen?: string[];
  lernstil?: string;
  kurse?: string[]; // Array of course names/IDs
  verfuegbarkeit?: string[];
}

// Dummy User Data Structure (for pre-population idea, not actual DB write)
export interface DummyUserSeed extends Omit<AppUser, 'uid' | 'profileComplete' | 'email'> {
  email: string; // Include email for linking if needed
  password?: string; // For potential seeding scripts (not used in UI)
  // Specific fields from prompt
  fullName: string; // Maps to displayName
}

// Example structure for a Learning Group
export interface LearningGroup {
  id: string;
  name: string;
  description: string;
  members: string[]; // Array of AppUser uids
  createdBy: string; // AppUser uid
  createdAt: Date;
  kurs?: string; // Associated course
}

// Example structure for a Chat Message
export interface ChatMessage {
  id: string;
  chatId: string; // Belongs to which chat (can be 1-on-1 or group)
  senderId: string; // AppUser uid
  text: string;
  timestamp: Date;
  isRead?: boolean;
}

// Example structure for a Calendar Event (Lernsitzung)
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  attendees: string[]; // Array of AppUser uids
  location?: string; // or meeting link
  createdBy: string; // AppUser uid
}

// The user types from prompt for reference during development
export const dummyUserSeeds: DummyUserSeed[] = [
  {
    fullName: "Max Mustermann",
    email: "max.mustermann@stud.haw-landshut.de",
    studiengang: "Informatik",
    semester: "4",
    ueberMich: "Suche jemanden, um komplexe Algorithmen zu besprechen und mich auf die Klausur in 'Software Engineering' vorzubereiten.",
    lerninteressen: ["Klausurvorbereitung", "Tiefgehendes Verständnis"],
    lernstil: "Durch Übung",
    kurse: ["Software Engineering", "Datenbanken II", "Theoretische Informatik"],
    photoURL: "https://placehold.co/400x400.png",
  },
  {
    fullName: "Lisa Schmidt",
    email: "lisa.schmidt@stud.haw-landshut.de",
    studiengang: "Soziale Arbeit",
    semester: "1",
    ueberMich: "Neu an der HAWL und suche Anschluss! Brauche Hilfe bei den Grundlagen in 'Wissenschaftliches Arbeiten' und würde gerne Lerngruppen für die ersten Semester gründen.",
    lerninteressen: ["Hausaufgabenhilfe", "Lerngruppe finden"],
    lernstil: "Diskussion",
    kurse: ["Einführung in die Soziale Arbeit", "Wissenschaftliches Arbeiten", "Psychologie Grundlagen"],
    photoURL: "https://i.imgur.com/PKtZX0C.jpeg",
  },
  {
    fullName: "David Meier",
    email: "david.meier@stud.haw-landshut.de",
    studiengang: "Master Elektrotechnik",
    semester: "2",
    ueberMich: "Fokussiert auf meine Masterarbeit. Suche einen Sparringspartner für wöchentliche Fortschritts-Checks und zur Diskussion von Fachartikeln.",
    lerninteressen: ["Tiefgehendes Verständnis", "Projektarbeit"],
    lernstil: "Visuell",
    kurse: ["Regelungstechnik II", "Simulationstechnik", "Projektseminar"],
    photoURL: "https://i.imgur.com/ZiKvLxU.jpeg",
  },
  {
    fullName: "Sarah Chen",
    email: "sarah.chen@stud.haw-landshut.de",
    studiengang: "Betriebswirtschaft (BWL)",
    semester: "3",
    ueberMich: "I'm an international student looking to improve my German and prepare for the marketing exam. Happy to help with English business terms in return!",
    lerninteressen: ["Klausurvorbereitung", "Sprachaustausch"],
    lernstil: "Diskussion",
    kurse: ["Marketing", "Controlling", "International Management"],
    photoURL: "https://i.imgur.com/NkY3Ovh.jpeg",
  },
];
