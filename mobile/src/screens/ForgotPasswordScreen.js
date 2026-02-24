import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
export default function ForgotPasswordScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
            return;
        }

        setLoading(true);
        try {
            const { authService } = require('../api/authService');
            await authService.forgotPassword(email);
            Alert.alert(
                'Code envoyé',
                'Un code PIN de réinitialisation vous a été envoyé par email.',
                [{ text: 'OK', onPress: () => navigation.navigate('ResetPassword', { email }) }]
            );
        } catch (error) {
            console.error('Forgot Password Error:', error);
            const message = error.response?.data?.message || 'Une erreur est survenue lors de l\'envoi de la demande.';
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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#001a41" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mot de passe oublié</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.description}>
                    Entrez votre adresse email ci-dessous pour recevoir un code PIN de réinitialisation.
                </Text>

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
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleResetPassword}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Envoyer le code</Text>
                        )}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF',
        ...Platform.select({
            web: { boxShadow: '0px 2px 4px rgba(0,0,0,0.05)' },
            default: { elevation: 2 }
        }),
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#001a41',
    },
    content: {
        padding: 24,
    },
    description: {
        fontSize: 16,
        color: '#6c757d',
        marginBottom: 32,
        lineHeight: 24,
    },
    form: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        ...Platform.select({
            web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.1)' },
            default: { elevation: 3 }
        }),
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F1F3F5',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#001a41',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
