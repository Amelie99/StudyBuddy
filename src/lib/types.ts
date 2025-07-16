
export interface AppUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL?: string;
  dataAiHint?: string;
  studiengang?: string;
  semester?: string;
  ueberMich?: string;
  bio?: string;
  lerninteressen?: string[];
  lernstil?: string;
  kurse?: string[];
  verfuegbarkeit?: string[];
  profileComplete: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  profileComplete: boolean;
  bio: string;
  courses: string[];
  studySubject: string;
  semester: number;
  profilePicture: string;
  photoURL?: string;
  availability: Availability;
}

export type Day = 'Montag' | 'Dienstag' | 'Mittwoch' | 'Donnerstag' | 'Freitag' | 'Samstag' | 'Sonntag';
export type TimeSlot = 'morning' | 'afternoon' | 'evening';
export type Availability = Record<Day, TimeSlot[]>;


export interface Buddy {
    id: string;
    name: string;
    course: string;
    avatar: string;
    dataAiHint?: string;
}

export interface SuggestedBuddy {
    id: number;
    name: string;
    course: string;
    semester: number;
    image: string;
    avatar?: string;
    dataAiHint: string;
}

export interface Conversation {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    unread: number;
    avatar: string;
    dataAiHint?: string;
    messages?: Message[]; // Optional: To hold all messages for searching
    match?: { // For search results
        type: 'name' | 'message';
        text: string;
    };
}

export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: string;
    self: boolean;
}

export interface ChatDetail {
    id: string;
    name: string;
    avatar: string;
    dataAiHint?: string;
    type: 'user' | 'group';
    membersCount?: number;
    messages: Message[];
}
