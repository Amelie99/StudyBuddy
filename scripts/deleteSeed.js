
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./studybuddy-haw-4vdjx-firebase-adminsdk-fbsvc-d6f00db95e.json');

// Initialize Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function deleteCollection(collectionPath, batchSize) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

async function clearData() {
    console.log('--- Starting Data Deletion ---');

    // Delete all chats
    console.log('Deleting chats...');
    await deleteCollection('chats', 50);
    console.log('Chats deleted.');

    // Delete all buddies subcollections
    console.log('Deleting buddy subcollections...');
    const usersSnapshot = await db.collection('users').get();
    for (const userDoc of usersSnapshot.docs) {
        const subcollectionPath = `users/${userDoc.id}/buddies`;
        console.log(`- Deleting ${subcollectionPath}`);
        await deleteCollection(subcollectionPath, 50);
    }
    console.log('Buddy subcollections deleted.');

    console.log('--- Data Deletion Completed Successfully ---');
}

clearData();
