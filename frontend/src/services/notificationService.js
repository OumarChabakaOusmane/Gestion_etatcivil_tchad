import api from './api';

/**
 * Service pour la gestion des notifications
 */
const notificationService = {
    /**
     * Récupère toutes les notifications
     */
    async getNotifications() {
        try {
            const response = await api.get('/notifications');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Marque une notification comme lue
     * @param {string} id - ID de la notification
     */
    async markAsRead(id) {
        try {
            const response = await api.put(`/notifications/${id}/read`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Marque toutes les notifications comme lues
     */
    async markAllAsRead() {
        try {
            const response = await api.put('/notifications/mark-all-read');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Supprime une notification
     * @param {string} id - ID de la notification
     */
    async delete(id) {
        try {
            const response = await api.delete(`/notifications/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default notificationService;
