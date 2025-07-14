
'use client';

import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
    useMemo,
    useEffect,
} from 'react';
import {
    Conversation,
    ChatDetail,
    Message,
    AppUser,
} from '../lib/types';
import * as chatManager from '../lib/chatManager';
import { useAuth } from './AuthContext';

interface ChatsContextType {
    conversations: Conversation[];
    loading: boolean;
    getChatDetails: (chatId: string) => Promise<ChatDetail | null>;
    startNewChat: (otherUser: AppUser) => Promise<string | null>;
    sendMessage: (
        chatId: string,
        message: Omit<Message, 'id' | 'timestamp' | 'self'>,
    ) => Promise<void>;
    markChatAsRead: (chatId: string) => void;
}

const ChatsContext = createContext<ChatsContextType | undefined>(undefined);

export function useChats() {
    const context = useContext(ChatsContext);
    if (!context) {
        throw new Error('useChats must be used within a ChatsProvider');
    }
    return context;
}

export const ChatsProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const { currentUser } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchConversations = useCallback(async () => {
        if (currentUser) {
            setLoading(true);
            const userConversations = await chatManager.getConversationsForUser(
                currentUser.uid,
            );
            setConversations(userConversations);
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const getChatDetails = useCallback(
        async (chatId: string) => {
            if (!currentUser) return null;
            return await chatManager.getChatDetails(chatId, currentUser.uid);
        },
        [currentUser],
    );

    const startNewChat = useCallback(
        async (otherUser: AppUser) => {
            if (!currentUser) return null;
            const newChatId = await chatManager.createChatWithUser(
                currentUser,
                otherUser,
            );
            await fetchConversations(); // Refresh conversations after creating a new one
            return newChatId;
        },
        [currentUser, fetchConversations],
    );

    const sendMessage = useCallback(
        async (
            chatId: string,
            message: Omit<Message, 'id' | 'timestamp' | 'self'>,
        ) => {
            if (!currentUser) return;
            await chatManager.sendMessage(chatId, {
                ...message,
                senderId: currentUser.uid,
            });
            // You might want to refresh conversations here as well
            // if the last message display is critical
        },
        [currentUser],
    );

    const markChatAsRead = useCallback(
        (chatId: string) => {
            if (!currentUser) return;
            chatManager.markMessagesAsRead(chatId, currentUser.uid);
            // Update local state if needed
        },
        [currentUser],
    );

    const value = useMemo(
        () => ({
            conversations,
            loading,
            getChatDetails,
            startNewChat,
            sendMessage,
            markChatAsRead,
        }),
        [
            conversations,
            loading,
            getChatDetails,
            startNewChat,
            sendMessage,
            markChatAsRead,
        ],
    );

    return (
        <ChatsContext.Provider value={value}>{children}</ChatsContext.Provider>
    );
};
