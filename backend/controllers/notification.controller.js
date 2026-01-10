const Notification = require('../models/notification.model');

/**
 * Récupère toutes les notifications de l'utilisateur connecté
 */
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findByUserId(req.user.id);
        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        if (error.code === 14) {
            console.warn('⚠️ Attention: Firestore inaccessible (Problème DNS/Réseau). Impossible de récupérer les notifications.');
            res.status(503).json({
                success: false,
                message: 'Service temporairement indisponible (Connexion Base de Données)',
                error: 'Firestore unavailable'
            });
        } else {
            console.error('Erreur getNotifications:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des notifications',
                error: error.message
            });
        }
    }
};

/**
 * Marque une notification comme lue
 */
const markRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.markAsRead(id);
        res.status(200).json({
            success: true,
            message: 'Notification marquée comme lue'
        });
    } catch (error) {
        console.error('Erreur markRead:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la notification'
        });
    }
};

/**
 * Marque toutes les notifications comme lues
 */
const markAllRead = async (req, res) => {
    try {
        await Notification.markAllAsRead(req.user.id);
        res.status(200).json({
            success: true,
            message: 'Toutes les notifications ont été marquées comme lues'
        });
    } catch (error) {
        console.error('Erreur markAllRead:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour des notifications'
        });
    }
};

/**
 * Supprime une notification
 */
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.delete(id);
        res.status(200).json({
            success: true,
            message: 'Notification supprimée'
        });
    } catch (error) {
        console.error('Erreur deleteNotification:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la notification'
        });
    }
};

module.exports = {
    getNotifications,
    markRead,
    markAllRead,
    deleteNotification
};
