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
        <ScrollView style={styles.container}>
            <View style={styles.section}>
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
    grid: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'center',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#001a41',
    },
    cardDescription: {
        fontSize: 12,
        color: '#6c757d',
        marginTop: 2,
    },
});
