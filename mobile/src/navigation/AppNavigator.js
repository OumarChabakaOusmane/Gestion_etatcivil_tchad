import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';
import { Home, FilePlus, ClipboardList, LifeBuoy, User } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerifyOtpScreen from '../screens/VerifyOtpScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateDemandeScreen from '../screens/CreateDemandeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ServicesScreen from '../screens/ServicesScreen';
import MesDemandesScreen from '../screens/MesDemandesScreen';
import SupportScreen from '../screens/SupportScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Protected Screen Wrapper Component
const ProtectedScreen = ({ component: Component, navigation }) => {
    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        return <LoginScreen navigation={navigation} />;
    }

    return <Component navigation={navigation} />;
};

function MainTabNavigator() {
    const { isLoggedIn } = useAuth();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'Accueil') return <Home size={24} color={color} />;
                    if (route.name === 'Demande') return <FilePlus size={24} color={color} />;
                    if (route.name === 'Mes dem...') return <ClipboardList size={24} color={color} />;
                    if (route.name === 'Contact') return <LifeBuoy size={24} color={color} />;
                    if (route.name === 'Compte') return <User size={24} color={color} />;
                },
                tabBarActiveTintColor: '#003399',
                tabBarInactiveTintColor: '#94a3b8',
                headerShown: false,
                tabBarStyle: {
                    height: 70,
                    paddingBottom: 12,
                    paddingTop: 8,
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#e2e8f0',
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                }
            })}
        >
            <Tab.Screen name="Accueil" component={HomeScreen} />

            <Tab.Screen name="Demande" component={ServicesScreen} />

            <Tab.Screen name="Mes dem..." options={{ tabBarLabel: 'Mes dem...' }}>
                {(props) => <ProtectedScreen {...props} component={MesDemandesScreen} />}
            </Tab.Screen>

            <Tab.Screen name="Contact" component={SupportScreen} />

            <Tab.Screen name="Compte">
                {(props) => <ProtectedScreen {...props} component={ProfileScreen} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
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
                <Stack.Screen name="MainTabs" component={MainTabNavigator} />
                <Stack.Screen name="CreateDemande" component={CreateDemandeScreen} />
                {/* Auth Stack (direct access if needed) */}
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
