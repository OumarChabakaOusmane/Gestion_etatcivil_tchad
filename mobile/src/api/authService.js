import api from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.success) {
            await AsyncStorage.setItem('userToken', response.data.data.token);
            await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    verifyOtp: async (email, otp) => {
        const response = await api.post('/auth/verify-otp', { email, otp });
        return response.data;
    },

    resendOtp: async (email) => {
        const response = await api.post('/auth/resend-otp', { email });
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email, channel: 'mobile' });
        return response.data;
    },

    resetPassword: async (email, resetToken, password) => {
        const response = await api.post(`/auth/reset-password/${resetToken}`, { email, password });
        return response.data;
    },

    loginWithGoogle: async (idToken) => {
        const response = await api.post('/auth/google', { idToken });
        return response.data;
    },

    updatePushToken: async (token) => {
        const response = await api.put('/users/push-token', { token });
        return response.data;
    },

    logout: async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
    },

    getCurrentUser: async () => {
        const userData = await AsyncStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }
};
