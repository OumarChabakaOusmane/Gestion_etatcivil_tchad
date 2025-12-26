const admin = require("firebase-admin");
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, addDoc, query, where } = require("firebase/firestore");
const serviceAccount = require("../serviceAccountKey.json");

// Initialisation de l'admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialisation du client SDK
const firebaseConfig = {
  // Votre configuration Firebase va ici
  // (les mêmes informations que dans votre serviceAccountKey.json)
  projectId: serviceAccount.project_id,
  // ... autres configurations nécessaires
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = {
  admin,
  db,
  firestore: {
    collection,
    getDocs,
    addDoc,
    query,
    where
  }
};
