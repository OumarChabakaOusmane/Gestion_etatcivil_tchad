import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { HelpCircle, Mail, Phone, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react-native';

const FAQItem = ({ question, answer }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <TouchableOpacity style={styles.faqCard} onPress={() => setExpanded(!expanded)}>
            <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{question}</Text>
                {expanded ? <ChevronUp size={20} color="#6c757d" /> : <ChevronDown size={20} color="#6c757d" />}
            </View>
            {expanded && <Text style={styles.faqAnswer}>{answer}</Text>}
        </TouchableOpacity>
    );
};

export default function SupportScreen() {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        if (!name || !message) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }
        Alert.alert('Succès', 'Votre message a été envoyé à l\'équipe de support.');
        setName('');
        setMessage('');
    };

    const faqs = [
        {
            question: "Comment suivre ma demande ?",
            answer: "Vous pouvez suivre l'état de votre demande dans l'onglet 'Mes Demandes'. Les statuts sont mis à jour en temps réel par l'administration."
        },
        {
            question: "Quels documents sont nécessaires ?",
            answer: "Les documents varient selon le type d'acte. Pour une naissance, il faut souvent un certificat d'accouchement et les pièces d'identité des parents."
        },
        {
            question: "Quel est le délai de traitement ?",
            answer: "Le délai moyen est de 48h à 72h ouvrables, selon la charge de travail du service d'état civil."
        }
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Aide & Support</Text>
                <Text style={styles.subtitle}>Notre équipe est là pour vous accompagner dans toutes vos démarches.</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionIcon}>
                        <HelpCircle size={20} color="#003399" />
                    </View>
                    <Text style={styles.sectionTitle}>Questions Fréquentes</Text>
                </View>
                {faqs.map((faq, index) => (
                    <FAQItem key={index} {...faq} />
                ))}
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionIcon}>
                        <MessageSquare size={20} color="#003399" />
                    </View>
                    <Text style={styles.sectionTitle}>Contactez-nous</Text>
                </View>

                <View style={styles.contactCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nom complet</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Entrez votre nom"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Votre message</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Comment pouvons-nous vous aider ?"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>Envoyer le message</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <View style={styles.infoIcon}>
                            <Phone size={20} color="#003399" />
                        </View>
                        <Text style={styles.infoText}>+235 62 96 55 33</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <View style={styles.infoIcon}>
                            <Mail size={20} color="#003399" />
                        </View>
                        <Text style={styles.infoText}>support@sigec.td</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 70 : 50,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F5',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#001a41',
    },
    subtitle: {
        fontSize: 15,
        color: '#64748b',
        fontWeight: '500',
        marginTop: 6,
        lineHeight: 22,
    },
    section: {
        paddingHorizontal: 20,
        paddingTop: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#E7F5FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#001a41',
    },
    faqCard: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 20,
        marginBottom: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        fontSize: 15,
        fontWeight: '700',
        color: '#334155',
        flex: 1,
        lineHeight: 20,
    },
    faqAnswer: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 15,
        lineHeight: 22,
    },
    contactCard: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 24,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9',
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
    textArea: {
        height: 120,
        textAlignVertical: 'top',
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
    infoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 25,
    },
    infoItem: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        flex: 0.48,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 12,
        color: '#495057',
        fontWeight: '700',
        textAlign: 'center',
    },
});
