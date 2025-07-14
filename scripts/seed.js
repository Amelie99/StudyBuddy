
const admin = require('firebase-admin');
const serviceAccount = require('./studybuddy-haw-4vdjx-firebase-adminsdk-fbsvc-d6f00db95e.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const mockUsers = [
    {
      uid: 'mock-user-id-max.mustermann',
      email: 'max.mustermann@stud.haw-landshut.de',
      displayName: 'Max Mustermann',
      photoURL: 'https://i.imgur.com/8b2434u.jpeg',
      profileComplete: true,
      studiengang: 'Informatik',
      semester: '4',
      ueberMich: "Suche jemanden, um komplexe Algorithmen zu besprechen und mich auf die Klausur in 'Software Engineering' vorzubereiten.",
      lerninteressen: ['Klausurvorbereitung', 'Tiefgehendes Verständnis'],
      lernstil: 'Durch Übung',
      kurse: ['Software Engineering', 'Datenbanken II', 'Theoretische Informatik'],
      verfuegbarkeit: ['wochentags', 'abends'],
    },
    {
      uid: '2',
      email: 'david.meier@stud.haw-landshut.de',
      displayName: 'David Meier',
      photoURL: 'https://i.imgur.com/ZiKvLxU.jpeg',
      profileComplete: true,
      studiengang: 'Master Elektrotechnik',
      semester: '2',
      ueberMich: 'Ich bin David, 25, und suche einen Lernpartner für Schaltungstechnik. Ich lerne am besten durch visuelle Beispiele.',
      lerninteressen: ['Projektarbeit', 'Hausaufgaben'],
      lernstil: 'Visuell',
      kurse: ['Schaltungstechnik', 'Digitale Signalverarbeitung'],
      verfuegbarkeit: ['wochenende', 'nachmittags'],
    },
    {
      uid: '3',
      email: 'anna.schmidt@stud.haw-landshut.de',
      displayName: 'Anna Schmidt',
      photoURL: 'https://i.imgur.com/4bC3Xf8.jpeg',
      profileComplete: true,
      studiengang: 'Wirtschaftsinformatik',
      semester: '6',
      ueberMich: 'Hallo! Ich bin Anna und bereite mich auf meine Bachelorarbeit vor. Ich suche jemanden für gegenseitiges Korrekturlesen und Motivation.',
      lerninteressen: ['Abschlussarbeit', 'Projekte'],
      lernstil: 'Diskussion',
      kurse: ['Data Warehousing', 'IT-Projektmanagement'],
      verfuegbarkeit: ['wochentags', 'abends'],
    },
    {
        uid: '4',
        email: 'julia.schneider@stud.haw-landshut.de',
        displayName: 'Julia Schneider',
        photoURL: 'https://i.imgur.com/4bC3Xf8.jpeg',
        profileComplete: true,
        studiengang: 'Wirtschaftsinformatik',
        semester: '6',
        ueberMich: 'Hallo! Ich bin Julia und bereite mich auf meine Bachelorarbeit vor. Ich suche jemanden für gegenseitiges Korrekturlesen und Motivation.',
        lerninteressen: ['Abschlussarbeit', 'Projekte'],
        lernstil: 'Diskussion',
        kurse: ['Data Warehousing', 'IT-Projektmanagement'],
        verfuegbarkeit: ['wochentags', 'abends'],
      },
      {
        uid: '5',
        email: 'matthias.huber@stud.haw-landshut.de',
        displayName: 'Matthias Huber',
        photoURL: 'https://i.imgur.com/4bC3Xf8.jpeg',
        profileComplete: true,
        studiengang: 'Wirtschaftsinformatik',
        semester: '6',
        ueberMich: 'Hallo! Ich bin Matthias und bereite mich auf meine Bachelorarbeit vor. Ich suche jemanden für gegenseitiges Korrekturlesen und Motivation.',
        lerninteressen: ['Abschlussarbeit', 'Projekte'],
        lernstil: 'Diskussion',
        kurse: ['Data Warehousing', 'IT-Projektmanagement'],
        verfuegbarkeit: ['wochentags', 'abends'],
      }
  ];

const seedAuth = async () => {
    const promises = mockUsers.map(user => {
        return admin.auth().createUser({
            uid: user.uid,
            email: user.email,
            password: 'password', // Set a default password
            displayName: user.displayName,
            photoURL: user.photoURL,
        })
        .then((userRecord) => {
            console.log('Successfully created new user:', userRecord.uid);
        })
        .catch((error) => {
            if (error.code !== 'auth/uid-already-exists' && error.code !== 'auth/email-already-exists') {
                console.log('Error creating new user:', error);
            }
        });
    });
    await Promise.all(promises);
};

const seedFirestore = async () => {
  const promises = mockUsers.map(user => {
    return db.collection('users').doc(user.uid).set(user, { merge: true })
      .then(() => {
        console.log('Successfully written user to Firestore:', user.uid);
      })
      .catch((error) => {
        console.error('Error writing user to Firestore:', error);
      });
  });
  await Promise.all(promises);
};

const main = async () => {
  await seedAuth();
  await seedFirestore();
  console.log('Seed script finished.');
  process.exit(0);
};

main();
