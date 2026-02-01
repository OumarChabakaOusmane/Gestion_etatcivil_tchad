import api from './client';

export const demandeService = {
    createDemande: async (type, donnees) => {
        const response = await api.post('/demandes', { type, donnees });
        return response.data;
    },

    getMyDemandes: async () => {
        const response = await api.get('/demandes/me');
        return response.data;
    },

    getDemandeById: async (id) => {
        const response = await api.get(`/demandes/${id}`);
        return response.data;
    },

    updateDemande: async (id, data) => {
        const response = await api.patch(`/demandes/${id}`, data);
        return response.data;
    },

    deleteDemande: async (id) => {
        const response = await api.delete(`/demandes/${id}`);
        return response.data;
    }
};
