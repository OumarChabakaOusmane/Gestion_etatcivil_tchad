const { db } = require('../config/firebase');
const { Timestamp } = require('firebase-admin/firestore');

class Naissance {
  /**
   * Crée un nouvel acte de naissance
   * @param {Object} data - Les données de l'acte de naissance
   * @returns {Promise<Object>} L'acte de naissance créé avec son ID
   */
  static async create(data) {
    try {
      const now = Timestamp.now();
      const naissanceData = {
        // Enfant
        nomEnfant: data.nomEnfant,
        prenomEnfant: data.prenomEnfant,
        sexe: data.sexe,
        dateNaissance: data.dateNaissance,
        heureNaissance: data.heureNaissance,
        lieuNaissance: data.lieuNaissance,
        
        // Père
        pere: {
          nom: data.nomPere,
          dateNaissance: data.dateNaissancePere,
          lieuNaissance: data.lieuNaissancePere,
          nationalite: data.nationalitePere,
          profession: data.professionPere
        },
        
        // Mère
        mere: {
          nom: data.nomMere,
          dateNaissance: data.dateNaissanceMere,
          lieuNaissance: data.lieuNaissanceMere,
          nationalite: data.nationaliteMere,
          profession: data.professionMere
        },
        
        // Adresse
        adresse: {
          domicileParents: data.domicileParents
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

      const docRef = await db.collection('naissances').add(naissanceData);
      return { id: docRef.id, ...naissanceData };
    } catch (error) {
      console.error('Erreur lors de la création de l\'acte de naissance:', error);
      throw error;
    }
  }

  /**
   * Trouve un acte de naissance par son ID
   * @param {string} id - L'ID de l'acte de naissance
   * @returns {Promise<Object|null>} L'acte de naissance ou null si non trouvé
   */
  static async findById(id) {
    try {
      const doc = await db.collection('naissances').doc(id).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Erreur lors de la recherche de l\'acte de naissance:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les actes de naissance
   * @param {Object} options - Options de pagination/filtrage
   * @param {number} options.limit - Nombre maximum de résultats à retourner
   * @param {string} options.startAfter - ID du document à partir duquel commencer
   * @returns {Promise<Array>} Liste des actes de naissance
   */
  static async findAll({ limit = 10, startAfter = null } = {}) {
    try {
      let query = db.collection('naissances')
        .orderBy('admin.createdAt', 'desc')
        .limit(limit);
      
      if (startAfter) {
        const startAfterDoc = await db.collection('naissances').doc(startAfter).get();
        query = query.startAfter(startAfterDoc);
      }
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des actes de naissance:', error);
      throw error;
    }
  }

  /**
   * Met à jour un acte de naissance
   * @param {string} id - L'ID de l'acte de naissance
   * @param {Object} data - Les données à mettre à jour
   * @returns {Promise<Object>} L'acte de naissance mis à jour
   */
  static async update(id, data) {
    try {
      const updateData = {
        ...data,
        'admin.updatedAt': Timestamp.now()
      };
      
      await db.collection('naissances').doc(id).update(updateData);
      return this.findById(id);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'acte de naissance:', error);
      throw error;
    }
  }

  /**
   * Supprime un acte de naissance
   * @param {string} id - L'ID de l'acte de naissance à supprimer
   * @returns {Promise<boolean>} True si la suppression a réussi
   */
  static async delete(id) {
    try {
      await db.collection('naissances').doc(id).delete();
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'acte de naissance:', error);
      throw error;
    }
  }
}

module.exports = Naissance;