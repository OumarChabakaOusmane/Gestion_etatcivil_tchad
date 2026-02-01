import api from './api';

const auditService = {
    /**
     * Récupère les logs d'activité
     * @param {Object} params - { limit, startAfter, action, userId }
     */
    async getLogs(params = {}) {
        try {
            const response = await api.get('/logs', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default auditService;
