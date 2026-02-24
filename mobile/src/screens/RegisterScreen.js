import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { authService } from '../api/authService';
import { useAuth } from '../context/AuthContext';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { API_URL } from '../api/client';

export default function RegisterScreen({ navigation }) {
    const { loginWithGoogle } = useAuth();
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            setGoogleLoading(true);
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.data?.idToken || userInfo.idToken;

            if (!idToken) throw new Error('Token Google manquant');

            const result = await loginWithGoogle(idToken);
            if (!result.success) {
                Alert.alert('Erreur', result.message || 'Échec inscription Google');
            }
        } catch (error) {
            console.error('❌ Erreur Google Register:', error);
            if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
                Alert.alert('Erreur', 'Impossible de se connecter avec Google');
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        telephone: ''
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        const { nom, prenom, email, password, telephone } = formData;
        if (!nom || !prenom || !email || !password || !telephone) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        try {
            const result = await authService.register({ ...formData, role: 'user' });
            if (result.success) {
                Alert.alert(
                    'Compte créé',
                    result.message || 'Veuillez vérifier votre email pour le code OTP.',
                    [{ text: 'OK', onPress: () => navigation.navigate('VerifyOtp', { email }) }]
                );
            }
        } catch (error) {
            console.error('❌ Erreur Inscription:', error.response?.data || error.message);
            const message = error.response?.data?.message || `Erreur réseau. Tentative de connexion vers: ${API_URL}`;
            Alert.alert('Erreur', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Rejoignez SIGEC</Text>
                    <Text style={styles.subtitle}>Créez votre compte citoyen en quelques secondes</Text>
                </View>

                <View style={styles.formCard}>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nom</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.nom}
                                    onChangeText={(text) => setFormData({ ...formData, nom: text })}
                                    placeholder="Nom"
                                />
                            </View>
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Prénom</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.prenom}
                                    onChangeText={(text) => setFormData({ ...formData, prenom: text })}
                                    placeholder="Prénom"
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Adresse Email</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            placeholder="votre@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Numéro de Téléphone</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.telephone}
                            onChangeText={(text) => setFormData({ ...formData, telephone: text })}
                            placeholder="+235 ..."
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mot de passe</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.password}
                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                            placeholder="Choisir un mot de passe"
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRegister}
                        disabled={loading || googleLoading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Créer mon compte</Text>
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

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Déjà un compte ?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkText}> Se connecter</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        padding: 24,
        paddingTop: 80,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 35,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#001a41',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 15,
        color: '#64748b',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 22,
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
    row: {
        flexDirection: 'row',
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
        marginBottom: 20,
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
