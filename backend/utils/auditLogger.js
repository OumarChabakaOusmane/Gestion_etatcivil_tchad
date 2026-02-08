const AuditLog = require('../models/auditLog.model');

/**
 * Enregistre une action sensible dans le système
 * @param {Object} req - Objet Request Express (contient req.user et req.ip)
 * @param {string} action - Code de l'action (ex: 'LOGIN', 'VALIDATE_ACT')
 * @param {string|Object} details - Détails lisibles ou objet structuré
 */
const logAction = async (req, action, details) => {
    try {
        const user = req.user || {};
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        const logEntry = {
            userId: user.id || user._id || 'ANONYMOUS',
            userEmail: user.email || 'N/A',
            userRole: user.role || 'N/A',
            userName: user.nom ? `${user.prenom} ${user.nom}` : 'Inconnu',
            action,
            details: typeof details === 'object' ? JSON.stringify(details) : details,
            ip: ip || 'Unknown',
            userAgent: req.headers['user-agent'] || 'Unknown'
        };

        // Créer le log de manière asynchrone (non bloquante)
        // On capture l'erreur pour éviter qu'une panne de Firestore n'impacte l'utilisateur
        AuditLog.create(logEntry).catch(err => {
            if (err.code === 9) {
                console.warn('⚠️ ALERTE INDEX : L\'index composite pour audit_logs est manquant. Consultez le plan de résolution.');
            } else {
                console.error('Failed to write audit log (Connectivity issue):', err.message);
            }
        });

    } catch (error) {
        // Cette erreur est propre au logger, elle ne doit JAMAIS bloquer le serveur
        console.error('Error within logAction utility:', error.message);
    }
};

module.exports = logAction;
