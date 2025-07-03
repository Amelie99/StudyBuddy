'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { SuggestedBuddy } from './PartnersContext';

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

interface ChatsContextType {
    conversations: Conversation[];
    getChatDetails: (chatId: string) => ChatDetail | null;
    startNewChat: (buddy: SuggestedBuddy) => void;
    addMessageToChat: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
}

const initialConversations: Conversation[] = [
  { id: "1", name: "Lisa Schmidt", lastMessage: "Super, danke dir!", timestamp: "11:45", unread: 1, avatar: "https://placehold.co/100x100.png", dataAiHint: "woman student" },
  { id: "2", name: "David Meier", lastMessage: "Können wir uns morgen treffen?", timestamp: "10:30", unread: 0, avatar: "https://placehold.co/100x100.png", dataAiHint: "man student" },
  { id: "group-1", name: "Mathe Profis WS23/24", lastMessage: "Max: Ich lade die neue Version hoch.", timestamp: "Gestern", unread: 3, avatar: "https://placehold.co/100x100.png", dataAiHint: "group icon" },
  { id: "group-2", name: "SE Projekt 'LernApp'", lastMessage: "Perfekt, danke!", timestamp: "18.12.", unread: 0, avatar: "https://placehold.co/100x100.png", dataAiHint: "team collaboration" },
  { id: "3", name: "Sarah Chen", lastMessage: "Danke für die Hilfe :)", timestamp: "Mo", unread: 0, avatar: "https://placehold.co/100x100.png", dataAiHint: "woman smiling" },
];

const initialChats: { [key: string]: ChatDetail } = {
    "1": { id: "1", name: "Lisa Schmidt", avatar: "https://placehold.co/100x100.png", dataAiHint: "woman student", type: "user", messages: [ { id: "m1", senderId: "user1", text: "Hallo, hast du Zeit für die Matheaufgaben?", timestamp: "10:30", self: false }, { id: "m2", senderId: "currentUser", text: "Hey! Ja, klar. Wann passt es dir?", timestamp: "10:31", self: true }, { id: "m3", senderId: "user1", text: "Super, danke dir!", timestamp: "11:45", self: false }, ] },
    "2": { id: "2", name: "David Meier", avatar: "https://placehold.co/100x100.png", dataAiHint: "man student", type: "user", messages: [ { id: "dm1", senderId: "user2", text: "Können wir uns morgen treffen?", timestamp: "10:30", self: false }, ] },
    "3": { id: "3", name: "Sarah Chen", avatar: "https://placehold.co/100x100.png", dataAiHint: "woman smiling", type: "user", messages: [ { id: "sc1", senderId: "user3", text: "Danke für die Hilfe :)", timestamp: "Mo", self: false }, ] },
    "group-1": { id: "group-1", name: "Mathe Profis WS23/24", avatar: "https://placehold.co/100x100.png", dataAiHint: "group icon", type: "group", membersCount: 5, messages: [ { id: "gm1", senderId: "user2", senderName: "Lisa", text: "Hat jemand die Lösungen für Blatt 3?", timestamp: "Gestern 14:00", self: false }, { id: "gm2", senderId: "currentUser", text: "Ich schau mal nach.", timestamp: "Gestern 14:05", self: true }, { id: "gm3", senderId: "currentUser", senderName: "Max", text: "Ich lade die neue Version hoch.", timestamp: "Gestern", self: true }, ] },
    "group-2": { id: "group-2", name: "SE Projekt 'LernApp'", avatar: "https://placehold.co/100x100.png", dataAiHint: "team collaboration", type: "group", membersCount: 3, messages: [ { id: "se1", senderId: "user2", senderName: "David", text: "Ich hab den neuen Sprint Plan commited.", timestamp: "18.12.", self: false }, { id: "se2", senderId: "currentUser", text: "Perfekt, danke!", timestamp: "18.12.", self: true }, ] }
};


const ChatsContext = createContext<ChatsContextType | undefined>(undefined);

export function useChats() {
    const context = useContext(ChatsContext);
    if (!context) {
        throw new Error('useChats must be used within a ChatsProvider');
    }
    return context;
}

export const ChatsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [chats, setChats] = useState<{ [key: string]: ChatDetail }>(initialChats);

    const getChatDetails = useCallback((chatId: string) => {
        return chats[chatId] || null;
    }, [chats]);

    const startNewChat = useCallback((buddy: SuggestedBuddy) => {
        const buddyId = buddy.id.toString();

        setConversations(prev => {
            if (prev.some(c => c.id === buddyId)) {
                return prev; // Conversation already exists
            }
            const newConversation: Conversation = {
                id: buddyId,
                name: buddy.name,
                lastMessage: "Sag Hallo!",
                timestamp: "Jetzt",
                unread: 0,
                avatar: buddy.image,
                dataAiHint: buddy.dataAiHint,
            };
            return [newConversation, ...prev];
        });

        setChats(prev => {
            if (prev[buddyId]) {
                return prev; // Chat details already exist
            }
            const newChatDetail: ChatDetail = {
                id: buddyId,
                name: buddy.name,
                avatar: buddy.image,
                dataAiHint: buddy.dataAiHint,
                type: 'user',
                messages: [],
            };
            return { ...prev, [buddyId]: newChatDetail };
        });
    }, []);

    const addMessageToChat = useCallback((chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
        const newMessage: Message = {
            ...message,
            id: `msg-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        };

        setChats(prev => {
            const currentChat = prev[chatId];
            if (currentChat) {
                const updatedChat = {
                    ...currentChat,
                    messages: [...currentChat.messages, newMessage]
                };
                return { ...prev, [chatId]: updatedChat };
            }
            return prev;
        });

        setConversations(prev => prev.map(conv => {
            if (conv.id === chatId) {
                return {
                    ...conv,
                    lastMessage: newMessage.self ? `Ich: ${newMessage.text}` : newMessage.text,
                    timestamp: newMessage.timestamp,
                };
            }
            return conv;
        }));
    }, []);

    const value = { conversations, getChatDetails, startNewChat, addMessageToChat };

    return (
        <ChatsContext.Provider value={value}>
            {children}
        </ChatsContext.Provider>
    );
};
