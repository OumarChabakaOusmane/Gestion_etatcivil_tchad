import api from './api';

/**
 * Service d'authentification
 */
const authService = {
    /**
     * Connexion d'un utilisateur
     * @param {string} email - Email de l'utilisateur
     * @param {string} password - Mot de passe
     * @returns {Promise} Données de l'utilisateur et token
     */
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.data.success) {
                // Stocker le token et les informations utilisateur
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                return response.data;
            }

            throw new Error(response.data.message || 'Erreur de connexion');
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Inscription d'un nouvel utilisateur
     * @param {Object} userData - Données de l'utilisateur
     * @returns {Promise} Données de l'utilisateur créé
     */
    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Demande de réinitialisation de mot de passe
     * @param {string} email - Email de l'utilisateur
     * @returns {Promise} Réponse de l'API
     */
    async forgotPassword(email) {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Déconnexion de l'utilisateur
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    },

    /**
     * Récupère l'utilisateur connecté
     * @returns {Object|null} Utilisateur ou null
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (error) {
                return null;
            }
        }
        return null;
    },

    /**
     * Vérifie si l'utilisateur est authentifié
     * @returns {boolean} True si authentifié
     */
    isAuthenticated() {
        const token = localStorage.getItem('token');
        const user = this.getCurrentUser();
        return !!(token && user);
    },

    /**
     * Vérifie si l'utilisateur est admin
     * @returns {boolean} True si admin
     */
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    /**
     * Vérifie si l'utilisateur est un agent de mairie
     * @returns {boolean} True si agent
     */
    isAgent() {
        const user = this.getCurrentUser();
        return user && user.role === 'agent';
    },

    /**
     * Vérifie si l'utilisateur a accès aux fonctions d'administration (Admin ou Agent)
     * @returns {boolean} True si admin ou agent
     */
    hasAdminAccess() {
        const user = this.getCurrentUser();
        return user && (user.role === 'admin' || user.role === 'agent');
    },
    /**
     * Met à jour le profil de l'utilisateur
     * @param {Object} userData - Nouvelles données
     */
    async updateProfile(userData) {
        try {
            // Simulation pour le PFE - En réalité on appellerait une API
            const response = await api.put('/users/me', userData);
            if (response.data.success) {
                // Mettre à jour le localStorage
                const currentUser = this.getCurrentUser();
                const updatedUser = { ...currentUser, ...userData };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Met à jour le mot de passe
     * @param {Object} passwordData - Ancien et nouveau mot de passe
     */
    async updatePassword(passwordData) {
        try {
            // Mapping pour correspondre au backend
            const payload = {
                currentPassword: passwordData.current,
                newPassword: passwordData.new
            };
            const response = await api.put('/users/change-password', payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Vérifie le code OTP
     * @param {string} email
     * @param {string} otp
     */
    async verifyOtp(email, otp) {
        try {
            const response = await api.post('/auth/verify-otp', { email, otp });
            if (response.data.success) {
                // Stocker le token et les informations utilisateur
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Renvoie le code OTP
     * @param {string} email
     */
    async resendOtp(email) {
        try {
            const response = await api.post('/auth/resend-otp', { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Réinitialise le mot de passe
     * @param {string} token
     * @param {string} password
     */
    async resetPassword(token, password) {
        try {
            const response = await api.put(`/auth/reset-password/${token}`, { password });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default authService;
