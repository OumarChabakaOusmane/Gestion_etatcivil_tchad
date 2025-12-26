const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const {
  createMariage,
  getAllMariages,
  getMariageById
} = require('../controllers/mariage.controller');

/**
 * @route   POST /api/mariages
 * @desc    Crée un nouvel acte de mariage
 * @access  Privé (Agent d'état civil)
 */
router.post('/', authMiddleware, createMariage);

/**
 * @route   GET /api/mariages
 * @desc    Récupère tous les actes de mariage (avec pagination)
 * @access  Privé (Admin)
 */
router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  getAllMariages
);

/**
 * @route   GET /api/mariages/:id
 * @desc    Récupère un acte de mariage par son ID
 * @access  Privé (Admin)
 */
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  getMariageById
);

module.exports = router;