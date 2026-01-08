const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const {
  getProfile,
  updateProfile,
  updatePassword,
  getAllUsers,
  updateUserRole,
  deleteUser
} = require('../controllers/user.controller');

/**
 * @route   GET /api/users/me
 * @desc    Récupère les informations de l'utilisateur connecté
 * @access  Privé
 */
router.get('/me', authMiddleware, getProfile);

/**
 * @route   PUT /api/users/me
 * @desc    Met à jour le profil de l'utilisateur connecté
 * @access  Privé
 */
router.put('/me', authMiddleware, updateProfile);

/**
 * @route   PUT /api/users/change-password
 * @desc    Modifie le mot de passe de l'utilisateur
 * @access  Privé
 */
router.put('/change-password', authMiddleware, updatePassword);

/**
 * @route   GET /api/users
 * @desc    Récupère tous les utilisateurs
 * @access  Privé (Admin)
 */
router.get('/', authMiddleware, roleMiddleware('admin'), getAllUsers);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Met à jour le rôle d'un utilisateur
 * @access  Privé (Admin)
 */
router.patch('/:id/role', authMiddleware, roleMiddleware('admin'), updateUserRole);

/**
 * @route   DELETE /api/users/:id
 * @desc    Supprime un utilisateur
 * @access  Privé (Admin)
 */
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteUser);

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