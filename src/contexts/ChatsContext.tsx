
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
import { db } from '@/config/firebase';
import { onSnapshot, collection, query, orderBy, Timestamp, doc } from 'firebase/firestore';

interface ChatsContextType {
    conversations: Conversation[];
    loadingConversations: boolean; // Changed from 'loading' to be more specific
    chatDetails: ChatDetail | null;
    loadingChatDetails: boolean; // Added for specific chat loading
    subscribeToChatDetails: (chatId: string) => () => void; // New function to handle subscription
    startNewChat: (otherUser: AppUser) => Promise<string | null>;
    sendMessage: (
        chatId: string,
        message: Omit<Message, 'id' | 'timestamp' | 'self'>,
    ) => Promise<void>;
    deleteMessage: (chatId: string, messageId: string) => Promise<void>;
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
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [chatDetails, setChatDetails] = useState<ChatDetail | null>(null);
    const [loadingChatDetails, setLoadingChatDetails] = useState(true);

    const fetchConversations = useCallback(async () => {
        if (currentUser) {
            setLoadingConversations(true);
            const userConversations = await chatManager.getConversationsForUser(
                currentUser.uid,
            );
            setConversations(userConversations);
            setLoadingConversations(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);
    
    const subscribeToChatDetails = useCallback((chatId: string) => {
        if (!currentUser) {
            setChatDetails(null);
            return () => {}; // Return an empty unsubscribe function
        }

        setLoadingChatDetails(true);

        const chatRef = doc(db, 'chats', chatId);
        
        // Listener for the chat document itself (for name, avatar etc)
        const chatUnsubscribe = onSnapshot(chatRef, (chatSnap) => {
             if (chatSnap.exists()) {
                const chatData = chatSnap.data();
                const otherParticipantId = chatData.participants.find((p: string) => p !== currentUser.uid);
                const otherParticipantDetails = chatData.participantDetails[otherParticipantId];
                
                setChatDetails(prevDetails => ({
                    ...(prevDetails || { id: chatId, messages: [] }), // Keep existing messages while chat info updates
                    name: otherParticipantDetails?.displayName || 'Unknown User',
                    avatar: otherParticipantDetails?.photoURL || '',
                    type: 'user',
                }));
             } else {
                 setChatDetails(null);
             }
        });
        
        // Listener for the messages sub-collection
        const messagesRef = collection(chatRef, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const messagesUnsubscribe = onSnapshot(q, (messagesSnapshot) => {
            const messages: Message[] = messagesSnapshot.docs.map((doc) => {
                const msgData = doc.data();
                const timestamp = msgData.timestamp ? (msgData.timestamp as Timestamp).toDate() : new Date();
                return {
                    id: doc.id,
                    senderId: msgData.senderId,
                    text: msgData.text,
                    timestamp: timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
                    self: msgData.senderId === currentUser.uid,
                };
            });
            
            setChatDetails(prevDetails => {
                // If the chat details haven't been loaded yet, we can't set messages.
                // This might happen on first load. We'll merge them in.
                if (!prevDetails) {
                    return {
                        id: chatId,
                        name: 'Laden...',
                        avatar: '',
                        type: 'user',
                        messages,
                    }
                }
                return { ...prevDetails, messages };
            });
            setLoadingChatDetails(false);
        }, (error) => {
            console.error("Error fetching messages:", error);
            setLoadingChatDetails(false);
        });

        // Return a cleanup function that unsubscribes from both listeners
        return () => {
            console.log("Unsubscribing from chat details listeners");
            chatUnsubscribe();
            messagesUnsubscribe();
            setChatDetails(null); // Reset details on cleanup
        };

    }, [currentUser]);

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
            // No need to manually update state, the listener will do it.
        },
        [currentUser],
    );

     const deleteMessage = useCallback(async (chatId: string, messageId: string) => {
        if (!currentUser) return;
        
        // We need to verify that the current user is the sender of the message.
        // This is a security check. The UI should prevent this, but we double-check here.
        const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
        const messageSnap = await getDoc(messageRef);

        if (messageSnap.exists() && messageSnap.data().senderId === currentUser.uid) {
            await chatManager.deleteMessage(chatId, messageId);
            // The real-time listener will automatically update the UI.
        } else {
            throw new Error("You can only delete your own messages.");
        }
    }, [currentUser]);

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
            loadingConversations,
            chatDetails,
            loadingChatDetails,
            subscribeToChatDetails,
            startNewChat,
            sendMessage,
            deleteMessage,
            markChatAsRead,
        }),
        [
            conversations,
            loadingConversations,
            chatDetails,
            loadingChatDetails,
            subscribeToChatDetails,
            startNewChat,
            sendMessage,
            deleteMessage,
            markChatAsRead,
        ],
    );

    return (
        <ChatsContext.Provider value={value}>{children}</ChatsContext.Provider>
    );
};
