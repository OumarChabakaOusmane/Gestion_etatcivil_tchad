const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, admin } = require('../middlewares/auth.middleware');

// Routes administratives unifiées
// Accessible aux admins et aux agents (protect vérifie l'auth, admin permet de filtrer si besoin)
router.get('/dashboard-stats', protect, adminController.getDashboardStats);

module.exports = router;
