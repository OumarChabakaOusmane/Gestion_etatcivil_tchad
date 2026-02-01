import React, { useState, useEffect } from 'react';
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
import { demandeService } from '../api/demandeService';
import { ChevronLeft, Info, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export default function CreateDemandeScreen({ route, navigation }) {
    const { isLoggedIn } = useAuth();
    const type = route.params?.type || 'naissance';
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // Initial State based on type
    const getInitialData = () => {
        if (type === 'naissance') {
            return {
                prenomEnfant: '', nomEnfant: '', sexeEnfant: 'M', dateNaissanceEnfant: '',
                heureNaissanceEnfant: '', lieuNaissanceEnfant: '',
                prenomPere: '', nomPere: '', dateNaissancePere: '', lieuNaissancePere: '',
                nationalitePere: 'TCHADIENNE', professionPere: '', domicilePere: '',
                prenomMere: '', nomMere: '', dateNaissanceMere: '', lieuNaissanceMere: '',
                nationaliteMere: 'TCHADIENNE', professionMere: '', domicileMere: ''
            };
        } else if (type === 'mariage') {
            return {
                nomEpoux: '', prenomEpoux: '', dateNaissanceEpoux: '', lieuNaissanceEpoux: '',
                nationaliteEpoux: 'TCHADIENNE', professionEpoux: '', domicileEpoux: '',
                nomEpouse: '', prenomEpouse: '', dateNaissanceEpouse: '', lieuNaissanceEpouse: '',
                nationaliteEpouse: 'TCHADIENNE', professionEpouse: '', domicileEpouse: '',
                dateMariage: '', lieuMariage: '', regimeMatrimonial: 'monogamie'
            };
        } else if (type === 'deces') {
            return {
                nomDefunt: '', prenomDefunt: '', dateDeces: '', lieuDeces: '', causeDeces: '',
                dateNaissanceDefunt: '', lieuNaissanceDefunt: '', nationaliteDefunt: 'TCHADIENNE',
                nomDeclarant: '', prenomDeclarant: '', lienParente: '', domicileDeclarant: ''
            };
        }
        return {};
    };

    const [formData, setFormData] = useState(getInitialData());

    useEffect(() => {
        if (!isLoggedIn) {
            Alert.alert(
                'Connexion requise',
                'Désolé, vous devez être connecté pour soumettre une demande officielle. Veuillez créer un compte ou vous connecter.',
                [
                    { text: 'Se connecter', onPress: () => navigation.navigate('Login') },
                    { text: 'Annuler', onPress: () => navigation.goBack(), style: 'cancel' }
                ]
            );
        }
    }, [isLoggedIn]);

    const validateStep = () => {
        if (type === 'naissance') {
            if (currentStep === 1) {
                if (!formData.nomEnfant || !formData.prenomEnfant || !formData.dateNaissanceEnfant || !formData.lieuNaissanceEnfant) {
                    Alert.alert('Champs requis', 'Veuillez remplir toutes les informations sur l\'enfant.');
                    return false;
                }
            } else if (currentStep === 2) {
                if (!formData.nomPere || !formData.prenomPere || !formData.dateNaissancePere || !formData.lieuNaissancePere) {
                    Alert.alert('Champs requis', 'Veuillez remplir les informations concernant le père.');
                    return false;
                }
            } else if (currentStep === 3) {
                if (!formData.nomMere || !formData.prenomMere || !formData.dateNaissanceMere || !formData.lieuNaissanceMere) {
                    Alert.alert('Champs requis', 'Veuillez remplir les informations concernant la mère.');
                    return false;
                }
            }
        } else if (type === 'mariage') {
            if (currentStep === 1) {
                if (!formData.nomEpoux || !formData.prenomEpoux || !formData.dateNaissanceEpoux || !formData.domicileEpoux) {
                    Alert.alert('Champs requis', 'Veuillez remplir les informations sur l\'époux.');
                    return false;
                }
            } else if (currentStep === 2) {
                if (!formData.nomEpouse || !formData.prenomEpouse || !formData.dateNaissanceEpouse || !formData.domicileEpouse) {
                    Alert.alert('Champs requis', 'Veuillez remplir les informations sur l\'épouse.');
                    return false;
                }
            } else if (currentStep === 3) {
                if (!formData.dateMariage || !formData.lieuMariage) {
                    Alert.alert('Champs requis', 'Veuillez indiquer la date et le lieu du mariage.');
                    return false;
                }
            }
        } else if (type === 'deces') {
            if (currentStep === 1) {
                if (!formData.nomDefunt || !formData.prenomDefunt || !formData.dateDeces || !formData.lieuDeces) {
                    Alert.alert('Champs requis', 'Veuillez remplir les informations sur le défunt.');
                    return false;
                }
            } else if (currentStep === 2) {
                if (!formData.nomDeclarant || !formData.prenomDeclarant || !formData.lienParente) {
                    Alert.alert('Champs requis', 'Veuillez remplir les informations sur le déclarant.');
                    return false;
                }
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const updateField = (key, value) => {
        setFormData({ ...formData, [key]: value });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const result = await demandeService.createDemande(type, formData);
            if (result.success) {
                Alert.alert('Succès', 'Votre demande a été soumise avec succès !', [
                    { text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'Mes dem...' }) }
                ]);
            }
        } catch (error) {
            Alert.alert('Erreur', error.response?.data?.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label, key, placeholder, keyboardType = 'default') => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={formData[key]}
                onChangeText={(v) => updateField(key, v)}
                placeholder={placeholder}
                keyboardType={keyboardType}
            />
        </View>
    );

    const renderStep = () => {
        if (type === 'naissance') {
            if (currentStep === 1) {
                return (
                    <View>
                        <Text style={styles.sectionTitle}>L'Enfant</Text>
                        {renderInput('Nom', 'nomEnfant', 'Nom de l\'enfant')}
                        {renderInput('Prénom(s)', 'prenomEnfant', 'Prénom(s) de l\'enfant')}
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={styles.label}>Sexe</Text>
                                <View style={styles.pickerRow}>
                                    <TouchableOpacity
                                        style={[styles.pickerBtn, formData.sexeEnfant === 'M' && styles.pickerBtnActive]}
                                        onPress={() => updateField('sexeEnfant', 'M')}
                                    >
                                        <Text style={[styles.pickerBtnText, formData.sexeEnfant === 'M' && styles.pickerBtnTextActive]}>M</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.pickerBtn, formData.sexeEnfant === 'F' && styles.pickerBtnActive]}
                                        onPress={() => updateField('sexeEnfant', 'F')}
                                    >
                                        <Text style={[styles.pickerBtnText, formData.sexeEnfant === 'F' && styles.pickerBtnTextActive]}>F</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                {renderInput('Heure', 'heureNaissanceEnfant', '00:00')}
                            </View>
                        </View>
                        {renderInput('Date de naissance', 'dateNaissanceEnfant', 'JJ/MM/AAAA')}
                        {renderInput('Lieu de naissance', 'lieuNaissanceEnfant', 'Ville/Hôpital')}
                    </View>
                );
            }
            if (currentStep === 2) {
                return (
                    <View>
                        <Text style={styles.sectionTitle}>Le Père</Text>
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>{renderInput('Nom', 'nomPere', 'Nom')}</View>
                            <View style={{ flex: 1, marginLeft: 8 }}>{renderInput('Prénom', 'prenomPere', 'Prénom')}</View>
                        </View>
                        {renderInput('Date de Naissance', 'dateNaissancePere', 'JJ/MM/AAAA')}
                        {renderInput('Lieu de Naissance', 'lieuNaissancePere', 'Ville')}
                        {renderInput('Profession', 'professionPere', 'Sa profession')}
                        {renderInput('Domicile', 'domicilePere', 'Adresse')}
                    </View>
                );
            }
            if (currentStep === 3) {
                return (
                    <View>
                        <Text style={styles.sectionTitle}>La Mère</Text>
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>{renderInput('Nom', 'nomMere', 'Nom')}</View>
                            <View style={{ flex: 1, marginLeft: 8 }}>{renderInput('Prénom', 'prenomMere', 'Prénom')}</View>
                        </View>
                        {renderInput('Date de Naissance', 'dateNaissanceMere', 'JJ/MM/AAAA')}
                        {renderInput('Lieu de Naissance', 'lieuNaissanceMere', 'Ville')}
                        {renderInput('Profession', 'professionMere', 'Sa profession')}
                        {renderInput('Domicile', 'domicileMere', 'Adresse')}
                    </View>
                );
            }
        }

        if (type === 'mariage') {
            if (currentStep === 1) {
                return (
                    <View>
                        <Text style={styles.sectionTitle}>L'Époux</Text>
                        {renderInput('Nom', 'nomEpoux', 'Nom')}
                        {renderInput('Prénom', 'prenomEpoux', 'Prénom')}
                        {renderInput('Date de Naissance', 'dateNaissanceEpoux', 'JJ/MM/AAAA')}
                        {renderInput('Profession', 'professionEpoux', 'Profession')}
                        {renderInput('Domicile', 'domicileEpoux', 'Adresse')}
                    </View>
                );
            }
            if (currentStep === 2) {
                return (
                    <View>
                        <Text style={styles.sectionTitle}>L'Épouse</Text>
                        {renderInput('Nom', 'nomEpouse', 'Nom')}
                        {renderInput('Prénom', 'prenomEpouse', 'Prénom')}
                        {renderInput('Date de Naissance', 'dateNaissanceEpouse', 'JJ/MM/AAAA')}
                        {renderInput('Profession', 'professionEpouse', 'Profession')}
                        {renderInput('Domicile', 'domicileEpouse', 'Adresse')}
                    </View>
                );
            }
            if (currentStep === 3) {
                return (
                    <View>
                        <Text style={styles.sectionTitle}>Le Mariage</Text>
                        {renderInput('Date du mariage', 'dateMariage', 'JJ/MM/AAAA')}
                        {renderInput('Lieu du mariage', 'lieuMariage', 'Ville/Commune')}
                        <Text style={styles.label}>Régime Matrimonial</Text>
                        <View style={styles.pickerColumn}>
                            {['monogamie', 'polygamie', 'communaute_biens'].map((r) => (
                                <TouchableOpacity
                                    key={r}
                                    style={[styles.rBtn, formData.regimeMatrimonial === r && styles.rBtnActive]}
                                    onPress={() => updateField('regimeMatrimonial', r)}
                                >
                                    <Text style={[styles.rText, formData.regimeMatrimonial === r && styles.rTextActive]}>
                                        {r.replace('_', ' ').charAt(0).toUpperCase() + r.replace('_', ' ').slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );
            }
        }

        if (type === 'deces') {
            if (currentStep === 1) {
                return (
                    <View>
                        <Text style={styles.sectionTitle}>Le Défunt</Text>
                        {renderInput('Nom', 'nomDefunt', 'Nom')}
                        {renderInput('Prénom', 'prenomDefunt', 'Prénom')}
                        {renderInput('Date de décès', 'dateDeces', 'JJ/MM/AAAA')}
                        {renderInput('Lieu de décès', 'lieuDeces', 'Ville')}
                        {renderInput('Cause (si connue)', 'causeDeces', 'Ex: Maladie')}
                    </View>
                );
            }
            if (currentStep === 2) {
                return (
                    <View>
                        <Text style={styles.sectionTitle}>Le Déclarant</Text>
                        {renderInput('Nom du déclarant', 'nomDeclarant', 'Nom')}
                        {renderInput('Prénom du déclarant', 'prenomDeclarant', 'Prénom')}
                        {renderInput('Lien de parenté', 'lienParente', 'Ex: Fils, Père...')}
                        {renderInput('Domicile', 'domicileDeclarant', 'Adresse')}
                    </View>
                );
            }
        }

        return <Text>Formulaire pour {type}</Text>;
    };

    const maxSteps = type === 'naissance' ? 3 : (type === 'mariage' ? 3 : 2);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft size={28} color="#003399" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Demande: {type.toUpperCase()}</Text>
                <View style={styles.stepIndicator}>
                    <Text style={styles.stepText}>{currentStep}/{maxSteps}</Text>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll}>
                    <View style={styles.infoBox}>
                        <Info size={18} color="#003399" />
                        <Text style={styles.infoText}>Étape {currentStep}: Remplissez les informations avec précision.</Text>
                    </View>

                    {renderStep()}

                    <View style={styles.footer}>
                        {currentStep > 1 && (
                            <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentStep(prev => prev - 1)}>
                                <ArrowLeft size={20} color="#003399" />
                                <Text style={styles.backBtnText}>Précédent</Text>
                            </TouchableOpacity>
                        )}

                        {currentStep < maxSteps ? (
                            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                                <Text style={styles.nextBtnText}>Continuer</Text>
                                <ArrowRight size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.submitBtn} onPress={() => validateStep() && handleSubmit()} disabled={loading}>
                                {loading ? <ActivityIndicator color="#FFF" /> : (
                                    <>
                                        <Text style={styles.submitBtnText}>Soumettre</Text>
                                        <CheckCircle size={20} color="#FFFFFF" />
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF'
    },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#003399' },
    stepIndicator: { backgroundColor: '#E7F5FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    stepText: { color: '#003399', fontWeight: 'bold', fontSize: 12 },
    scroll: { padding: 24 },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#E7F5FF',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24
    },
    infoText: { marginLeft: 10, color: '#003399', fontSize: 13 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#001a41', marginBottom: 20 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: '#495057', marginBottom: 8 },
    input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DEE2E6', borderRadius: 10, padding: 12, fontSize: 15 },
    row: { flexDirection: 'row', gap: 0 },
    pickerRow: { flexDirection: 'row', gap: 8 },
    pickerBtn: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#DEE2E6', borderRadius: 10, alignItems: 'center', backgroundColor: '#FFF' },
    pickerBtnActive: { backgroundColor: '#003399', borderColor: '#003399' },
    pickerBtnText: { color: '#495057', fontWeight: 'bold' },
    pickerBtnTextActive: { color: '#FFFFFF' },
    pickerColumn: { gap: 8 },
    rBtn: { padding: 12, borderWidth: 1, borderColor: '#DEE2E6', borderRadius: 10, backgroundColor: '#FFF' },
    rBtnActive: { backgroundColor: '#E7F5FF', borderColor: '#003399' },
    rText: { color: '#495057', fontSize: 14 },
    rTextActive: { color: '#003399', fontWeight: 'bold' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, gap: 12 },
    backBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DEE2E6' },
    backBtnText: { marginLeft: 8, color: '#003399', fontWeight: 'bold' },
    nextBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, backgroundColor: '#003399' },
    nextBtnText: { marginRight: 8, color: '#FFFFFF', fontWeight: 'bold' },
    submitBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, backgroundColor: '#2F9E44' },
    submitBtnText: { marginRight: 8, color: '#FFFFFF', fontWeight: 'bold' },
});
