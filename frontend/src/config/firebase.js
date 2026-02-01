import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCKRKklyIqDv7dtetlkRHvJ3u02Jac7hfo",
    authDomain: "gestion-etatcivil-tchad.firebaseapp.com",
    projectId: "gestion-etatcivil-tchad",
    storageBucket: "gestion-etatcivil-tchad.firebasestorage.app",
    messagingSenderId: "474357043996",
    appId: "1:474357043996:web:f68077ba5ff8bdb582a0d9",
    measurementId: "G-SDE1KJ6T57"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

export { storage, db };
