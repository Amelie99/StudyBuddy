
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAeM97YjvgnMs6RZli074X1w7iSC49J330",
  authDomain: "studybuddy-haw-4vdjx.firebaseapp.com",
  projectId: "studybuddy-haw-4vdjx",
  storageBucket: "studybuddy-haw-4vdjx.appspot.com",
  messagingSenderId: "394663634349",
  appId: "1:394663634349:web:00277a86931528391a2d24"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
