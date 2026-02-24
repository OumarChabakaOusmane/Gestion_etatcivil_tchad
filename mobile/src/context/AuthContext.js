import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { authService } from '../api/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    console.log('🔐 AuthProvider: Initializing');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        console.log('🔐 AuthProvider: useEffect mounted');

        // Configuration Google Sign-In
        GoogleSignin.configure({
            webClientId: '474357043996-nhsou313l3pf3v8pv3l76r6bg2hdro9s.apps.googleusercontent.com', // Configuré via Google Cloud Console
            offlineAccess: true,
        });

        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        console.log('🔐 AuthProvider: checkLoginStatus started');
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
        return handleAuthResult(result);
    };

    const loginWithGoogle = async (idToken) => {
        const result = await authService.loginWithGoogle(idToken);
        return handleAuthResult(result);
    };

    const handleAuthResult = async (result) => {
        if (result.success) {
            console.log('✅ AuthContext - Auth réussi, mise à jour de l\'état');

            // Si le résultat contient directement le token et l'user (cas du login classique ou google)
            const token = result.data?.token || result.token;
            const userData = result.data?.user || result.user;

            if (token) await AsyncStorage.setItem('userToken', token);
            if (userData) {
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
                setUser(userData);
            }

            setIsLoggedIn(true);

            // Enregistrer le token de notification
            try {
                const { notificationService } = require('../services/notificationService');
                const tokenNotif = await notificationService.registerForPushNotificationsAsync();
                if (tokenNotif) {
                    await authService.updatePushToken(tokenNotif);
                    console.log('🔔 Token Mobile enregistré:', tokenNotif);
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
            await AsyncStorage.setItem('userToken', result.data.token);
            await AsyncStorage.setItem('userData', JSON.stringify(result.data.user));
            setUser(result.data.user);
            setIsLoggedIn(true);
            return { success: true };
        }
        return result;
    };

    const resendOtp = async (email) => {
        return await authService.resendOtp(email);
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, loading, login, loginWithGoogle, logout, verifyOtp, resendOtp }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
