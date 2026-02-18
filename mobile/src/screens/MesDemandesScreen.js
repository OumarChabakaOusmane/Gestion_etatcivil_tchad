import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, RefreshControl, Platform, TouchableOpacity } from 'react-native';
import { demandeService } from '../api/demandeService';
import { Clock, CheckCircle, XCircle, Edit2 } from 'lucide-react-native';

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
            <FlatList
                data={demandes}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#001a41']} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
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
    list: {
        padding: 16,
    },
    demandeItem: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        elevation: 2,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#001a41',
    },
    itemDate: {
        fontSize: 13,
        color: '#6c757d',
    },
    itemRef: {
        fontSize: 11,
        color: '#adb5bd',
        marginTop: 4,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        paddingTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        color: '#6c757d',
        fontSize: 16,
    },
    itemActions: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f3f5',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#f0f4ff',
    },
    editButtonText: {
        marginLeft: 6,
        fontSize: 13,
        fontWeight: 'bold',
        color: '#004aad',
    },
});
