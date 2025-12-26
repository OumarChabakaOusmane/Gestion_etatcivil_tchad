const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');

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

module.exports = router;