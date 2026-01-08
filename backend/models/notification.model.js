const { db } = require('../config/firebase');

/**
 * Modèle pour les notifications
 */
class Notification {
    /**
     * Crée une nouvelle notification
     * @param {Object} data - Données de la notification
     */
    static async create(data) {
        const notifData = {
            userId: data.userId,
            title: data.title,
            message: data.message,
            type: data.type || 'info', // info, success, warning, danger
            read: false,
            link: data.link || null,
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('notifications').add(notifData);
        return { id: docRef.id, ...notifData };
    }

    /**
     * Récupère les notifications d'un utilisateur
     * @param {string} userId - ID de l'utilisateur
     */
    static async findByUserId(userId) {
        const snapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const notifications = [];
        snapshot.forEach(doc => {
            notifications.push({ id: doc.id, ...doc.data() });
        });
        return notifications;
    }

    /**
     * Marque une notification comme lue
     * @param {string} id - ID de la notification
     */
    static async markAsRead(id) {
        await db.collection('notifications').doc(id).update({ read: true });
        return true;
    }

    /**
     * Marque toutes les notifications d'un utilisateur comme lues
     * @param {string} userId - ID de l'utilisateur
     */
    static async markAllAsRead(userId) {
        const snapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .where('read', '==', false)
            .get();

        const batch = db.batch();
        snapshot.forEach(doc => {
            batch.update(doc.ref, { read: true });
        });
        await batch.commit();
        return true;
    }

    /**
     * Supprime une notification
     * @param {string} id - ID de la notification
     */
    static async delete(id) {
        await db.collection('notifications').doc(id).delete();
        return true;
    }
}

module.exports = Notification;
