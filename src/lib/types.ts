
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
    dataAiHint: string;
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
    dataAiHint: string;
    type: 'user' | 'group';
    membersCount?: number;
    messages: Message[];
}
