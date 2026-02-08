import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api, { API_URL } from '../api/client';

export default function LoginScreen({ navigation }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCheckConnection = async () => {
        setLoading(true);
        try {
            console.log('🔍 Test de connexion vers:', `${API_URL}/debug-conn`);
            const response = await api.get('/debug-conn');
            Alert.alert('Succès', `Connecté au serveur!\nIP détectée: ${response.data.ip}\nHeure: ${response.data.time}`);
        } catch (error) {
            console.log('❌ Échec test connexion:', error.message);
            Alert.alert('Échec', `Impossible de joindre le serveur.\nErreur: ${error.message}\nURL: ${API_URL}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        try {
            const result = await login(email, password);
            if (result.success) {
                // La navigation est maintenant gérée automatiquement par AuthContext
            } else {
                // Si l'erreur provient du backend et nécessite une vérification
                if (result.requireVerification) {
                    Alert.alert(
                        'Compte non vérifié',
                        'Votre compte existe mais n\'a pas encore été validé par OTP.',
                        [
                            { text: 'Annuler', style: 'cancel' },
                            { text: 'Vérifier maintenant', onPress: () => navigation.navigate('VerifyOtp', { email }) }
                        ]
                    );
                } else {
                    Alert.alert('Erreur', result.message || 'Identifiants incorrects');
                }
            }
        } catch (error) {
            console.error('❌ Erreur Login:', error);
            const message = error.response?.data?.message || error.message || 'Erreur de connexion';

            // Gestion spécifique des comptes non vérifiés via exception
            if (error.response?.status === 403 && error.response?.data?.requireVerification) {
                Alert.alert(
                    'Vérification requise',
                    'Veuillez valider votre compte avec le code reçu par email.',
                    [{ text: 'OK', onPress: () => navigation.navigate('VerifyOtp', { email }) }]
                );
            } else {
                Alert.alert('Erreur', message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.inner}>
                <View style={styles.header}>
                    <Text style={styles.title}>SIGEC TCHAD</Text>
                    <Text style={styles.subtitle}>Gestion de l'État Civil</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Adresse Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="votre@email.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        textContentType="emailAddress"
                    />

                    <Text style={styles.label}>Mot de passe</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="********"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoComplete="password"
                        textContentType="password"
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Se connecter</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.forgotPass}>
                        <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.loginBtn, { backgroundColor: '#64748b', marginTop: 10 }]}
                    onPress={handleCheckConnection}
                    disabled={loading}
                >
                    <Text style={styles.loginBtnText}>
                        {loading ? 'Vérification...' : 'Diagnostiquer la connexion'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Pas encore de compte ?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.linkText}> S'inscrire</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    inner: {
        padding: 24,
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#001a41',
    },
    subtitle: {
        fontSize: 16,
        color: '#6c757d',
        marginTop: 8,
    },
    form: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#F1F3F5',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#001a41',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    forgotPass: {
        alignItems: 'center',
        marginTop: 16,
    },
    forgotText: {
        color: '#6c757d',
        fontSize: 14,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        color: '#495057',
    },
    linkText: {
        color: '#001a41',
        fontWeight: 'bold',
    },
});
