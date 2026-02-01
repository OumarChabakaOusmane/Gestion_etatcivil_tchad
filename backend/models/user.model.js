const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');

class User {
  static collectionName = 'users';

  static async create(userData) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const userRef = db.collection(this.collectionName);
      const snapshot = await userRef.where('email', '==', userData.email).get();

      if (!snapshot.empty) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      // Hasher le mot de passe (cost factor 8 for better performance)
      const salt = await bcrypt.genSalt(8);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Créer l'utilisateur
      const newUser = {
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'user',
        telephone: userData.telephone || '',
        photo: userData.photo || '',
        isVerified: false, // Default to false
        otpCode: userData.otpCode || null,
        otpExpires: userData.otpExpires || null,
        expoPushToken: userData.expoPushToken || null, // [NEW] Token pour les notifications
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await userRef.add(newUser);

      return { id: docRef.id, ...newUser, password: undefined };
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const snapshot = await db.collection(this.collectionName)
        .where('email', '==', email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw error;
    }
  }

  static async update(userId, data) {
    try {
      await db.collection(this.collectionName).doc(userId).update({
        ...data,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const snapshot = await db.collection(this.collectionName).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), password: undefined }));
    } catch (error) {
      throw error;
    }
  }

  static async findByRole(role) {
    try {
      const snapshot = await db.collection(this.collectionName).where('role', '==', role).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), password: undefined }));
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const doc = await db.collection(this.collectionName).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data(), password: undefined };
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      await db.collection(this.collectionName).doc(id).delete();
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async findByResetToken(token) {
    try {
      const snapshot = await db.collection(this.collectionName)
        .where('resetPasswordToken', '==', token)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const userData = doc.data();

      // Vérifier l'expiration ici pour éviter de créer un index composite Firestore
      if (userData.resetPasswordExpire && userData.resetPasswordExpire < Date.now()) {
        console.log('Token expiré pour :', userData.email);
        return null;
      }

      return { id: doc.id, ...userData };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
