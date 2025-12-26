const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

/**
 * @route   GET /api/users/me
 * @desc    Récupère les informations de l'utilisateur connecté
 * @access  Privé (nécessite un token JWT valide)
 */
router.get('/me', authMiddleware, (req, res) => {
  // Renvoie les informations de l'utilisateur extraites du token JWT
  res.status(200).json({
    success: true,
    user: req.user
  });
});

/**
 * @route   GET /api/users/admin-test
 * @desc    Route de test pour l'administration
 * @access  Privé (nécessite le rôle admin)
 */
router.get('/admin-test', authMiddleware, roleMiddleware('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Accès administrateur autorisé',
    user: req.user
  });
});

module.exports = router;