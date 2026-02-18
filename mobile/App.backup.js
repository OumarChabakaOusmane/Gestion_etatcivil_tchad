import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { notificationService } from './src/services/notificationService';

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    notificationService.registerForPushNotificationsAsync();

    notificationListener.current = notificationService.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification reçue!', notification);
    });

    responseListener.current = notificationService.addNotificationResponseReceivedListener(response => {
      console.log('👉 Notification cliquée!', response);
    });

    return () => {
      notificationListener.current && notificationService.addNotificationReceivedListener(notificationListener.current);
      responseListener.current && notificationService.addNotificationResponseReceivedListener(responseListener.current);
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
