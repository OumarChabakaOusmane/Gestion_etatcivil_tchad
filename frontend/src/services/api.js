import axios from 'axios';

// Configuration de l'URL de base de l'API
let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// S'assurer que l'URL se termine par /api pour éviter les erreurs de configuration
if (API_BASE_URL && !API_BASE_URL.endsWith('/api') && !API_BASE_URL.endsWith('/api/')) {
    API_BASE_URL = API_BASE_URL.endsWith('/') ? `${API_BASE_URL}api` : `${API_BASE_URL}/api`;
}

// Créer une instance axios
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour ajouter le token JWT automatiquement
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Ne pas rediriger si c'est une erreur de connexion ou de vérification OTP
        // car on veut afficher l'erreur sur la page
        const isAuthRoute = error.config?.url?.includes('/auth/login') ||
            error.config?.url?.includes('/auth/verify-otp');

        // Si le token est expiré ou invalide (et que ce n'est pas une tentative de login)
        if (error.response && error.response.status === 401 && !isAuthRoute) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login'; // Rediriger explicitement vers login
        }
        return Promise.reject(error);
    }
);

export default api;
