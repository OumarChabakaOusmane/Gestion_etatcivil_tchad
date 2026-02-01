const { Expo } = require('expo-server-sdk');

// Créer une nouvelle instance du client SDK Expo
let expo = new Expo();

const sendPushNotification = async (pushToken, title, body, data = {}) => {
    if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`❌ Token de notification invalide: ${pushToken}`);
        return false;
    }

    const messages = [];
    messages.push({
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
        priority: 'high',
    });

    try {
        const chunks = expo.chunkPushNotifications(messages);
        const tickets = [];

        for (const chunk of chunks) {
            try {
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
                console.log('🔔 Notification envoyée:', ticketChunk);
            } catch (error) {
                console.error('Erreur envoi notification:', error);
            }
        }

        return true;
    } catch (error) {
        console.error('Erreur globale notification:', error);
        return false;
    }
};

module.exports = { sendPushNotification };
