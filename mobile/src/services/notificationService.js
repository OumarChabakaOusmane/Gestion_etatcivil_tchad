import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const notificationService = {
    registerForPushNotificationsAsync: async () => {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }

            // Learn more about projectId:
            // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
            // const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId; 
            // Si pas de projectId, le token sera juste pour le device

            try {
                token = (await Notifications.getExpoPushTokenAsync({
                    // projectId: projectId, // Uncomment if using EAS
                })).data;
                console.log("🔥 Expo Push Token:", token);
            } catch (e) {
                console.error("Erreur récupération token:", e);
            }
        } else {
            // alert('Must use physical device for Push Notifications');
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    },

    addNotificationReceivedListener: (callback) => {
        return Notifications.addNotificationReceivedListener(callback);
    },

    addNotificationResponseReceivedListener: (callback) => {
        return Notifications.addNotificationResponseReceivedListener(callback);
    }
};
