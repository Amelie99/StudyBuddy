
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin SDK
const serviceAccount = require('./studybuddy-haw-4vdjx-firebase-adminsdk-fbsvc-d6f00db95e.json');
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

// --- USER DATA ---
const users = [
    {
        uid: 'jXo8P8Q6yYg4Z2n2V5N2fW1t1Y23',
        email: 'david.meier@stud.haw-landshut.de',
        password: 'password123',
        displayName: 'David Meier',
        photoURL: 'https://i.imgur.com/8bFhU43.jpeg',
        studiengang: 'Wirtschaftsinformatik',
        bio: 'Suche Lernpartner für SE und DB.',
        interessen: ['Webentwicklung', 'Datenbanken', 'Fußball'],
        profileComplete: true,
    },
    {
        uid: 'kL9qRstUvWxYz3o3W6P3gX2u2Z34',
        email: 'anna.schmidt@stud.haw-landshut.de',
        password: 'password123',
        displayName: 'Anna Schmidt',
        photoURL: 'https://i.imgur.com/5uDhl3s.jpeg',
        studiengang: 'Soziale Arbeit',
        bio: 'Engagiert im AStA und immer für einen Kaffee zu haben.',
        interessen: ['Psychologie', 'Soziologie', 'Lesen'],
        profileComplete: true,
    },
    {
        uid: 'mN0sTuVwXyZa1b1X7Q4hY3v3A45',
        email: 'julia.schneider@stud.haw-landshut.de',
        password: 'password123',
        displayName: 'Julia Schneider',
        photoURL: 'https://i.imgur.com/PKtZX0C.jpeg',
        studiengang: 'Wirtschaftsinformatik',
        bio: 'Begeisterte Programmiererin und auf der Suche nach einem Team für das nächste Hackathon.',
        interessen: ['JavaScript', 'React', 'Node.js', 'Gaming'],
        profileComplete: true,
    },
    {
        uid: 'oP1tUvWxYzZa2b2Y8R5iZ4w4B56',
        email: 'matthias.huber@stud.haw-landshut.de',
        password: 'password123',
        displayName: 'Matthias Huber',
        photoURL: 'https://i.imgur.com/t05wynC.jpeg',
        studiengang: 'Maschinenbau',
        bio: 'Tüftler und Bastler. Baue in meiner Freizeit an meinem 3D-Drucker.',
        interessen: ['CAD', '3D-Druck', 'Mechanik'],
        profileComplete: true,
    },
    {
        uid: 'qR2uVwXyZa3b3Z9S6jA0x5y5C67',
        email: 'max.mustermann@stud.haw-landshut.de',
        password: 'password123',
        displayName: 'Max Mustermann',
        photoURL: 'https://i.imgur.com/D267ZyT.jpeg',
        studiengang: 'Informatik',
        bio: 'Der klassische Informatik-Student.',
        interessen: ['Java', 'Python', 'Linux'],
        profileComplete: true,
    }
];

// --- Buddy & Chat Definitions ---
const connections = [
    { userA: 'david.meier@stud.haw-landshut.de', userB: 'anna.schmidt@stud.haw-landshut.de', messages: [
        { sender: 'david.meier@stud.haw-landshut.de', text: "Hey Anna, wie läuft's mit der Prüfungsvorbereitung?" },
        { sender: 'anna.schmidt@stud.haw-landshut.de', text: "Ganz gut, aber das Thema ist echt trocken. Wollen wir mal zusammen lernen?" }
    ] },
    { userA: 'david.meier@stud.haw-landshut.de', userB: 'julia.schneider@stud.haw-landshut.de', messages: [
        { sender: 'julia.schneider@stud.haw-landshut.de', text: "Hi David, hast du die Folien von der letzten Vorlesung?" }
    ] },
    { userA: 'anna.schmidt@stud.haw-landshut.de', userB: 'matthias.huber@stud.haw-landshut.de', messages: [
        { sender: 'matthias.huber@stud.haw-landshut.de', text: "Hey Anna, du bist doch im AStA, oder? Ich hab da mal ne Frage..." },
        { sender: 'anna.schmidt@stud.haw-landshut.de', text: "Klar, schieß los! Worum geht's denn?" },
        { sender: 'matthias.huber@stud.haw-landshut.de', text: "Es geht um die Anrechnung von einem Praktikum. Der Prof stellt sich quer." }
    ] },
    { userA: 'julia.schneider@stud.haw-landshut.de', userB: 'max.mustermann@stud.haw-landshut.de', messages: [
        { sender: 'julia.schneider@stud.haw-landshut.de', text: "Hey Max, dein Name kommt mir bekannt vor. Hast du beim letzten Hackathon mitgemacht?" },
        { sender: 'max.mustermann@stud.haw-landshut.de', text: "Hey Julia, ne, leider nicht. Hatte zu viel mit Java zu tun. Aber ich hab dein Projekt gesehen, sah echt cool aus!" },
        { sender: 'julia.schneider@stud.haw-landshut.de', text: "Danke! Sag Bescheid, wenn du mal wieder an was mit Node.js arbeitest. Bin immer für Projekte zu haben." }
    ]},
    { userA: 'matthias.huber@stud.haw-landshut.de', userB: 'max.mustermann@stud.haw-landshut.de', messages: [
        { sender: 'max.mustermann@stud.haw-landshut.de', text: "Hi Matthias, cooler 3D-Drucker auf deinem Profilbild! Was druckst du denn so?" },
        { sender: 'matthias.huber@stud.haw-landshut.de', text: "Hey Max, danke! Meistens Ersatzteile oder Prototypen für die Uni. Aber auch einfach nur zum Spaß. Du bist doch im Bereich Webdev unterwegs, oder?" },
        { sender: 'max.mustermann@stud.haw-landshut.de', text: "Genau. Wenn du mal ne Website oder so für deine Projekte brauchst, sag einfach Bescheid!" }
    ]},
];


