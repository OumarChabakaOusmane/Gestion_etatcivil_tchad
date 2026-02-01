import api from './api';

const articleService = {
    /**
     * Récupérer tous les articles (Public / Admin)
     */
    async getAllArticles(params = {}) {
        try {
            const response = await api.get('/articles', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Récupérer un article par ID
     */
    async getArticleById(id) {
        try {
            const response = await api.get(`/articles/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Créer un article (Admin)
     */
    async createArticle(data) {
        try {
            const response = await api.post('/articles', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Mettre à jour un article (Admin)
     */
    async updateArticle(id, data) {
        try {
            const response = await api.put(`/articles/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Supprimer un article (Admin)
     */
    async deleteArticle(id) {
        try {
            const response = await api.delete(`/articles/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default articleService;
