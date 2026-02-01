import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Image,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { demandeService } from '../api/demandeService';
import {
    LogOut,
    FileText,
    PlusCircle,
    User,
    Clock,
    CheckCircle,
    XCircle,
    LayoutGrid,
    ClipboardList,
    LifeBuoy,
    Bell,
    ExternalLink
} from 'lucide-react-native';

export default function HomeScreen({ navigation }) {
    const { user, isLoggedIn, logout } = useAuth();
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDemandes = async () => {
        if (!isLoggedIn) {
            setLoading(false);
            return;
        }
        try {
            const result = await demandeService.getMyDemandes();
            if (result.success) {
                setDemandes(result.data);
            }
        } catch (error) {
            console.error('Erreur fetchDemandes:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDemandes();
    }, [isLoggedIn]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchDemandes();
    }, [isLoggedIn]);

    const getStatusIcon = (statut) => {
        switch (statut) {
            case 'acceptee': return <CheckCircle size={14} color="#2F9E44" />;
            case 'rejete': return <XCircle size={14} color="#E03131" />;
            default: return <Clock size={14} color="#F08C00" />;
        }
    };

    const getStatusStyle = (statut) => {
        switch (statut) {
            case 'acceptee': return styles.statusAccepted;
            case 'rejete': return styles.statusRejected;
            default: return styles.statusPending;
        }
    };

    const renderPublicView = () => (
        <ScrollView style={styles.publicContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.publicHeader}>
                <Text style={styles.publicTitleText}>ETAT CIVIL TCHAD</Text>
            </View>

            <View style={styles.contentContainer}>
                <Image
                    source={require('../../assets/logotechad.jpg')}
                    style={styles.coatOfArms}
                    resizeMode="contain"
                />

                <View style={styles.republicTitleContainer}>
                    <Text style={styles.republicText}>RÉPUBLIQUE DU TCHAD</Text>
                    <Text style={styles.mottoText}>Unité - Travail - Progrès</Text>
                </View>

                <Text style={styles.directionText}>
                    Direction Nationale de l'État Civil et des Archives
                </Text>

                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeIntro}>
                        Bienvenue sur la plateforme numérique officielle de l'État Civil, gérée par la Direction Nationale des Archives et de l'État Civil.
                    </Text>

                    <Text style={styles.welcomeBody}>
                        Cet Espace Citoyen Officiel est votre point d'accès unique pour la gestion, la consultation et la délivrance en ligne de vos actes d'état civil (naissance, mariage, décès) provenant de l'ensemble des centres d'état civil de la République du Tchad. Nous nous engageons à offrir un service public accessible, transparent et conforme aux standards de la modernisation administrative.
                    </Text>

                    <View style={styles.separator} />

                    <Text style={styles.actionPrompt}>
                        Effectuez vos démarches rapidement, sans vous déplacer, en toute sécurité et avec une validité juridique garantie.
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.mainLoginBtn}
                    onPress={() => navigation.navigate('Compte')}
                >
                    <Text style={styles.mainLoginBtnText}>Accéder à mon espace</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => navigation.navigate('Demande')}
                >
                    <Text style={styles.secondaryBtnText}>Explorer les services</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderPrivateView = () => (
        <ScrollView
            style={styles.privateContainer}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#003399" />
            }
        >
            <View style={styles.privateHeader}>
                <View>
                    <Text style={styles.welcomeLabel}>Bonjour,</Text>
                    <Text style={styles.userNameText}>{user?.prenom} {user?.nom}</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutIconBtn}>
                    <LogOut size={22} color="#E03131" />
                </TouchableOpacity>
            </View>

            <View style={styles.statsGrid}>
                <View style={[styles.statItem, { backgroundColor: '#001a41' }]}>
                    <Text style={styles.statVal}>{demandes.length}</Text>
                    <Text style={styles.statLab}>Demandes</Text>
                </View>
                <View style={[styles.statItem, { backgroundColor: '#2F9E44' }]}>
                    <Text style={styles.statVal}>{demandes.filter(d => d.statut === 'acceptee').length}</Text>
                    <Text style={styles.statLab}>Validées</Text>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitleText}>Actions Rapides</Text>
            </View>

            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={styles.quickActionCard}
                    onPress={() => navigation.navigate('Demande')}
                >
                    <View style={styles.iconCircle}>
                        <PlusCircle size={28} color="#003399" />
                    </View>
                    <Text style={styles.quickActionLab}>Nouvelle Demande</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickActionCard}
                    onPress={() => navigation.navigate('Mes dem...')}
                >
                    <View style={styles.iconCircle}>
                        <FileText size={28} color="#003399" />
                    </View>
                    <Text style={styles.quickActionLab}>Mes Actes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickActionCard}
                    onPress={() => navigation.navigate('Compte')}
                >
                    <View style={styles.iconCircle}>
                        <User size={28} color="#003399" />
                    </View>
                    <Text style={styles.quickActionLab}>Mon Profil</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitleText}>Demandes Récentes</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Mes dem...')}>
                    <Text style={styles.seeAllText}>Tout voir</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="small" color="#003399" style={{ marginTop: 20 }} />
            ) : demandes.length === 0 ? (
                <View style={styles.emptyRecentCard}>
                    <Text style={styles.emptyRecentText}>Aucune demande récente</Text>
                </View>
            ) : (
                <View style={styles.recentList}>
                    {demandes.slice(0, 3).map(item => (
                        <View key={item.id} style={styles.miniDemandeCard}>
                            <View style={styles.miniHeader}>
                                <View style={styles.miniTypeRow}>
                                    <FileText size={16} color="#001a41" />
                                    <Text style={styles.miniTypeText}>{item.type.toUpperCase()}</Text>
                                </View>
                                <View style={[styles.miniStatusBadge, getStatusStyle(item.statut)]}>
                                    <Text style={styles.miniStatusText}>{item.statut}</Text>
                                </View>
                            </View>
                            <Text style={styles.miniInfoText}>Enfant: {item.donnees.prenomEnfant} {item.donnees.nomEnfant}</Text>
                            <Text style={styles.miniDateText}>Le {new Date(item.createdAt).toLocaleDateString()}</Text>
                        </View>
                    ))}
                </View>
            )}
            <View style={{ height: 40 }} />
        </ScrollView>
    );

    return (
        <SafeAreaView style={styles.mainWrapper}>
            <StatusBar barStyle="dark-content" />
            {!isLoggedIn ? renderPublicView() : renderPrivateView()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    mainWrapper: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    // Public View Styles
    publicContainer: {
        flex: 1,
    },
    publicHeader: {
        height: 60,
        backgroundColor: '#003399',
        justifyContent: 'center',
        alignItems: 'center',
    },
    publicTitleText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    contentContainer: {
        padding: 24,
        alignItems: 'center',
    },
    coatOfArms: {
        width: 150,
        height: 150,
        marginVertical: 20,
    },
    republicTitleContainer: {
        alignItems: 'center',
        marginBottom: 8,
    },
    republicText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#003399',
    },
    mottoText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#64748b',
    },
    directionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 30,
    },
    welcomeCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 24,
    },
    welcomeIntro: {
        fontSize: 15,
        color: '#1e293b',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 16,
        fontWeight: '500',
    },
    welcomeBody: {
        fontSize: 14,
        color: '#475569',
        textAlign: 'justify',
        lineHeight: 20,
    },
    separator: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 16,
    },
    actionPrompt: {
        fontSize: 14,
        fontWeight: '700',
        color: '#003399',
        textAlign: 'center',
    },
    mainLoginBtn: {
        backgroundColor: '#003399',
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
    },
    mainLoginBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryBtn: {
        marginTop: 16,
        paddingVertical: 12,
        width: '100%',
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: '#003399',
        fontSize: 15,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },

    // Private View Styles
    privateContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    privateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 24,
    },
    welcomeLabel: {
        fontSize: 16,
        color: '#64748b',
    },
    userNameText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#001a41',
    },
    logoutIconBtn: {
        padding: 10,
        borderRadius: 12,
        backgroundColor: '#fee2e2',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    statItem: {
        flex: 1,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    statVal: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    statLab: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
        marginTop: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitleText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#001a41',
    },
    seeAllText: {
        color: '#003399',
        fontWeight: '600',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    quickActionCard: {
        width: '30%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    quickActionLab: {
        fontSize: 11,
        fontWeight: '700',
        color: '#001a41',
        textAlign: 'center',
    },
    recentList: {
        gap: 12,
    },
    miniDemandeCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    miniHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    miniTypeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    miniTypeText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#001a41',
    },
    miniStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    miniStatusText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    miniInfoText: {
        fontSize: 14,
        color: '#334155',
        marginBottom: 4,
    },
    miniDateText: {
        fontSize: 12,
        color: '#94a3b8',
    },
    statusPending: { backgroundColor: '#fef3c7' },
    statusAccepted: { backgroundColor: '#dcfce7' },
    statusRejected: { backgroundColor: '#fee2e2' },
    emptyRecentCard: {
        padding: 30,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    emptyRecentText: {
        color: '#94a3b8',
        fontSize: 14,
    }
});
