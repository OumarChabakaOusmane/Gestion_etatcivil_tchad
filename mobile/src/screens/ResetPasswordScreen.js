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
    Alert,
    ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react-native';
import { authService } from '../api/authService';

export default function ResetPasswordScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { email } = route.params;

    const [pin, setPin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleReset = async () => {
        if (pin.length !== 6) {
            Alert.alert('Erreur', 'Le code PIN doit contenir 6 chiffres');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);
        try {
            const result = await authService.resetPassword(email, pin, password);
            if (result.success) {
                Alert.alert(
                    'Succès',
                    'Votre mot de passe a été mis à jour avec succès.',
                    [{ text: 'Se connecter', onPress: () => navigation.navigate('Login') }]
                );
            } else {
                Alert.alert('Erreur', result.message || 'La réinitialisation a échoué.');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Une erreur est survenue lors de la réinitialisation.';
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
                <Text style={styles.headerTitle}>Réinitialisation</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.infoBox}>
                    <Text style={styles.description}>
                        Saisissez le code PIN à 6 chiffres reçu par email à :
                    </Text>
                    <Text style={styles.emailText}>{email}</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Code PIN (6 chiffres)</Text>
                        <TextInput
                            style={styles.pinInput}
                            placeholder="000000"
                            value={pin}
                            onChangeText={setPin}
                            keyboardType="number-pad"
                            maxLength={6}
                            textAlign="center"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nouveau mot de passe</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="********"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                {showPassword ? <EyeOff size={20} color="#6c757d" /> : <Eye size={20} color="#6c757d" />}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirmer le mot de passe</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="********"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showPassword}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleReset}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>Valider le changement</Text>
                                <CheckCircle size={20} color="#FFFFFF" />
                            </>
                        )}
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
    scrollContent: {
        padding: 24,
    },
    infoBox: {
        marginBottom: 32,
    },
    description: {
        fontSize: 16,
        color: '#6c757d',
        lineHeight: 24,
    },
    emailText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#001a41',
        marginTop: 4,
    },
    form: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 24,
        ...Platform.select({
            web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.1)' },
            default: { elevation: 3 }
        }),
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#495057',
        marginBottom: 8,
        marginLeft: 4,
    },
    pinInput: {
        backgroundColor: '#F1F3F5',
        padding: 16,
        borderRadius: 14,
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 8,
        color: '#001a41',
    },
    input: {
        backgroundColor: '#F1F3F5',
        padding: 16,
        borderRadius: 14,
        fontSize: 16,
        color: '#1A1A1A',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F3F5',
        borderRadius: 14,
    },
    passwordInput: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        color: '#1A1A1A',
    },
    eyeIcon: {
        padding: 16,
    },
    button: {
        backgroundColor: '#001a41',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 18,
        borderRadius: 16,
        marginTop: 10,
        gap: 12,
        ...Platform.select({
            default: {
                elevation: 4,
                shadowColor: '#001a41',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            }
        })
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: 'bold',
    },
});
