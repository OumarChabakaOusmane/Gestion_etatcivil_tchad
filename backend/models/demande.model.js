const { db } = require('../config/firebase');
const { Timestamp } = require('firebase-admin/firestore');

class Demande {
    /**
     * Crée une nouvelle demande
     * @param {Object} data - Les données de la demande
     * @returns {Promise<Object>} La demande créée avec son ID
     */
    static async create(data) {
        try {
            const now = Timestamp.now();
            const demandeData = {
                type: data.type, // 'naissance', 'mariage', 'deces'
                userId: data.userId,
                statut: 'en_attente', // 'en_attente', 'acceptee', 'rejetee'
                dateDemande: now,

                // Données spécifiques selon le type
                donnees: data.donnees,

                // Documents justificatifs (URLs Firebase Storage)
                documentIds: data.documentIds || [],

                // Référence vers l'acte créé (si accepté)
                acteId: null,

                // Motif de rejet (si rejeté)
                motifRejet: null,

                // Métadonnées
                createdAt: now,
                updatedAt: now
            };

            const docRef = await db.collection('demandes').add(demandeData);
            return { id: docRef.id, ...demandeData };
        } catch (error) {
            console.error('Erreur lors de la création de la demande:', error);
            throw error;
        }
    }

    /**
     * Trouve une demande par son ID
     * @param {string} id - L'ID de la demande
     * @returns {Promise<Object|null>} La demande ou null si non trouvée
     */
    static async findById(id) {
        try {
            const doc = await db.collection('demandes').doc(id).get();

            if (!doc.exists) {
                return null;
            }

            return { id: doc.id, ...doc.data() };
        } catch (error) {
            console.error('Erreur lors de la recherche de la demande:', error);
            throw error;
        }
    }

    /**
     * Récupère toutes les demandes d'un utilisateur avec pagination
     * @param {string} userId - L'ID de l'utilisateur
     * @param {Object} options - Options de filtrage et pagination
     * @returns {Promise<Object>} Liste des demandes et métadonnées
     */
    static async findByUserId(userId, { type = null, statut = null, page = 1, limit = 10 } = {}) {
        try {
            let query = db.collection('demandes')
                .where('userId', '==', userId);

            if (type) {
                query = query.where('type', '==', type);
            }

            if (statut) {
                query = query.where('statut', '==', statut);
            }

            const snapshot = await query.get();
            let demandes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Tri en mémoire pour éviter l'erreur d'index Firestore
            demandes.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return dateB - dateA;
            });

            // Pagination
            const totalCount = demandes.length;
            const totalPages = Math.ceil(totalCount / limit);
            const startIndex = (page - 1) * limit;
            const paginatedDemandes = demandes.slice(startIndex, startIndex + limit);

            return {
                demandes: paginatedDemandes,
                pagination: {
                    totalCount,
                    totalPages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des demandes de l\'utilisateur:', error);
            throw error;
        }
    }

    /**
     * Récupère toutes les demandes (admin) avec pagination
     * @param {Object} options - Options de pagination/filtrage
     * @returns {Promise<Object>} Liste des demandes et métadonnées
     */
    static async findAll({ page = 1, limit = 20, type = null, statut = null } = {}) {
        try {
            let query = db.collection('demandes');

            if (type) {
                query = query.where('type', '==', type);
            }

            if (statut) {
                query = query.where('statut', '==', statut);
            }

            const snapshot = await query.get();
            let demandes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Tri en mémoire
            demandes.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return dateB - dateA;
            });

            // Pagination
            const totalCount = demandes.length;
            const totalPages = Math.ceil(totalCount / limit);
            const startIndex = (page - 1) * limit;
            const paginatedDemandes = demandes.slice(startIndex, startIndex + limit);

            return {
                demandes: paginatedDemandes,
                pagination: {
                    totalCount,
                    totalPages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des demandes:', error);
            throw error;
        }
    }

    /**
     * Met à jour les données d'une demande
     * @param {string} id - L'ID de la demande
     * @param {Object} data - Les nouvelles données
     * @returns {Promise<Object>} La demande mise à jour
     */
    static async update(id, data) {
        try {
            const updateData = {
                ...data,
                updatedAt: Timestamp.now()
            };

            await db.collection('demandes').doc(id).update(updateData);
            return this.findById(id);
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la demande:', error);
            throw error;
        }
    }

    /**
     * Met à jour le statut d'une demande
     * @param {string} id - L'ID de la demande
     * @param {string} statut - Le nouveau statut ('acceptee' ou 'rejetee')
     * @param {Object} options - Options supplémentaires
     * @returns {Promise<Object>} La demande mise à jour
     */
    static async updateStatut(id, statut, { acteId = null, motifRejet = null } = {}) {
        try {
            const updateData = {
                statut,
                updatedAt: Timestamp.now()
            };

            if (acteId) {
                updateData.acteId = acteId;
            }

            if (motifRejet) {
                updateData.motifRejet = motifRejet;
            }

            await db.collection('demandes').doc(id).update(updateData);
            return this.findById(id);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut de la demande:', error);
            throw error;
        }
    }

    /**
     * Ajoute des documents à une demande
     * @param {string} id - L'ID de la demande
     * @param {Array<string>} documentIds - Les IDs des documents à ajouter
     * @returns {Promise<Object>} La demande mise à jour
     */
    static async addDocuments(id, documentIds) {
        try {
            const demande = await this.findById(id);

            if (!demande) {
                throw new Error('Demande non trouvée');
            }

            const updatedDocumentIds = [...(demande.documentIds || []), ...documentIds];

            await db.collection('demandes').doc(id).update({
                documentIds: updatedDocumentIds,
                updatedAt: Timestamp.now()
            });

            return this.findById(id);
        } catch (error) {
            console.error('Erreur lors de l\'ajout de documents à la demande:', error);
            throw error;
        }
    }

    /**
     * Supprime une demande
     * @param {string} id - L'ID de la demande à supprimer
     * @returns {Promise<boolean>} True si la suppression a réussi
     */
    static async delete(id) {
        try {
            await db.collection('demandes').doc(id).delete();
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression de la demande:', error);
            throw error;
        }
    }

    /**
     * Récupère les statistiques des demandes
     * @returns {Promise<Object>} Statistiques
     */
    static async getStatistics() {
        try {
            const snapshot = await db.collection('demandes').get();
            const demandes = snapshot.docs.map(doc => doc.data());

            const stats = {
                total: demandes.length,
                en_attente: demandes.filter(d => d.statut === 'en_attente').length,
                acceptee: demandes.filter(d => d.statut === 'acceptee').length,
                rejetee: demandes.filter(d => d.statut === 'rejetee').length,
                par_type: {
                    naissance: demandes.filter(d => d.type === 'naissance').length,
                    mariage: demandes.filter(d => d.type === 'mariage').length,
                    deces: demandes.filter(d => d.type === 'deces').length
                }
            };

            return stats;
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            throw error;
        }
    }
}

module.exports = Demande;
