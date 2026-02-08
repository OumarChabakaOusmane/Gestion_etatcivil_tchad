const { db } = require('../config/firebase');
const { Timestamp } = require('firebase-admin/firestore');

class Mariage {
  /**
   * Crée un nouvel acte de mariage
   * @param {Object} data - Les données de l'acte de mariage
   * @returns {Promise<Object>} L'acte de mariage créé avec son ID
   */
  static async create(data) {
    try {
      const now = Timestamp.now();
      const mariageData = {
        // Époux
        // Époux
        epoux: {
          nom: data.nomEpoux,
          prenom: data.prenomEpoux,
          dateNaissance: data.dateNaissanceEpoux,
          lieuNaissance: data.lieuNaissanceEpoux,
          nationalite: data.nationaliteEpoux,
          profession: data.professionEpoux,
          domicile: data.domicileEpoux,
          temoin1: data.temoin1Epoux || null,
          temoin2: data.temoin2Epoux || null,
          signature: data.signatureEpoux || null
        },

        // Épouse
        epouse: {
          nom: data.nomEpouse,
          prenom: data.prenomEpouse,
          dateNaissance: data.dateNaissanceEpouse,
          lieuNaissance: data.lieuNaissanceEpouse,
          nationalite: data.nationaliteEpouse,
          profession: data.professionEpouse,
          domicile: data.domicileEpouse,
          temoin1: data.temoin1Epouse || null,
          temoin2: data.temoin2Epouse || null,
          signature: data.signatureEpouse || null
        },

        // Mariage
        mariage: {
          date: data.dateMariage,
          lieu: data.lieuMariage,
          regimeMatrimonial: data.regimeMatrimonial,
          dot: {
            montant: data.dotMontant || null,
            conditions: data.dotConditions || null
          }
        },

        // Admin
        admin: {
          numeroActe: data.numeroActe,
          dateDeclaration: data.dateDeclaration || now,
          creePar: data.creePar,
          createdAt: now,
          updatedAt: now
        }
      };

      const docRef = await db.collection('mariages').add(mariageData);
      return { id: docRef.id, ...mariageData };
    } catch (error) {
      console.error('Erreur lors de la création de l\'acte de mariage:', error);
      throw error;
    }
  }

  /**
   * Trouve un acte de mariage par son ID
   * @param {string} id - L'ID de l'acte de mariage
   * @returns {Promise<Object|null>} L'acte de mariage ou null si non trouvé
   */
  static async findById(id) {
    try {
      const doc = await db.collection('mariages').doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Erreur lors de la recherche de l\'acte de mariage:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les actes de mariage
   * @param {Object} options - Options de pagination/filtrage
   * @param {number} options.limit - Nombre maximum de résultats à retourner
   * @param {string} options.startAfter - ID du document à partir duquel commencer
   * @returns {Promise<Array>} Liste des actes de mariage
   */
  static async findAll({ limit = 10, startAfter = null } = {}) {
    try {
      let query = db.collection('mariages')
        .orderBy('admin.createdAt', 'desc')
        .limit(limit);

      if (startAfter) {
        const startAfterDoc = await db.collection('mariages').doc(startAfter).get();
        query = query.startAfter(startAfterDoc);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des actes de mariage:', error);
      throw error;
    }
  }

  /**
   * Met à jour un acte de mariage
   * @param {string} id - L'ID de l'acte de mariage
   * @param {Object} data - Les données à mettre à jour
   * @returns {Promise<Object>} L'acte de mariage mis à jour
   */
  static async update(id, data) {
    try {
      const updateData = {
        ...data,
        'admin.updatedAt': Timestamp.now()
      };

      await db.collection('mariages').doc(id).update(updateData);
      return this.findById(id);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'acte de mariage:', error);
      throw error;
    }
  }

  /**
   * Supprime un acte de mariage
   * @param {string} id - L'ID de l'acte de mariage à supprimer
   * @returns {Promise<boolean>} True si la suppression a réussi
   */
  static async delete(id) {
    try {
      await db.collection('mariages').doc(id).delete();
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'acte de mariage:', error);
      throw error;
    }
  }
}

module.exports = Mariage;