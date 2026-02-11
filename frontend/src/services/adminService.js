import api from './api';

/**
 * Service de gestion administrative
 */
const adminService = {
    /**
     * Récupère les statistiques unifiées pour le Dashboard
     * @returns {Promise} Données du dashboard (stats, demandes récentes, users récents)
     */
    async getDashboardStats() {
        try {
            const response = await api.get('/admin/dashboard-stats');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default adminService;
