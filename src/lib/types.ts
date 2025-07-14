
export interface AppUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL?: string;
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

export interface Buddy {
    id: string;
    name: string;
    course: string;
    avatar: string;
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
}

export interface Message {
    id: string;
    senderId: string;
    senderName?: string;
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
