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
import { ChevronLeft, Info, CheckCircle, ArrowRight, ArrowLeft, Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';

export default function CreateDemandeScreen({ route, navigation }) {
    const { isLoggedIn } = useAuth();
    const editingDemande = route.params?.editingDemande;
    const type = editingDemande?.type || route.params?.type || 'naissance';
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // Initial State based on type
    const getInitialData = () => {
        if (editingDemande) return editingDemande.donnees;
        if (type === 'naissance') {
            return {
                prenomEnfant: '', nomEnfant: '', sexeEnfant: 'M', dateNaissanceEnfant: '',
                heureNaissanceEnfant: '', lieuNaissanceEnfant: '',
                prenomPere: '', nomPere: '', dateNaissancePere: '', lieuNaissancePere: '',
                nationalitePere: 'TCHADIENNE', professionPere: '', domicilePere: '', nniPere: '',
                prenomMere: '', nomMere: '', dateNaissanceMere: '', lieuNaissanceMere: '',
                nationaliteMere: 'TCHADIENNE', professionMere: '', domicileMere: '', nniMere: ''
            };
        } else if (type === 'mariage') {
            return {
                nomEpoux: '', prenomEpoux: '', dateNaissanceEpoux: '', lieuNaissanceEpoux: '',
                nationaliteEpoux: 'TCHADIENNE', professionEpoux: '', domicileEpoux: '',
                temoin1Epoux: '', temoin2Epoux: '',
                nomEpouse: '', prenomEpouse: '', dateNaissanceEpouse: '', lieuNaissanceEpouse: '',
                nationaliteEpouse: 'TCHADIENNE', professionEpouse: '', domicileEpouse: '',
                temoin1Epouse: '', temoin2Epouse: '',
                dateMariage: '', lieuMariage: '', regimeMatrimonial: 'monogamie',
                dotMontant: '', dotConditions: ''
            };
        } else if (type === 'deces') {
            return {
                nomDefunt: '', prenomDefunt: '', sexeDefunt: 'M', dateDeces: '', lieuDeces: '', causeDeces: '',
                dateNaissanceDefunt: '', lieuNaissanceDefunt: '', nationaliteDefunt: 'TCHADIENNE',
                professionDefunt: '', nniDefunt: '', pereDefunt: '', mereDefunt: '',
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
                if (!formData.dateMariage || !formData.lieuMariage || !formData.dotMontant) {
                    Alert.alert('Champs requis', 'Veuillez indiquer la date, le lieu et le montant de la dot.');
                    return false;
                }
            }
        } else if (type === 'deces') {
            if (currentStep === 1) {
                if (!formData.nomDefunt || !formData.prenomDefunt || !formData.dateDeces || !formData.lieuDeces ||
                    !formData.dateNaissanceDefunt || !formData.lieuNaissanceDefunt || !formData.pereDefunt || !formData.mereDefunt) {
                    Alert.alert('Champs requis', 'Veuillez remplir toutes les informations obligatoires sur le défunt (Nom, Prénom, Date/Lieu de naissance, Parents, etc.).');
                    return false;
                }
            } else if (currentStep === 2) {
                if (!formData.nomDeclarant || !formData.prenomDeclarant || !formData.lienParente || !formData.domicileDeclarant) {
                    Alert.alert('Champs requis', 'Veuillez remplir les informations obligatoires sur le déclarant.');
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

    const formatDate = (text) => {
        // Remove any non-numeric characters
        const cleaned = text.replace(/\D/g, '');

        // Apply formatting
        let formatted = cleaned;
        if (cleaned.length > 2) {
            formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        }
        if (cleaned.length > 4) {
            formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
        }

        return formatted.slice(0, 10); // Limit to JJ/MM/AAAA
    };

    const updateField = (key, value) => {
        let finalValue = value;

        // Apply date formatting for relevant fields
        if (key.toLowerCase().includes('date')) {
            finalValue = formatDate(value);
        }

        setFormData({ ...formData, [key]: finalValue });
    };

    const handleSubmit = async () => {
        // Validation finale globale
        if (type === 'naissance') {
            if (!formData.nomEnfant || !formData.prenomEnfant || !formData.dateNaissanceEnfant || !formData.lieuNaissanceEnfant ||
                !formData.nomPere || !formData.prenomPere || !formData.nomMere || !formData.prenomMere) {
                Alert.alert('Formulaire incomplet', 'Veuillez remplir tous les champs obligatoires pour l\'enfant et ses parents.');
                return;
            }
        } else if (type === 'mariage') {
            if (!formData.nomEpoux || !formData.prenomEpoux || !formData.nomEpouse || !formData.prenomEpouse ||
                !formData.dateMariage || !formData.lieuMariage) {
                Alert.alert('Formulaire incomplet', 'Veuillez remplir les informations obligatoires sur les deux époux et le mariage.');
                return;
            }
        } else if (type === 'deces') {
            if (!formData.nomDefunt || !formData.prenomDefunt || !formData.dateDeces || !formData.lieuDeces ||
                !formData.dateNaissanceDefunt || !formData.lieuNaissanceDefunt || !formData.pereDefunt || !formData.mereDefunt ||
                !formData.nomDeclarant || !formData.prenomDeclarant) {
                Alert.alert('Formulaire incomplet', 'Veuillez fournir toutes les informations du défunt et du déclarant.');
                return;
            }
        }

        setLoading(true);
        try {
            let result;
            if (editingDemande) {
                result = await demandeService.updateDemande(editingDemande.id, { donnees: formData });
            } else {
                result = await demandeService.createDemande(type, formData);
            }

            if (result.success) {
                Alert.alert('Succès', editingDemande ? 'Votre demande a été mise à jour !' : 'Votre demande a été soumise avec succès !', [
                    { text: 'OK', onPress: () => navigation.navigate('MainDrawer', { screen: 'Mes Demandes' }) }
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
                keyboardType={keyboardType === 'default' && key.toLowerCase().includes('date') ? 'numeric' : keyboardType}
                maxLength={key.toLowerCase().includes('date') ? 10 : undefined}
            />
        </View>
    );

    const pickImage = async (key) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission requise', 'Désolé, nous avons besoin des permissions pour accéder à vos photos.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
            updateField(key, base64Image);
        }
    };

    const takePhoto = async (key) => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission requise', 'Désolé, nous avons besoin des permissions pour utiliser la caméra.');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
            updateField(key, base64Image);
        }
    };

    const renderNNIPicker = (label, key) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            {formData[key] ? (
                <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: formData[key] }} style={styles.imagePreview} />
                    <TouchableOpacity
                        style={styles.removeImageBtn}
                        onPress={() => updateField(key, '')}
                    >
                        <X size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.pickerActions}>
                    <TouchableOpacity style={styles.pickerActionBtn} onPress={() => takePhoto(key)}>
                        <Camera size={24} color="#003399" />
                        <Text style={styles.pickerActionText}>Prendre Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.pickerActionBtn} onPress={() => pickImage(key)}>
                        <ImageIcon size={24} color="#003399" />
                        <Text style={styles.pickerActionText}>Galerie</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderPicker = (label, key, options) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.pickerColumn}>
                {options.map((opt) => (
                    <TouchableOpacity
                        key={opt.value}
                        style={[styles.rBtn, formData[key] === opt.value && styles.rBtnActive]}
                        onPress={() => updateField(key, opt.value)}
                    >
                        <Text style={[styles.rText, formData[key] === opt.value && styles.rTextActive]}>
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
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
                        {renderPicker('Nationalité', 'nationalitePere', [
                            { label: 'TCHADIENNE', value: 'TCHADIENNE' },
                            { label: 'ÉTRANGER', value: 'ETRANGER' }
                        ])}
                        {renderInput('Profession', 'professionPere', 'Sa profession')}
                        {renderInput('Domicile', 'domicilePere', 'Adresse')}
                        {renderNNIPicker('Carte NNI du Père (Optionnel)', 'nniPere')}
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
                        {renderPicker('Nationalité', 'nationaliteMere', [
                            { label: 'TCHADIENNE', value: 'TCHADIENNE' },
                            { label: 'ÉTRANGER', value: 'ETRANGER' }
                        ])}
                        {renderInput('Profession', 'professionMere', 'Sa profession')}
                        {renderInput('Domicile', 'domicileMere', 'Adresse')}
                        {renderNNIPicker('Carte NNI de la Mère (Optionnel)', 'nniMere')}
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
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>{renderInput('Témoin 1', 'temoin1Epoux', 'Nom complet')}</View>
                            <View style={{ flex: 1, marginLeft: 8 }}>{renderInput('Témoin 2', 'temoin2Epoux', 'Nom complet')}</View>
                        </View>
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
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>{renderInput('Témoin 1', 'temoin1Epouse', 'Nom complet')}</View>
                            <View style={{ flex: 1, marginLeft: 8 }}>{renderInput('Témoin 2', 'temoin2Epouse', 'Nom complet')}</View>
                        </View>
                    </View>
                );
            }
            if (currentStep === 3) {
                return (
                    <View>
                        <Text style={styles.sectionTitle}>Le Mariage</Text>
                        {renderInput('Date du mariage', 'dateMariage', 'JJ/MM/AAAA')}
                        {renderInput('Lieu du mariage', 'lieuMariage', 'Ville/Commune')}
                        {renderPicker('Régime Matrimonial', 'regimeMatrimonial', [
                            { label: 'Monogamie / زوجة واحدة', value: 'monogamie' },
                            { label: 'Polygamie / تعدد الزوجات', value: 'polygamie' },
                            { label: 'Communauté de biens / اشتراك الأموال', value: 'communaute_biens' },
                            { label: 'Séparation de biens / فصل الأموال', value: 'separation_biens' }
                        ])}
                        {renderInput('Montant de la Dot', 'dotMontant', 'Ex: 250.000 FCFA')}
                        {renderInput('Conditions de la Dot', 'dotConditions', 'Ex: Versée en totalité')}
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
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={styles.label}>Sexe</Text>
                                <View style={styles.pickerRow}>
                                    <TouchableOpacity
                                        style={[styles.pickerBtn, formData.sexeDefunt === 'M' && styles.pickerBtnActive]}
                                        onPress={() => updateField('sexeDefunt', 'M')}
                                    >
                                        <Text style={[styles.pickerBtnText, formData.sexeDefunt === 'M' && styles.pickerBtnTextActive]}>M</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.pickerBtn, formData.sexeDefunt === 'F' && styles.pickerBtnActive]}
                                        onPress={() => updateField('sexeDefunt', 'F')}
                                    >
                                        <Text style={[styles.pickerBtnText, formData.sexeDefunt === 'F' && styles.pickerBtnTextActive]}>F</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                {renderNNIPicker('Carte NNI (Opt.)', 'nniDefunt')}
                            </View>
                        </View>
                        {renderInput('Profession', 'professionDefunt', 'Profession')}
                        {renderInput('Date de naissance', 'dateNaissanceDefunt', 'JJ/MM/AAAA')}
                        {renderInput('Lieu de naissance', 'lieuNaissanceDefunt', 'Ville')}
                        {renderInput('Père du défunt', 'pereDefunt', 'Nom du père')}
                        {renderInput('Mère du défunt', 'mereDefunt', 'Nom de la mère')}
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                {renderInput('Date de décès', 'dateDeces', 'JJ/MM/AAAA')}
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                {renderInput('Lieu de décès', 'lieuDeces', 'Ville')}
                            </View>
                        </View>
                        {renderInput('Cause (si connue)', 'causeDeces', 'Ex: Maladie')}
                        {renderPicker('Nationalité', 'nationaliteDefunt', [
                            { label: 'TCHADIENNE', value: 'TCHADIENNE' },
                            { label: 'ÉTRANGER', value: 'ETRANGER' }
                        ])}
                    </View>
                );
            }
            if (currentStep === 2) {
                return (
                    <View>
                        <Text style={styles.sectionTitle}>Le Déclarant</Text>
                        {renderInput('Nom du déclarant', 'nomDeclarant', 'Nom')}
                        {renderInput('Prénom du déclarant', 'prenomDeclarant', 'Prénom')}
                        {renderPicker('Lien de parenté', 'lienParente', [
                            { label: 'Père', value: 'Pere' },
                            { label: 'Mère', value: 'Mere' },
                            { label: 'Conjoint(e)', value: 'Conjoint' },
                            { label: 'Enfant', value: 'Enfant' },
                            { label: 'Frère / Sœur', value: 'Frere/Soeur' },
                            { label: 'Autre', value: 'Autre' }
                        ])}
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
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backHeaderBtn}>
                        <ChevronLeft size={28} color="#003399" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Demande : {type.toUpperCase()}</Text>
                    <View style={styles.stepIndicator}>
                        <Text style={styles.stepText}>{currentStep}/{maxSteps}</Text>
                    </View>
                </View>

                {/* Fixed Top Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarFill, { width: `${(currentStep / maxSteps) * 100}%` }]} />
                </View>

                {/* Premium Stepper */}
                <View style={styles.stepperContainer}>
                    {[...Array(maxSteps)].map((_, i) => (
                        <React.Fragment key={i}>
                            <View style={[
                                styles.stepCircle,
                                currentStep > i + 1 ? styles.stepCircleCompleted : (currentStep === i + 1 ? styles.stepCircleActive : {})
                            ]}>
                                {currentStep > i + 1 ? (
                                    <CheckCircle size={16} color="#FFF" />
                                ) : (
                                    <Text style={[
                                        styles.stepCircleText,
                                        currentStep >= i + 1 ? styles.stepCircleTextActive : {}
                                    ]}>{i + 1}</Text>
                                )}
                            </View>
                            {i < maxSteps - 1 && (
                                <View style={[
                                    styles.stepLine,
                                    currentStep > i + 1 ? styles.stepLineActive : {}
                                ]} />
                            )}
                        </React.Fragment>
                    ))}
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.infoBox}>
                        <Info size={18} color="#003399" />
                        <Text style={styles.infoText}>Étape {currentStep} : Remplissez les informations avec précision.</Text>
                    </View>

                    {renderStep()}

                    <View style={styles.footer}>
                        {currentStep > 1 ? (
                            <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentStep(prev => prev - 1)}>
                                <ArrowLeft size={20} color="#495057" />
                                <Text style={styles.backBtnText}>Précédent</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={{ flex: 1 }} />
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
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    progressBarContainer: {
        height: 3,
        backgroundColor: '#F1F3F5',
        width: '100%',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#003399',
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        backgroundColor: '#F8F9FA',
    },
    stepCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#DEE2E6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepCircleActive: {
        borderColor: '#003399',
        backgroundColor: '#FFF',
    },
    stepCircleCompleted: {
        borderColor: '#2F9E44',
        backgroundColor: '#2F9E44',
    },
    stepCircleText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ADB5BD',
    },
    stepCircleTextActive: {
        color: '#003399',
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: '#DEE2E6',
        marginHorizontal: 10,
    },
    stepLineActive: {
        backgroundColor: '#2F9E44',
    },
    backHeaderBtn: { padding: 4, marginLeft: -8 },
    headerTitle: { fontSize: 17, fontWeight: '800', color: '#003399', letterSpacing: 0.5 },
    stepIndicator: { backgroundColor: '#E7F5FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    stepText: { color: '#003399', fontWeight: '800', fontSize: 13 },
    scroll: { padding: 24, paddingBottom: 40 },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#E7F5FF',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(0, 51, 153, 0.1)'
    },
    infoText: { marginLeft: 12, color: '#003399', fontSize: 14, fontWeight: '500' },
    sectionTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 24 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', color: '#495057', marginBottom: 10, marginLeft: 4 },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E9ECEF',
        borderRadius: 14,
        padding: 16,
        fontSize: 16,
        color: '#1A1A1A',
        ...Platform.select({
            web: {
                boxShadow: '0px 1px 5px rgba(0,0,0,0.02)'
            },
            default: {
                elevation: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.02,
                shadowRadius: 5,
            }
        })
    },
    row: { flexDirection: 'row', gap: 0 },
    pickerRow: { flexDirection: 'row', gap: 12 },
    pickerBtn: {
        flex: 1,
        padding: 16,
        borderWidth: 1.5,
        borderColor: '#E9ECEF',
        borderRadius: 14,
        alignItems: 'center',
        backgroundColor: '#FFF'
    },
    pickerBtnActive: { backgroundColor: '#003399', borderColor: '#003399' },
    pickerBtnText: { color: '#495057', fontWeight: '800', fontSize: 16 },
    pickerBtnTextActive: { color: '#FFFFFF' },
    pickerColumn: { gap: 12 },
    rBtn: {
        padding: 18,
        borderWidth: 1.5,
        borderColor: '#E9ECEF',
        borderRadius: 14,
        backgroundColor: '#FFF'
    },
    rBtnActive: { backgroundColor: '#E7F5FF', borderColor: '#003399' },
    rText: { color: '#495057', fontSize: 15, fontWeight: '600' },
    rTextActive: { color: '#003399', fontWeight: '800' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, gap: 16 },
    backBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E9ECEF',
    },
    backBtnText: { marginLeft: 10, color: '#495057', fontWeight: '800', fontSize: 16 },
    nextBtn: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 16,
        backgroundColor: '#003399',
        ...Platform.select({
            web: {
                boxShadow: '0px 4px 10px rgba(0, 51, 153, 0.3)'
            },
            default: {
                elevation: 4,
                shadowColor: '#003399',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            }
        })
    },
    nextBtnText: { marginRight: 10, color: '#FFFFFF', fontWeight: '800', fontSize: 17 },
    submitBtn: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 16,
        backgroundColor: '#2F9E44',
        ...Platform.select({
            web: {
                boxShadow: '0px 4px 10px rgba(47, 158, 68, 0.3)'
            },
            default: {
                elevation: 4,
                shadowColor: '#2F9E44',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            }
        })
    },
    submitBtnText: { marginRight: 10, color: '#FFFFFF', fontWeight: '800', fontSize: 17 },
    imagePreviewContainer: {
        width: '100%',
        height: 200,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#003399',
        backgroundColor: '#F1F3F5',
        position: 'relative'
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    removeImageBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(230, 57, 70, 0.8)',
        padding: 8,
        borderRadius: 20
    },
    pickerActions: {
        flexDirection: 'row',
        gap: 12
    },
    pickerActionBtn: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E9ECEF',
        borderRadius: 14,
        gap: 8
    },
    pickerActionText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#003399'
    }
});
