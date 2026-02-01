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
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Aide & Support</Text>
                <Text style={styles.subtitle}>Nous sommes là pour vous accompagner</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <HelpCircle size={20} color="#001a41" style={{ marginRight: 8 }} />
                    <Text style={styles.sectionTitle}>Questions Fréquentes (FAQ)</Text>
                </View>
                {faqs.map((faq, index) => (
                    <FAQItem key={index} {...faq} />
                ))}
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <MessageSquare size={20} color="#001a41" style={{ marginRight: 8 }} />
                    <Text style={styles.sectionTitle}>Contactez-nous</Text>
                </View>

                <View style={styles.contactCard}>
                    <Text style={styles.label}>Nom complet</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Moussa Hassan"
                    />

                    <Text style={styles.label}>Message</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Comment pouvons-nous vous aider ?"
                        multiline
                        numberOfLines={4}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>Envoyer le message</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <Phone size={20} color="#001a41" />
                        <Text style={styles.infoText}>+235 00 00 00 00</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Mail size={20} color="#001a41" />
                        <Text style={styles.infoText}>support@sigec.td</Text>
                    </View>
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        padding: 24,
        paddingTop: 60,
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#001a41',
    },
    subtitle: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 4,
    },
    section: {
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#001a41',
    },
    faqCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        fontSize: 14,
        fontWeight: '600',
        color: '#495057',
        flex: 1,
    },
    faqAnswer: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 12,
        lineHeight: 20,
    },
    contactCard: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: '#F1F3F5',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#001a41',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    infoItem: {
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        flex: 0.48,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    infoText: {
        fontSize: 12,
        color: '#495057',
        marginTop: 8,
        fontWeight: '600',
    },
});
