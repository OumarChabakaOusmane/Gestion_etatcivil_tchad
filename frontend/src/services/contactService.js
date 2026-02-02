import api from './api';

const contactService = {
    submitMessage: async (formData) => {
        try {
            const response = await api.post('/contact', formData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Erreur lors de l'envoi du message" };
        }
    },

    getAllMessages: async () => {
        try {
            const response = await api.get('/contact');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Erreur lors de la récupération des messages" };
        }
    },

    replyToMessage: async (contactId, replyContent) => {
        try {
            const response = await api.post('/contact/reply', { contactId, replyContent });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Erreur lors de l'envoi de la réponse" };
        }
    }
};

export default contactService;
