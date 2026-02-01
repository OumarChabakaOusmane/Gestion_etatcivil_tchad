const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const AuditLog = require('../models/auditLog.model');

/**
 * @desc    Get all audit logs (Admin only)
 * @route   GET /api/logs
 * @access  Private (Admin)
 */
router.get('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const { limit, startAfter, action, userId } = req.query;

        const logs = await AuditLog.findAll({
            limit: parseInt(limit) || 50,
            startAfter,
            action,
            userId
        });

        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du journal'
        });
    }
});

module.exports = router;
