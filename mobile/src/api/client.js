import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Sur émulateur Android, localhost est 10.0.2.2
// Sur appareil réel, utilisez votre adresse IP locale
const API_URL = Constants.expoConfig.extra?.apiUrl || 'http://200.100.10.19:5000/api';

console.log('🌐 Connexion à l\'API:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
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

export { API_URL };
export default api;