// --- Seeding Functions ---

async function seedUsers() {
    console.log('Seeding users...');
    for (const user of users) {
        try {
            // Create user in Firebase Auth
            await auth.createUser({
                uid: user.uid,
                email: user.email,
                password: user.password,
                displayName: user.displayName,
                photoURL: user.photoURL,
            });

            // Create user document in Firestore
            const { uid, email, displayName, photoURL, studiengang, bio, interessen, profileComplete } = user;
            await db.collection('users').doc(uid).set({
                uid,
                email,
                displayName,
                photoURL,
                studiengang,
                bio,
                interessen,
                profileComplete
            });
        } catch (error) {
            if (error.code === 'auth/uid-already-exists' || error.code === 'auth/email-already-exists') {
                // User already exists, which is fine
            } else {
                console.error('Error seeding user:', error);
            }
        }
    }
    console.log('User seeding complete.');
}

async function seedBuddiesAndChats() {
    console.log('Seeding buddies and chats...');
    for (const conn of connections) {
        const userA = users.find(u => u.email === conn.userA);
        const userB = users.find(u => u.email === conn.userB);

        if (!userA || !userB) continue;

        // --- Create Reciprocal Buddy Relationship ---
        const buddyRefForA = db.collection('users').doc(userA.uid).collection('buddies').doc(userB.uid);
        await buddyRefForA.set({
            id: userB.uid,
            name: userB.displayName,
            course: userB.studiengang,
            avatar: userB.photoURL
        });

        const buddyRefForB = db.collection('users').doc(userB.uid).collection('buddies').doc(userA.uid);
        await buddyRefForB.set({
            id: userA.uid,
            name: userA.displayName,
            course: userA.studiengang,
            avatar: userA.photoURL
        });


        // --- Create Chat and Messages ---
        const chatID = [userA.uid, userB.uid].sort().join('_');
        const chatRef = db.collection('chats').doc(chatID);

        await chatRef.set({
            participants: [userA.uid, userB.uid],
            participantDetails: {
                [userA.uid]: { displayName: userA.displayName, photoURL: userA.photoURL },
                [userB.uid]: { displayName: userB.displayName, photoURL: userB.photoURL },
            },
            lastMessage: conn.messages.length > 0 ? conn.messages[conn.messages.length - 1].text : "Noch keine Nachrichten",
            lastMessageTimestamp: new Date(),
        });

        const messagesRef = chatRef.collection('messages');
        for (const message of conn.messages) {
            const sender = users.find(u => u.email === message.sender);
            if (sender) {
                await messagesRef.add({
                    senderId: sender.uid,
                    text: message.text,
                    timestamp: new Date(Date.now() - Math.random() * 10000000), // Random timestamp in the past
                });
            }
        }
    }
    console.log('Buddy and chat seeding complete.');
}


async function main() {
    console.log('--- Starting Database Seeding ---');
    await seedUsers();
    await seedBuddiesAndChats();
    console.log('--- Seeding Completed Successfully ---');
}

main().catch(console.error);
