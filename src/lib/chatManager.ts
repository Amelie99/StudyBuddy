
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    query,
    where,
    Timestamp,
    serverTimestamp,
    setDoc,
    orderBy,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { AppUser, Conversation, Message, ChatDetail } from '@/lib/types';

/**
 * Creates a new chat between the current user and another user, or returns the existing one.
 *
 * @param currentUser The current user.
 * @param otherUser The user to create a chat with.
 * @returns The ID of the chat.
 */
export const createChatWithUser = async (
    currentUser: AppUser,
    otherUser: AppUser,
): Promise<string> => {
    // Create a unique, predictable chat ID by sorting the user UIDs.
    const chatID = [currentUser.uid, otherUser.uid].sort().join('_');
    const chatRef = doc(db, 'chats', chatID);
    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
        // The chat already exists, so we can just return its ID.
        return chatSnap.id;
    }

    // The chat doesn't exist, so create it.
    await setDoc(chatRef, {
        participants: [currentUser.uid, otherUser.uid],
        lastMessage: '',
        lastMessageTimestamp: serverTimestamp(),
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

    return chatRef.id;
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
    );

    const querySnapshot = await getDocs(q);

    const mappedConversations = querySnapshot.docs.map(doc => {
        const chat = doc.data();
        const otherParticipantId = chat.participants.find((p: string) => p !== userId);
        const otherParticipantDetails = chat.participantDetails?.[otherParticipantId] || {};
        const lastMessageTimestamp = chat.lastMessageTimestamp ? (chat.lastMessageTimestamp as Timestamp).toDate() : null;

        return {
             id: doc.id,
             name: otherParticipantDetails.displayName || 'Unknown User',
             avatar: otherParticipantDetails.photoURL || '',
             lastMessage: chat.lastMessage || '',
             timestamp: lastMessageTimestamp ? lastMessageTimestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '',
             unread: 0,
             _sort_timestamp: lastMessageTimestamp || new Date(0)
        };
    });

    mappedConversations.sort((a, b) => b._sort_timestamp.getTime() - a._sort_timestamp.getTime());

    return mappedConversations.map(({ _sort_timestamp, ...rest }) => rest);
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

    const messagesRef = collection(chatRef, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const messagesSnapshot = await getDocs(q);

    const messages: Message[] = messagesSnapshot.docs.map((doc) => {
        const msgData = doc.data();
        const timestamp = msgData.timestamp ? (msgData.timestamp as Timestamp).toDate() : new Date();
        return {
            id: doc.id,
            senderId: msgData.senderId,
            text: msgData.text,
            timestamp: timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
            self: msgData.senderId === currentUserId,
        };
    });

    const otherParticipantId = chatData.participants.find(
        (p: string) => p !== currentUserId,
    );
    const otherParticipantDetails = chatData.participantDetails[otherParticipantId];

    return {
        id: chatId,
        name: otherParticipantDetails?.displayName || 'Unknown User',
        avatar: otherParticipantDetails?.photoURL || '',
        messages,
        type: 'user',
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

    const newMessageRef = await addDoc(messagesRef, {
        ...message,
        timestamp: serverTimestamp(),
    });

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
    const timestamp = newMessageData?.timestamp ? (newMessageData.timestamp as Timestamp).toDate() : new Date();


    return {
        id: newMessageSnap.id,
        senderId: newMessageData?.senderId,
        text: newMessageData?.text,
        timestamp: timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        self: true,
    };
};
