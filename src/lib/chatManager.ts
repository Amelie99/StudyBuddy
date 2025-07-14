
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    query,
    where,
    orderBy,
    Timestamp,
    serverTimestamp,
    writeBatch,
    DocumentData,
    QueryDocumentSnapshot,
    arrayUnion,
    setDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { AppUser, Conversation, Message, ChatDetail } from '@/lib/types';

/**
 * Creates a new chat between the current user and another user.
 *
 * @param currentUser The current user.
 * @param otherUser The user to create a chat with.
 * @returns The ID of the new chat.
 */
export const createChatWithUser = async (
    currentUser: AppUser,
    otherUser: AppUser,
): Promise<string> => {
    // Check if a chat between these two users already exists
    const chatsRef = collection(db, 'chats');
    const q = query(
        chatsRef,
        where('participants', 'array-contains', currentUser.uid),
    );
    const querySnapshot = await getDocs(q);

    let existingChatId: string | null = null;
    querySnapshot.forEach((doc) => {
        const chat = doc.data();
        if (chat.participants.includes(otherUser.uid)) {
            existingChatId = doc.id;
        }
    });

    if (existingChatId) {
        return existingChatId;
    }

    // Create a new chat if one doesn't exist
    const newChatRef = await addDoc(chatsRef, {
        participants: [currentUser.uid, otherUser.uid],
        lastMessage: null,
        lastMessageTimestamp: null,
        // Store participant details for easier access
        participantDetails: {
            [currentUser.uid]: {
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
            },
            [otherUser.uid]: {
                displayName: otherUser.displayName,
                photoURL: otherUser.photoURL,
            },
        },
    });

    return newChatRef.id;
};

/**
 * Retrieves the conversations for a given user.
 *
 * @param userId The ID of the user.
 * @returns An array of conversations.
 */
export const getConversationsForUser = async (
    userId: string,
): Promise<Conversation[]> => {
    const chatsRef = collection(db, 'chats');
    const q = query(
        chatsRef,
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTimestamp', 'desc'),
    );

    const querySnapshot = await getDocs(q);
    const conversations: Conversation[] = [];

    querySnapshot.forEach((doc) => {
        const chat = doc.data();
        const otherParticipantId = chat.participants.find((p: string) => p !== userId);

        if (otherParticipantId) {
            const otherParticipantDetails = chat.participantDetails[otherParticipantId];
            conversations.push({
                id: doc.id,
                name: otherParticipantDetails?.displayName || 'Unknown User',
                avatar: otherParticipantDetails?.photoURL || '',
                lastMessage: chat.lastMessage || '',
                timestamp: chat.lastMessageTimestamp
                    ? (chat.lastMessageTimestamp as Timestamp).toDate().toLocaleTimeString()
                    : '',
                unread: 0, // This would require a more complex implementation to track unread messages
            });
        }
    });

    return conversations;
};

/**
 * Retrieves the details of a specific chat.
 *
 * @param chatId The ID of the chat.
 * @param currentUserId The ID of the current user.
 * @returns The chat details or null if the chat doesn't exist.
 */
export const getChatDetails = async (
    chatId: string,
    currentUserId: string,
): Promise<ChatDetail | null> => {
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
        return null;
    }

    const chatData = chatSnap.data();

    // Fetch messages for the chat
    const messagesRef = collection(chatRef, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const messagesSnapshot = await getDocs(q);

    const messages: Message[] = messagesSnapshot.docs.map((doc) => {
        const msgData = doc.data();
        return {
            id: doc.id,
            senderId: msgData.senderId,
            text: msgData.text,
            timestamp: (msgData.timestamp as Timestamp).toDate().toLocaleTimeString(),
            self: msgData.senderId === currentUserId,
        };
    });

    // Get the other participant's details
    const otherParticipantId = chatData.participants.find(
        (p: string) => p !== currentUserId,
    );
    const otherParticipantDetails = chatData.participantDetails[otherParticipantId];

    return {
        id: chatId,
        name: otherParticipantDetails?.displayName || 'Unknown User',
        avatar: otherParticipantDetails?.photoURL || '',
        messages,
        type: 'user', // Assuming one-on-one chats
    };
};

/**
 * Sends a message in a chat.
 *
 * @param chatId The ID of the chat.
 * @param message The message to send.
 * @returns The new message object.
 */
export const sendMessage = async (
    chatId: string,
    message: Omit<Message, 'id' | 'timestamp' | 'self'>,
): Promise<Message> => {
    const chatRef = doc(db, 'chats', chatId);
    const messagesRef = collection(chatRef, 'messages');

    // Add the message to the messages subcollection
    const newMessageRef = await addDoc(messagesRef, {
        ...message,
        timestamp: serverTimestamp(),
    });

    // Update the last message on the chat document
    await setDoc(
        chatRef,
        {
            lastMessage: message.text,
            lastMessageTimestamp: serverTimestamp(),
        },
        { merge: true },
    );

    const newMessageSnap = await getDoc(newMessageRef);
    const newMessageData = newMessageSnap.data();

    return {
        id: newMessageSnap.id,
        senderId: newMessageData?.senderId,
        text: newMessageData?.text,
        timestamp: (newMessageData?.timestamp as Timestamp)
            .toDate()
            .toLocaleTimeString(),
        self: true, // The message is always sent by the current user
    };
};

/**
 * Marks messages in a chat as read.
 * This is a placeholder and would require a more complex implementation
 * to track unread messages per user.
 *
 * @param chatId The ID of the chat.
 * @param userId The ID of the user.
 */
export const markMessagesAsRead = async (
    chatId: string,
    userId: string,
): Promise<void> => {
    // In a real application, you would update a 'readBy' field in the message documents
    // or a 'lastReadTimestamp' in the chat document for each user.
    console.log(`Messages in chat ${chatId} marked as read for user ${userId}`);
};
