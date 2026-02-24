import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { FileText, Heart, UserMinus, ShieldCheck } from 'lucide-react-native';

const ServiceCard = ({ icon: Icon, title, description, color, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
            <Icon size={24} color={color} />
        </View>
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
        </View>
    </TouchableOpacity>
);

export default function ServicesScreen({ navigation }) {
    const services = [
        {
            title: 'Acte de Naissance',
            description: 'Demander une copie ou un extrait d\'acte de naissance.',
            icon: FileText,
            color: '#003399',
            type: 'naissance'
        },
        {
            title: 'Acte de Mariage',
            description: 'Demander un certificat de mariage civil.',
            icon: Heart,
            color: '#e63946',
            type: 'mariage'
        },
        {
            title: 'Acte de Décès',
            description: 'Déclarer un décès ou demander un acte de décès.',
            icon: UserMinus,
            color: '#6d6875',
            type: 'deces'
        },
        {
            title: 'Légalisation',
            description: 'Faire légaliser vos documents officiels.',
            icon: ShieldCheck,
            color: '#2a9d8f',
            type: 'legalisation'
        }
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Services</Text>
                <Text style={styles.subtitle}>Sélectionnez l'acte que vous souhaitez demander</Text>
            </View>

            <View style={styles.grid}>
                {services.map((service, index) => (
                    <ServiceCard
                        key={index}
                        {...service}
                        onPress={() => navigation.navigate('CreateDemande', { type: service.type })}
                    />
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 70 : 50,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F5',
        marginBottom: 20,
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
    },
    grid: {
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        padding: 20,
        borderRadius: 24,
        marginBottom: 16,
        alignItems: 'center',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 18,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#001a41',
    },
    cardDescription: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 4,
        lineHeight: 18,
    },
});
