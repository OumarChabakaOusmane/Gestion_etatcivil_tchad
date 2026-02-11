const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Routes administratives unifiées
// Accessible aux admins et aux agents
router.get('/dashboard-stats', authMiddleware, roleMiddleware('admin', 'agent'), adminController.getDashboardStats);

module.exports = router;
