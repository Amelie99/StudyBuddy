
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./studybuddy-haw-4vdjx-firebase-adminsdk-fbsvc-d6f00db95e.json');

// Initialize Firebase Admin SDK
initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();

// --- Main Seeding Function ---
async function seedChats() {
    console.log('--- Starting Chat Seeding ---');

    try {
        // 1. Get all users
        const usersSnapshot = await db.collection('users').get();
        const users = usersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        if (users.length < 2) {
            console.log(
                'Not enough users to create chats. Need at least 2.',
            );
            return;
        }

        console.log(`Found ${users.length} users.`);

        // 2. Create a chat between the first two users
        const userA = users[0];
        const userB = users[1];

        const chatRef = await db.collection('chats').add({
            participants: [userA.id, userB.id],
            participantDetails: {
                [userA.id]: {
                    displayName: userA.displayName,
                    photoURL: userA.photoURL,
                },
                [userB.id]: {
                    displayName: userB.displayName,
                    photoURL: userB.photoURL,
                },
            },
            lastMessage: 'Hallo! Wie geht es dir?',
            lastMessageTimestamp: new Date(),
        });

        console.log(`Created chat ${chatRef.id} between ${userA.displayName} and ${userB.displayName}`);

        // 3. Add some messages to the chat
        const messagesRef = db.collection('chats').doc(chatRef.id).collection('messages');
        await messagesRef.add({
            senderId: userA.id,
            text: 'Hallo! Wie geht es dir?',
            timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        });
        await messagesRef.add({
            senderId: userB.id,
            text: 'Mir geht es gut, danke! Und dir?',
            timestamp: new Date(Date.now() - 1000 * 60 * 4), // 4 minutes ago
        });
        await messagesRef.add({
            senderId: userA.id,
            text: 'Auch gut! Hast du Lust, morgen zusammen zu lernen?',
            timestamp: new Date(Date.now() - 1000 * 60 * 3), // 3 minutes ago
        });

        console.log('Added 3 messages to the chat.');

        // 4. Create another chat for the third user with the first user
        if (users.length > 2) {
            const userC = users[2];
            const chatRef2 = await db.collection('chats').add({
                participants: [userA.id, userC.id],
                participantDetails: {
                    [userA.id]: {
                        displayName: userA.displayName,
                        photoURL: userA.photoURL,
                    },
                    [userC.id]: {
                        displayName: userC.displayName,
                        photoURL: userC.photoURL,
                    },
                },
                lastMessage: 'Hey, hast du die Vorlesungsfolien?',
                lastMessageTimestamp: new Date(),
            });

            console.log(`Created chat ${chatRef2.id} between ${userA.displayName} and ${userC.displayName}`);

            // Add messages to the second chat
            const messagesRef2 = db.collection('chats').doc(chatRef2.id).collection('messages');
            await messagesRef2.add({
                senderId: userC.id,
                text: 'Hey, hast du die Vorlesungsfolien?',
                timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
            });
        }

        console.log('--- Chat Seeding Completed Successfully ---');
    } catch (error) {
        console.error('--- Error during Chat Seeding ---');
        console.error(error);
    }
}

// --- Helper to get a random user ---
function getRandomUser(users, excludeId = null) {
    const availableUsers = users.filter((u) => u.id !== excludeId);
    if (availableUsers.length === 0) return null;
    return availableUsers[Math.floor(Math.random() * availableUsers.length)];
}

seedChats();
