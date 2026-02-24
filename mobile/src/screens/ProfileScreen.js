import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Shield, LogOut, ChevronLeft, Languages } from 'lucide-react-native';

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.nom ? user.nom[0].toUpperCase() : ''}
                            {user?.prenom ? user.prenom[0].toUpperCase() : ''}
                        </Text>
                    </View>
                    <Text style={styles.name}>{(user?.nom || "").toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} {(user?.prenom || "").toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{user?.role?.toUpperCase()}</Text>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Mail size={20} color="#6c757d" />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{user?.email}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Phone size={20} color="#6c757d" />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Téléphone</Text>
                            <Text style={styles.infoValue}>{user?.telephone || 'Non renseigné'}</Text>
                        </View>
                    </View>

                </View>

                <Text style={styles.sectionTitle}>Préférences</Text>
                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Languages size={20} color="#6c757d" />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Langue de l'application</Text>
                            <View style={styles.langToggle}>
                                <TouchableOpacity style={[styles.langBtn, styles.activeLang]}>
                                    <Text style={styles.activeLangText}>Français</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.langBtn}>
                                    <Text style={styles.langBtnText}>العربية</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={logout}
                >
                    <LogOut size={20} color="#FA5252" />
                    <Text style={styles.logoutText}>Déconnexion</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingTop: 60,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F5',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#001a41',
    },
    backBtn: {
        padding: 4,
    },
    content: {
        padding: 24,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#001a41',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#001a41',
    },
    badge: {
        backgroundColor: '#E7F5FF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1864AB',
    },
    infoSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F5',
    },
    infoTextContainer: {
        marginLeft: 16,
    },
    infoLabel: {
        fontSize: 12,
        color: '#868E96',
    },
    infoValue: {
        fontSize: 16,
        color: '#001a41',
        fontWeight: '500',
        marginTop: 2,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF5F5',
        padding: 18,
        borderRadius: 16,
        marginTop: 32,
        gap: 12,
        borderWidth: 1,
        borderColor: '#FFE3E3',
    },
    logoutText: {
        color: '#FA5252',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#868E96',
        marginTop: 24,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    langToggle: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 10,
    },
    langBtn: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#F1F3F5',
    },
    activeLang: {
        backgroundColor: '#001a41',
    },
    langBtnText: {
        fontSize: 14,
        color: '#495057',
        fontWeight: '600',
    },
    activeLangText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
