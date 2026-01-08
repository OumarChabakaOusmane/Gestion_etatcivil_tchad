import api from './api';

/**
 * Service de gestion des utilisateurs (Admin)
 */
const userService = {
    /**
     * Récupère tous les utilisateurs
     * @returns {Promise} Liste des utilisateurs
     */
    async getAllUsers() {
        try {
            const response = await api.get('/users');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Met à jour le rôle d'un utilisateur
     * @param {string} id - ID de l'utilisateur
     * @param {string} role - Nouveau rôle ('user' ou 'admin')
     * @returns {Promise} Réponse de l'API
     */
    async updateRole(id, role) {
        try {
            const response = await api.patch(`/users/${id}/role`, { role });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Supprime un utilisateur
     * @param {string} id - ID de l'utilisateur
     * @returns {Promise} Réponse de l'API
     */
    async deleteUser(id) {
        try {
            const response = await api.delete(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default userService;
