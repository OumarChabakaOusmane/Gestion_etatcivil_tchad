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
import { API_URL } from '../api/client';

export default function RegisterScreen({ navigation }) {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        telephone: '66'
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
                    'Veuillez vérifier votre email pour le code OTP.',
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
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Inscription</Text>
                    <Text style={styles.subtitle}>Créez votre compte citoyen</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.label}>Nom</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.nom}
                                onChangeText={(text) => setFormData({ ...formData, nom: text })}
                                placeholder="Ex: Alkhali"
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={styles.label}>Prénom</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.prenom}
                                onChangeText={(text) => setFormData({ ...formData, prenom: text })}
                                placeholder="Ex: Mahamat"
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Adresse Email</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                        placeholder="votre@email.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Téléphone</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.telephone}
                        onChangeText={(text) => setFormData({ ...formData, telephone: text })}
                        placeholder="66000000"
                        keyboardType="phone-pad"
                    />

                    <Text style={styles.label}>Mot de passe</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.password}
                        onChangeText={(text) => setFormData({ ...formData, password: text })}
                        placeholder="********"
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>S'inscrire</Text>
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
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
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
    row: {
        flexDirection: 'row',
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
        marginTop: 32,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
        marginBottom: 40,
    },
    footerText: {
        color: '#495057',
    },
    linkText: {
        color: '#001a41',
        fontWeight: 'bold',
    },
});
