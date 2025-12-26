const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');
const { collection, addDoc, getDocs, query, where, getFirestore } = require('firebase/firestore');

class User {
  static collection = collection(db, 'users');

  static async create(userData) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const q = query(
        this.collection,
        where('email', '==', userData.email)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      // Hasher le mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Créer l'utilisateur dans Firestore
      const userRef = await addDoc(this.collection, {
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'user',
        telephone: userData.telephone || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return { id: userRef.id, ...userData, password: undefined };
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
const q = query(
        this.collection,
        where('email', '==', email)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
