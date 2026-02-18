import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Home, FilePlus, ClipboardList, LifeBuoy, User, LogOut, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

const CustomDrawer = (props) => {
    const { user, logout } = useAuth();

    return (
        <View style={styles.container}>
            {/* Header Orange style Moov Money */}
            <View style={styles.header}>
                <View style={styles.logoAndTitle}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/logotechad.jpg')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.headerTitle}>SIGEC Tchad</Text>
                </View>
                <Text style={styles.userName}>{user?.prenom} {user?.nom || 'Citoyen'}</Text>
            </View>

            <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
                {/* Liste des items de navigation */}
                <View style={styles.menuItems}>
                    {props.state.routes.map((route, index) => {
                        const { options } = props.descriptors[route.key];
                        const label = options.drawerLabel !== undefined ? options.drawerLabel : options.title !== undefined ? options.title : route.name;
                        const isFocused = props.state.index === index;

                        const renderIcon = () => {
                            const color = isFocused ? '#003399' : '#64748b';
                            if (route.name === 'Accueil') return <Home size={22} color={color} />;
                            if (route.name === 'Services') return <FilePlus size={22} color={color} />;
                            if (route.name === 'Mes Demandes') return <ClipboardList size={22} color={color} />;
                            if (route.name === 'Support') return <LifeBuoy size={22} color={color} />;
                            if (route.name === 'Profil') return <User size={22} color={color} />;
                            return null;
                        };

                        return (
                            <TouchableOpacity
                                key={route.key}
                                onPress={() => props.navigation.navigate(route.name)}
                                style={[styles.menuItem, isFocused && styles.menuItemActive]}
                            >
                                <View style={styles.menuItemLeft}>
                                    <View style={styles.iconContainer}>
                                        {renderIcon()}
                                    </View>
                                    <Text style={[styles.menuItemLabel, isFocused && styles.menuItemLabelActive]}>
                                        {label}
                                    </Text>
                                </View>
                                <ChevronRight size={16} color={isFocused ? '#003399' : '#cbd5e1'} />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </DrawerContentScrollView>

            {/* Footer avec Déconnexion */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <LogOut size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        backgroundColor: '#f97316', // Orange Moov Money
        paddingTop: 60,
        paddingBottom: 25,
        paddingHorizontal: 20,
    },
    logoAndTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    logoContainer: {
        width: 50,
        height: 50,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
        opacity: 0.9,
    },
    drawerContent: {
        paddingTop: 10,
    },
    menuItems: {
        paddingHorizontal: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 12,
        marginBottom: 5,
    },
    menuItemActive: {
        backgroundColor: '#eff6ff',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 35,
        alignItems: 'center',
        marginRight: 15,
    },
    menuItemLabel: {
        fontSize: 16,
        color: '#475569',
        fontWeight: '500',
    },
    menuItemLabelActive: {
        color: '#003399',
        fontWeight: '700',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    logoutText: {
        marginLeft: 15,
        fontSize: 16,
        color: '#ef4444',
        fontWeight: '600',
    },
});

export default CustomDrawer;
