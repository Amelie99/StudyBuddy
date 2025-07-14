
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
    deleteDoc,
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
        lastMessage: 'Chat erstellt!',
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
 * Retrieves the conversations for a given user, including all messages for searching.
 *
 * @param userId The ID of the user.
 * @returns An array of conversations with full message history.
 */
export const getConversationsForUser = async (
    userId: string,
): Promise<Conversation[]> => {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', userId));

    const querySnapshot = await getDocs(q);

    const conversationPromises = querySnapshot.docs.map(async (docSnap) => {
        const chat = docSnap.data();
        
        // Fetch all messages for this chat
        const messagesRef = collection(doc(db, 'chats', docSnap.id), 'messages');
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
        const messagesSnapshot = await getDocs(messagesQuery);
        const messages: Message[] = messagesSnapshot.docs.map(msgDoc => {
            const msgData = msgDoc.data();
            const timestamp = msgData.timestamp instanceof Timestamp ? msgData.timestamp.toDate() : new Date();
            return {
                id: msgDoc.id,
                senderId: msgData.senderId,
                text: msgData.text,
                timestamp: timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
                self: msgData.senderId === userId,
            };
        });

        const otherParticipantId = chat.participants.find((p: string) => p !== userId);
        const otherParticipantDetails = chat.participantDetails?.[otherParticipantId] || {};
        const lastMessageTimestamp = chat.lastMessageTimestamp instanceof Timestamp ? chat.lastMessageTimestamp.toDate() : null;

        return {
             id: docSnap.id,
             name: otherParticipantDetails.displayName || 'Unknown User',
             avatar: otherParticipantDetails.photoURL || '',
             lastMessage: chat.lastMessage || '',
             timestamp: lastMessageTimestamp ? lastMessageTimestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '',
             unread: 0,
             messages: messages, // Attach all messages
             _sort_timestamp: lastMessageTimestamp || new Date(0)
        };
    });

    const mappedConversations = await Promise.all(conversationPromises);

    // Sort conversations by the timestamp of the last message
    mappedConversations.sort((a, b) => b._sort_timestamp.getTime() - a._sort_timestamp.getTime());

    return mappedConversations.map(({ _sort_timestamp, ...rest }) => rest);
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
): Promise<void> => {
    const chatRef = doc(db, 'chats', chatId);
    const messagesRef = collection(chatRef, 'messages');

    await addDoc(messagesRef, {
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
};

/**
 * Deletes a message from a chat.
 *
 * @param chatId The ID of the chat.
 * @param messageId The ID of the message to delete.
 */
export const deleteMessage = async (chatId: string, messageId: string): Promise<void> => {
    const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
    await deleteDoc(messageRef);
    
    // Optional: After deleting, you might want to update the 'lastMessage' of the chat
    // to the new latest message. This would involve querying for the new last message.
    // For simplicity, we'll omit this for now. If the deleted message was the last one,
    // the chat preview will still show it until a new message is sent.
};


export const markMessagesAsRead = (chatId: string, userId: string) => {
    // This is where you might update a 'readBy' array on messages,
    // or an 'unreadCount' on the chat document for the specific user.
    // For now, we'll just log it.
    console.log(`Marking messages as read for user ${userId} in chat ${chatId}`);
};
