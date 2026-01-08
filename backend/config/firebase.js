const admin = require("firebase-admin");
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, addDoc, query, where } = require("firebase/firestore");
let serviceAccount;
try {
  serviceAccount = require("../serviceAccountKey.json");
  console.log("✅ serviceAccountKey.json chargé avec succès");
} catch (error) {
  console.warn("⚠️ ALERTE : Impossible de charger serviceAccountKey.json.");
  console.warn("   Raison :", error.message);
  console.warn("   Stack :", error.stack);

  // Utilisation de variables d'environnement comme fallback possible ou objet vide temporaire
  serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID || "demo-project",
    private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : "fake-key",
    client_email: process.env.FIREBASE_CLIENT_EMAIL || "demo@example.com"
  };
}

// Initialisation de l'admin SDK
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  console.log("🔥 Firebase Admin connecté");
} catch (error) {
  console.error("❌ Erreur init Firebase Admin:", error.message);
}

const db = admin.firestore();

module.exports = {
  admin,
  db
};
