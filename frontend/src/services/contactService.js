import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const contactService = {
    submitMessage: async (formData) => {
        try {
            const response = await axios.post(`${API_URL}/contact`, formData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Erreur lors de l'envoi du message" };
        }
    },

    getAllMessages: async () => {
        try {
            const response = await axios.get(`${API_URL}/contact`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Erreur lors de la récupération des messages" };
        }
    },

    replyToMessage: async (contactId, replyContent) => {
        try {
            const response = await axios.post(`${API_URL}/contact/reply`, { contactId, replyContent });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Erreur lors de l'envoi de la réponse" };
        }
    }
};

export default contactService;
