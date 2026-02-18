import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, ActivityIndicator } from 'react-native';
import { Home, FilePlus, ClipboardList, LifeBuoy, User, Menu } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

// Components
import CustomDrawer from '../components/CustomDrawer';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerifyOtpScreen from '../screens/VerifyOtpScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateDemandeScreen from '../screens/CreateDemandeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ServicesScreen from '../screens/ServicesScreen';
import MesDemandesScreen from '../screens/MesDemandesScreen';
import SupportScreen from '../screens/SupportScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Protected Screen Wrapper Component
const ProtectedScreen = ({ component: Component, navigation }) => {
    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        return <LoginScreen navigation={navigation} />;
    }

    return <Component navigation={navigation} />;
};

function MainDrawerNavigator() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawer {...props} />}
            screenOptions={{
                drawerStyle: {
                    width: '80%',
                    backgroundColor: '#FFFFFF',
                },
                headerStyle: {
                    backgroundColor: '#f97316', // Orange
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                drawerActiveTintColor: '#003399',
                drawerInactiveTintColor: '#64748b',
                drawerLabelStyle: {
                    fontSize: 16,
                    fontWeight: '600',
                },
            }}
        >
            <Drawer.Screen
                name="Accueil"
                component={HomeScreen}
                options={{
                    title: 'Tableau de bord',
                    drawerLabel: 'Accueil'
                }}
            />

            <Drawer.Screen
                name="Services"
                component={ServicesScreen}
                options={{
                    title: 'Nouvelle Demande',
                    drawerLabel: 'Services'
                }}
            />

            <Drawer.Screen
                name="Mes Demandes"
                options={{
                    title: 'Mes Demandes',
                    drawerLabel: 'Mes Demandes'
                }}
            >
                {(props) => <ProtectedScreen {...props} component={MesDemandesScreen} />}
            </Drawer.Screen>

            <Drawer.Screen
                name="Support"
                component={SupportScreen}
                options={{
                    title: 'Aide & Support',
                    drawerLabel: 'Contact'
                }}
            />

            <Drawer.Screen
                name="Profil"
                options={{
                    title: 'Mon Profil',
                    drawerLabel: 'Compte'
                }}
            >
                {(props) => <ProtectedScreen {...props} component={ProfileScreen} />}
            </Drawer.Screen>
        </Drawer.Navigator>
    );
}

export default function AppNavigator() {
    console.log('🧭 AppNavigator: Rendering');
    const { loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
                <ActivityIndicator size="large" color="#003399" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="MainDrawer" component={MainDrawerNavigator} />
                <Stack.Screen name="CreateDemande" component={CreateDemandeScreen} />
                {/* Auth Stack (direct access if needed) */}
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
