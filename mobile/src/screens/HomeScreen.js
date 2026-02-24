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

import { useFocusEffect } from '@react-navigation/native';

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

    useFocusEffect(
        useCallback(() => {
            if (isLoggedIn) {
                fetchDemandes();
            }
        }, [isLoggedIn])
    );

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
                    onPress={() => navigation.navigate('Profil')}
                >
                    <Text style={styles.mainLoginBtnText}>Accéder à mon espace</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => navigation.navigate('Services')}
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
            <View style={styles.privateHeaderSimple}>
                <View>
                    <Text style={styles.welcomeLabel}>Bienvenue,</Text>
                    <Text style={styles.userNameText}>{(user?.nom || "").toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} {(user?.prenom || "").toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</Text>
                    <Text style={styles.userRoleText}>Espace Citoyen Vérifié</Text>
                </View>
                <TouchableOpacity style={styles.bellBtn}>
                    <Bell size={24} color="#003399" />
                </TouchableOpacity>
            </View>

            <View style={styles.statsCardContainer}>
                <View style={[styles.statsCard, { backgroundColor: '#001a41' }]}>
                    <View style={styles.statsCardHeader}>
                        <ClipboardList size={20} color="rgba(255,255,255,0.6)" />
                        <Text style={styles.statsCardLabel}>Total Demandes</Text>
                    </View>
                    <Text style={styles.statsCardValue}>{demandes.length}</Text>
                </View>
                <View style={[styles.statsCard, { backgroundColor: '#059669' }]}>
                    <View style={styles.statsCardHeader}>
                        <CheckCircle size={20} color="rgba(255,255,255,0.6)" />
                        <Text style={styles.statsCardLabel}>Actes Validés</Text>
                    </View>
                    <Text style={styles.statsCardValue}>{demandes.filter(d => d.statut === 'acceptee').length}</Text>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitleText}>Actions Rapides</Text>
            </View>

            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={styles.quickActionCard}
                    onPress={() => navigation.navigate('Services')}
                >
                    <View style={[styles.iconCircle, { backgroundColor: '#E7F5FF' }]}>
                        <PlusCircle size={26} color="#003399" />
                    </View>
                    <Text style={styles.quickActionLab}>Demander</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickActionCard}
                    onPress={() => navigation.navigate('Mes Demandes')}
                >
                    <View style={[styles.iconCircle, { backgroundColor: '#F3F0FF' }]}>
                        <FileText size={26} color="#4C3BC9" />
                    </View>
                    <Text style={styles.quickActionLab}>Mes Actes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickActionCard}
                    onPress={() => navigation.navigate('Profil')}
                >
                    <View style={[styles.iconCircle, { backgroundColor: '#FFF5F5' }]}>
                        <User size={26} color="#E03131" />
                    </View>
                    <Text style={styles.quickActionLab}>Profil</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitleText}>Demandes Récentes</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Mes Demandes')}>
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
                    {demandes.slice(0, 3).map(item => {
                        const formatDate = (dateValue) => {
                            if (!dateValue) return 'Le --/--/----';
                            try {
                                if (dateValue.seconds) {
                                    return 'Le ' + new Date(dateValue.seconds * 1000).toLocaleDateString();
                                }
                                return 'Le ' + new Date(dateValue).toLocaleDateString();
                            } catch (e) {
                                return 'Le --/--/----';
                            }
                        };

                        const getMiniInfo = (item) => {
                            const { type, donnees } = item;
                            const formatName = (n, p) => {
                                if (!n && !p) return 'Non spécifié';
                                return `${(n || '').toUpperCase()} ${(p || '')}`;
                            };

                            if (type === 'naissance') {
                                return `Enfant: ${formatName(donnees.nomEnfant, donnees.prenomEnfant)}`;
                            } else if (type === 'mariage') {
                                return `Époux: ${formatName(donnees.nomEpoux, donnees.prenomEpoux)}`;
                            } else if (type === 'deces') {
                                return `Défunt: ${formatName(donnees.nomDefunt, donnees.prenomDefunt)}`;
                            }
                            return '';
                        };

                        return (
                            <TouchableOpacity key={item.id} style={styles.miniDemandeCard} onPress={() => navigation.navigate('Mes Demandes')}>
                                <View style={styles.miniHeader}>
                                    <View style={styles.miniTypeContainer}>
                                        <View style={[styles.typeIndicator, { backgroundColor: item.type === 'naissance' ? '#E7F5FF' : (item.type === 'mariage' ? '#F3F0FF' : '#FFF5F5') }]}>
                                            <FileText size={14} color={item.type === 'naissance' ? '#003399' : (item.type === 'mariage' ? '#4C3BC9' : '#E03131')} />
                                        </View>
                                        <Text style={styles.miniTypeText}>{item.type.toUpperCase()}</Text>
                                    </View>
                                    <View style={[styles.miniStatusBadge, getStatusStyle(item.statut)]}>
                                        <Text style={[styles.miniStatusText, { color: item.statut === 'acceptee' ? '#059669' : (item.statut === 'rejete' ? '#DC2626' : '#D97706') }]}>{item.statut}</Text>
                                    </View>
                                </View>
                                <Text style={styles.miniInfoText}>{getMiniInfo(item)}</Text>
                                <View style={styles.miniFooter}>
                                    <Clock size={12} color="#94a3b8" />
                                    <Text style={styles.miniDateText}>{formatDate(item.createdAt || item.dateDemande)}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
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
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
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
    privateHeaderSimple: {
        marginTop: 30,
        marginBottom: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    userNameText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#001a41',
        marginVertical: 4,
    },
    userRoleText: {
        fontSize: 12,
        color: '#003399',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    bellBtn: {
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    statsCardContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 30,
    },
    statsCard: {
        flex: 1,
        borderRadius: 24,
        padding: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    statsCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    statsCardLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    statsCardValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
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
        marginBottom: 35,
    },
    quickActionCard: {
        width: '31%',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 16,
        alignItems: 'center',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    quickActionLab: {
        fontSize: 12,
        fontWeight: '700',
        color: '#495057',
        textAlign: 'center',
    },
    recentList: {
        gap: 12,
    },
    miniDemandeCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    miniTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    typeIndicator: {
        width: 30,
        height: 30,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniTypeText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#001a41',
    },
    miniStatusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    miniStatusText: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    miniInfoText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#334155',
        marginVertical: 12,
    },
    miniFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    miniDateText: {
        fontSize: 13,
        color: '#94a3b8',
        fontWeight: '500',
    },
    statusPending: { backgroundColor: '#FFFBEB' },
    statusAccepted: { backgroundColor: '#F0FDF4' },
    statusRejected: { backgroundColor: '#FEF2F2' },
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
