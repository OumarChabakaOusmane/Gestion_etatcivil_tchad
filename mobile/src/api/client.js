import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Désormais nous utilisons Constants de app.json pour plus de flexibilité
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://api.etatciviltd.com/api';

console.log('🌐 Connexion à l\'API:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    timeout: 60000, // Augmenté à 60s pour laisser le temps à l'envoi d'email
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Intercepteur pour le débuggage des erreurs
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log('❌ API Error Detail:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            message: error.message,
            code: error.code, // Utile pour ERR_NETWORK ou ECONNABORTED
            data: error.response?.data
        });
        return Promise.reject(error);
    }
);

export { API_URL };
export default api;
