const { db } = require('../config/firebase');
const { Timestamp } = require('firebase-admin/firestore');

class Deces {
    /**
     * Crée un nouvel acte de décès
     * @param {Object} data - Les données de l'acte de décès
     * @returns {Promise<Object>} L'acte de décès créé avec son ID
     */
    static async create(data) {
        try {
            const now = Timestamp.now();
            const decesData = {
                // Défunt
                defunt: {
                    nom: data.nomDefunt,
                    dateNaissance: data.dateNaissanceDefunt,
                    lieuNaissance: data.lieuNaissanceDefunt,
                    nationalite: data.nationaliteDefunt || null,
                    dateDeces: data.dateDeces,
                    lieuDeces: data.lieuDeces,
                    causeDeces: data.causeDeces || null
                },

                // Déclarant
                declarant: {
                    nom: data.nomDeclarant,
                    lienParente: data.lienParente
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

            const docRef = await db.collection('deces').add(decesData);
            return { id: docRef.id, ...decesData };
        } catch (error) {
            console.error('Erreur lors de la création de l\'acte de décès:', error);
            throw error;
        }
    }

    /**
     * Trouve un acte de décès par son ID
     * @param {string} id - L'ID de l'acte de décès
     * @returns {Promise<Object|null>} L'acte de décès ou null si non trouvé
     */
    static async findById(id) {
        try {
            const doc = await db.collection('deces').doc(id).get();

            if (!doc.exists) {
                return null;
            }

            return { id: doc.id, ...doc.data() };
        } catch (error) {
            console.error('Erreur lors de la recherche de l\'acte de décès:', error);
            throw error;
        }
    }

    /**
     * Récupère tous les actes de décès
     * @param {Object} options - Options de pagination/filtrage
     * @param {number} options.limit - Nombre maximum de résultats à retourner
     * @param {string} options.startAfter - ID du document à partir duquel commencer
     * @returns {Promise<Array>} Liste des actes de décès
     */
    static async findAll({ limit = 10, startAfter = null } = {}) {
        try {
            let query = db.collection('deces')
                .orderBy('admin.createdAt', 'desc')
                .limit(limit);

            if (startAfter) {
                const startAfterDoc = await db.collection('deces').doc(startAfter).get();
                query = query.startAfter(startAfterDoc);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des actes de décès:', error);
            throw error;
        }
    }

    /**
     * Met à jour un acte de décès
     * @param {string} id - L'ID de l'acte de décès
     * @param {Object} data - Les données à mettre à jour
     * @returns {Promise<Object>} L'acte de décès mis à jour
     */
    static async update(id, data) {
        try {
            const updateData = {
                ...data,
                'admin.updatedAt': Timestamp.now()
            };

            await db.collection('deces').doc(id).update(updateData);
            return this.findById(id);
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'acte de décès:', error);
            throw error;
        }
    }

    /**
     * Supprime un acte de décès
     * @param {string} id - L'ID de l'acte de décès à supprimer
     * @returns {Promise<boolean>} True si la suppression a réussi
     */
    static async delete(id) {
        try {
            await db.collection('deces').doc(id).delete();
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'acte de décès:', error);
            throw error;
        }
    }
}

module.exports = Deces;
