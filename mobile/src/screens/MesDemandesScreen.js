import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, RefreshControl, Platform, TouchableOpacity } from 'react-native';
import { demandeService } from '../api/demandeService';
import { Clock, CheckCircle, XCircle, Edit2, FileText } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const StatusBadge = ({ status }) => {
    let config = {
        color: '#6c757d',
        bg: '#e9ecef',
        icon: Clock,
        text: 'En attente'
    };

    if (status === 'validée' || status === 'acceptée') {
        config = { color: '#2a9d8f', bg: '#e9f5f3', icon: CheckCircle, text: 'Validé' };
    } else if (status === 'rejetée') {
        config = { color: '#e63946', bg: '#fdf2f2', icon: XCircle, text: 'Rejeté' };
    }

    const { color, bg, icon: Icon, text } = config;

    return (
        <View style={[styles.badge, { backgroundColor: bg }]}>
            <Icon size={12} color={color} style={{ marginRight: 4 }} />
            <Text style={[styles.badgeText, { color }]}>{text}</Text>
        </View>
    );
};

export default function MesDemandesScreen() {
    const navigation = useNavigation();
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDemandes = async () => {
        try {
            const result = await demandeService.getMyDemandes();
            // L'API retourne { success: true, data: [...] }
            if (result && result.data) {
                setDemandes(result.data);
            } else if (Array.isArray(result)) {
                setDemandes(result);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDemandes();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDemandes();
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return 'Date inconnue';
        try {
            // Gérer les Timestamps Firestore ( {seconds, nanoseconds} )
            if (dateValue.seconds) {
                return new Date(dateValue.seconds * 1000).toLocaleDateString();
            }
            // Gérer les dates JS classiques ou ISO strings
            return new Date(dateValue).toLocaleDateString();
        } catch (e) {
            return 'Date invalide';
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.demandeItem}>
            <View style={styles.itemHeader}>
                <Text style={styles.itemType}>{item.type.charAt(0).toUpperCase() + item.type.slice(1).toLowerCase()}</Text>
                <StatusBadge status={item.statut} />
            </View>
            <Text style={styles.itemDate}>Demandé le : {formatDate(item.createdAt || item.dateDemande)}</Text>
            <Text style={styles.itemRef}>Réf: {item.id.substring(0, 8).toUpperCase()}</Text>

            {item.statut === 'en_attente' && (
                <View style={styles.itemActions}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('CreateDemande', { editingDemande: item })}
                    >
                        <Edit2 size={14} color="#004aad" />
                        <Text style={styles.editButtonText}>Modifier</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#001a41" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mes Demandes</Text>
                <Text style={styles.subtitle}>Suivez l'état d'avancement de vos actes</Text>
            </View>

            <FlatList
                data={demandes}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#003399']} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <FileText size={48} color="#CBD5E1" />
                        <Text style={styles.emptyText}>Aucune demande trouvée</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
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
    },
    list: {
        padding: 20,
    },
    demandeItem: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 24,
        marginBottom: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemType: {
        fontSize: 17,
        fontWeight: '800',
        color: '#001a41',
    },
    itemDate: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    itemRef: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 6,
        fontWeight: '600',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    emptyContainer: {
        paddingTop: 100,
        alignItems: 'center',
        gap: 16,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
        fontWeight: '500',
    },
    itemActions: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f1f3f5',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#E7F5FF',
    },
    editButtonText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#003399',
    },
});
