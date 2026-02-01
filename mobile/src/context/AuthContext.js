import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../api/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const userData = await AsyncStorage.getItem('userData');

            if (token && userData) {
                try {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                    setIsLoggedIn(true);
                } catch (parseError) {
                    console.error('❌ Erreur parsing userData:', parseError);
                    await AsyncStorage.removeItem('userData');
                    await AsyncStorage.removeItem('userToken');
                }
            }
        } catch (e) {
            console.error('Erreur checkLoginStatus:', e);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const result = await authService.login(email, password);
        if (result.success) {
            console.log('✅ AuthContext - Login réussi, mise à jour de l\'état');
            setUser(result.data.user);
            setIsLoggedIn(true);

            // Enregistrer le token de notification
            try {
                const { notificationService } = require('../services/notificationService');
                const token = await notificationService.registerForPushNotificationsAsync();
                if (token) {
                    await authService.updatePushToken(token);
                    console.log('🔔 Token Mobile enregistré:', token);
                }
            } catch (notifErr) {
                console.error('Erreur enregistrement token:', notifErr);
            }

            return { success: true };
        }
        return result;
    };

    const verifyOtp = async (email, otp) => {
        const result = await authService.verifyOtp(email, otp);
        if (result.success) {
            setUser(result.user);
            setIsLoggedIn(true);
            return { success: true };
        }
        return result;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout, verifyOtp }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
