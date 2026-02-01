const { db } = require('../config/firebase');

class AuditLog {
    static collectionName = 'audit_logs';

    /**
     * Crée une nouvelle entrée de journal d'audit
     * @param {Object} logData
     * @returns {Promise<Object>}
     */
    static async create(logData) {
        try {
            const newLog = {
                ...logData,
                createdAt: new Date().toISOString(),
                timestamp: Date.now() // Pour tri facile
            };

            const docRef = await db.collection(this.collectionName).add(newLog);
            return { id: docRef.id, ...newLog };
        } catch (error) {
            console.error('Erreur lors de la création du log:', error);
            // On ne throw pas l'erreur pour ne pas bloquer l'action principale si le log échoue
            return null;
        }
    }

    /**
     * Récupère les logs avec pagination et filtres
     */
    static async findAll({ limit = 50, startAfter = null, action = null, userId = null }) {
        let query = db.collection(this.collectionName).orderBy('timestamp', 'desc');

        if (action) {
            query = query.where('action', '==', action);
        }

        if (userId) {
            query = query.where('userId', '==', userId);
        }

        if (startAfter) {
            query = query.startAfter(startAfter);
        }

        const snapshot = await query.limit(limit).get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
}

module.exports = AuditLog;
