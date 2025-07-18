
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
import { onSnapshot, collection, query, orderBy, Timestamp, doc, getDoc } from 'firebase/firestore';

interface ChatsContextType {
    conversations: Conversation[];
    loadingConversations: boolean; // Changed from 'loading' to be more specific
    chatDetails: ChatDetail | null;
    loadingChatDetails: boolean; // Added for specific chat loading
    subscribeToChatDetails: (chatId: string) => () => void; // New function to handle subscription
    startNewChat: (otherUser: AppUser) => Promise<string | null>;
    sendMessage: (
        chatId: string,
        message: Omit<Message, 'id' | 'timestamp' | 'self' | 'senderId' | 'senderName'>,
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
    const { currentUser, userProfile } = useAuth();
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
        let participantDetailsCache: any = {};
        
        // Listener for the chat document itself (for name, avatar etc)
        const chatUnsubscribe = onSnapshot(chatRef, (chatSnap) => {
             if (chatSnap.exists()) {
                const chatData = chatSnap.data();
                participantDetailsCache = chatData.participantDetails || {};
                const otherParticipantId = chatData.participants.find((p: string) => p !== currentUser.uid);
                const otherParticipantDetails = participantDetailsCache[otherParticipantId];
                
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
                const senderId = msgData.senderId;
                const senderDetails = participantDetailsCache[senderId];
                const timestamp = msgData.timestamp ? (msgData.timestamp as Timestamp).toDate() : new Date();
                
                return {
                    id: doc.id,
                    senderId: senderId,
                    senderName: senderDetails?.displayName || 'Unknown',
                    text: msgData.text,
                    timestamp: timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
                    self: senderId === currentUser.uid,
                };
            });
            
            setChatDetails(prevDetails => {
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
            if (!currentUser || !userProfile) return null;
            const newChatId = await chatManager.createChatWithUser(
                { ...currentUser, displayName: userProfile.name, photoURL: userProfile.profilePicture },
                otherUser,
            );
            await fetchConversations(); // Refresh conversations after creating a new one
            return newChatId;
        },
        [currentUser, userProfile, fetchConversations],
    );

    const sendMessage = useCallback(
        async (
            chatId: string,
            message: Omit<Message, 'id' | 'timestamp' | 'self' | 'senderId' | 'senderName'>,
        ) => {
            if (!currentUser || !userProfile) return;
            await chatManager.sendMessage(chatId, {
                ...message,
                senderId: currentUser.uid,
                senderName: userProfile.name, // Add sender's name
            });
            // No need to manually update state, the listener will do it.
        },
        [currentUser, userProfile],
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

export type { Conversation };
