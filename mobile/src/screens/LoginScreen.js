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
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
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

    const { loginWithGoogle } = useAuth();
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleGoogleLogin = async () => {
        if (Platform.OS === 'web') {
            Alert.alert(
                'Non supporté sur le Web',
                'La connexion par Google est actuellement en cours de configuration pour la version web. Veuillez utiliser l\'application mobile ou vous connecter avec votre email.',
                [{ text: 'OK' }]
            );
            return;
        }

        try {
            setGoogleLoading(true);
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            // Dans les versions récentes, idToken est dans data ou userInfo
            const idToken = userInfo.data?.idToken || userInfo.idToken;

            if (!idToken) {
                throw new Error('Impossible de récupérer le token Google');
            }

            const result = await loginWithGoogle(idToken);
            if (!result.success) {
                Alert.alert('Erreur', result.message || 'Échec de la connexion Google');
            }
        } catch (error) {
            console.error('❌ Erreur Google:', error);
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // L'utilisateur a annulé
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // Déjà en cours
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert('Erreur', 'Services Google Play non disponibles');
            } else {
                Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion Google');
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.inner}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image source={require('../../assets/logotechad.jpg')} style={styles.logo} resizeMode="contain" />
                    </View>
                    <Text style={styles.title}>SIGEC TCHAD</Text>
                    <Text style={styles.subtitle}>Portail Officiel de l'État Civil</Text>
                </View>

                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Adresse Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="votre@email.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mot de passe</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="********"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.forgotPass}
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogin}
                        disabled={loading || googleLoading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Se connecter</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.separator}>
                        <View style={styles.line} />
                        <Text style={styles.separatorText}>OU</Text>
                        <View style={styles.line} />
                    </View>

                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={handleGoogleLogin}
                        disabled={loading || googleLoading}
                    >
                        {googleLoading ? (
                            <ActivityIndicator color="#001a41" />
                        ) : (
                            <View style={styles.googleContent}>
                                <View style={styles.googleIconPlaceholder}>
                                    <Text style={styles.googleG}>G</Text>
                                </View>
                                <Text style={styles.googleButtonText}>Continuer avec Google</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.diagBtn}
                    onPress={handleCheckConnection}
                    disabled={loading}
                >
                    <Text style={styles.diagBtnText}>
                        {loading ? 'Vérification...' : 'Diagnostic connexion'}
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
        marginBottom: 40,
    },
    logoContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#FFFFFF',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#001a41',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
        marginTop: 4,
        textTransform: 'uppercase',
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 24,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#495057',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1.5,
        borderColor: '#E9ECEF',
        padding: 16,
        borderRadius: 14,
        fontSize: 16,
        color: '#1A1A1A',
    },
    button: {
        backgroundColor: '#001a41',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        elevation: 4,
        shadowColor: '#001a41',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: 'bold',
    },
    forgotPass: {
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    forgotText: {
        color: '#003399',
        fontSize: 14,
        fontWeight: '600',
    },
    diagBtn: {
        marginTop: 20,
        padding: 12,
        alignItems: 'center',
    },
    diagBtnText: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    footerText: {
        color: '#64748b',
        fontSize: 15,
    },
    linkText: {
        color: '#001a41',
        fontWeight: '900',
        fontSize: 15,
    },
    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#E9ECEF',
    },
    separatorText: {
        marginHorizontal: 10,
        color: '#adb5bd',
        fontSize: 12,
        fontWeight: '700',
    },
    googleButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E9ECEF',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    googleIconPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    googleG: {
        fontSize: 16,
        fontWeight: '900',
        color: '#4285F4',
    },
    googleButtonText: {
        color: '#495057',
        fontSize: 16,
        fontWeight: '700',
    },
});
