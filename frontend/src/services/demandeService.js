import api from './api';

/**
 * Service de gestion des demandes
 */
const demandeService = {
    /**
     * Crée une nouvelle demande
     * @param {string} type - Type de demande (naissance, mariage, deces)
     * @param {Object} donnees - Données de la demande
     * @param {Array} documentIds - IDs des documents uploadés
     * @returns {Promise} Demande créée
     */
    async createDemande(type, donnees, documentIds = []) {
        try {
            const response = await api.post('/demandes', {
                type,
                donnees,
                documentIds
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Récupère les demandes de l'utilisateur connecté
     * @param {Object} filters - Filtres optionnels (type, statut)
     * @returns {Promise} Liste des demandes
     */
    async getMyDemandes(filters = {}) {
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await api.get(`/demandes/me?${params}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Récupère toutes les demandes (admin)
     * @param {Object} filters - Filtres optionnels
     * @returns {Promise} Liste des demandes
     */
    async getAllDemandes(filters = {}) {
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await api.get(`/demandes?${params}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Récupère une demande par son ID
     * @param {string} id - ID de la demande
     * @returns {Promise} Demande
     */
    async getDemandeById(id) {
        try {
            const response = await api.get(`/demandes/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Met à jour le statut d'une demande (admin)
     * @param {string} id - ID de la demande
     * @param {string} statut - Nouveau statut (acceptee, rejetee)
     * @param {string} motifRejet - Motif de rejet (optionnel)
     * @returns {Promise} Demande mise à jour
     */
    async updateStatut(id, statut, motifRejet = null) {
        try {
            const response = await api.patch(`/demandes/${id}/statut`, {
                statut,
                motifRejet
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Ajoute des documents à une demande
     * @param {string} id - ID de la demande
     * @param {Array} documentIds - IDs des documents
     * @returns {Promise} Demande mise à jour
     */
    async addDocuments(id, documentIds) {
        try {
            const response = await api.post(`/demandes/${id}/documents`, {
                documentIds
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Récupère les statistiques des demandes (admin)
     * @returns {Promise} Statistiques
     */
    async getStatistics() {
        try {
            const response = await api.get('/demandes/stats');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Récupère la dernière demande d'un certain type pour l'auto-complétion
     * @param {string} type - Type de demande
     * @returns {Promise} La dernière demande trouvée
     */
    async getLastDemandeByType(type) {
        try {
            const response = await this.getMyDemandes({ type, limit: 1 });
            return response.data?.[0] || null;
        } catch (error) {
            console.error('Erreur auto-complétion:', error);
            return null;
        }
    },

    /**
     * Met à jour une demande
     * @param {string} id - ID de la demande
     * @param {Object} donnees - Nouvelles données
     * @returns {Promise}
     */
    async updateDemande(id, donnees) {
        try {
            const response = await api.patch(`/demandes/${id}`, { donnees });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Supprime/Annule une demande
     * @param {string} id - ID de la demande
     * @returns {Promise}
     */
    async deleteDemande(id) {
        try {
            const response = await api.delete(`/demandes/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default demandeService;
