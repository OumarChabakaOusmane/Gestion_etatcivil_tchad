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
import { useAuth } from '../context/AuthContext';

export default function VerifyOtpScreen({ route, navigation }) {
    const { verifyOtp, resendOtp } = useAuth();
    const { email } = route.params;
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            Alert.alert('Erreur', 'Le code doit contenir 6 chiffres');
            return;
        }

        setLoading(true);
        try {
            const result = await verifyOtp(email, otp);
            if (result.success) {
                Alert.alert(
                    'Succès',
                    'Votre compte a été activé et vous êtes maintenant connecté !'
                );
            } else {
                Alert.alert('Erreur', result.message || 'Le code saisi est incorrect');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Une erreur est survenue lors de la vérification';
            Alert.alert('Erreur', message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            await resendOtp(email);
            Alert.alert('Succès', 'Un nouveau code a été envoyé à votre adresse email.');
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de renvoyer le code. Veuillez réessayer.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.inner}>
                <View style={styles.header}>
                    <Text style={styles.title}>Vérification</Text>
                    <Text style={styles.subtitle}>Saisissez le code envoyé à :</Text>
                    <Text style={styles.emailText}>{email}</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Code de vérification (6 chiffres)</Text>
                    <TextInput
                        style={[styles.input, { letterSpacing: 8 }]}
                        value={otp}
                        onChangeText={setOtp}
                        placeholder="000000"
                        keyboardType="number-pad"
                        maxLength={6}
                        textAlign="center"
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleVerify}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Vérifier le compte</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.resendBtn}
                    onPress={handleResend}
                    disabled={resendLoading}
                >
                    {resendLoading ? (
                        <ActivityIndicator color="#001a41" />
                    ) : (
                        <Text style={styles.resendText}>Renvoyer le code</Text>
                    )}
                </TouchableOpacity>
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
    emailText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#001a41',
        marginTop: 4,
    },
    form: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 16,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        elevation: 3,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#F1F3F5',
        padding: 16,
        borderRadius: 8,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#001a41',
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
    resendBtn: {
        alignItems: 'center',
        marginTop: 32,
    },
    resendText: {
        color: '#001a41',
        fontWeight: '600',
    },
});
