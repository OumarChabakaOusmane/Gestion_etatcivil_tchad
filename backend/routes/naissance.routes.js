const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const {
  createNaissance,
  getAllNaissances,
  getNaissanceById
} = require('../controllers/naissance.controller');

/**
 * @route   POST /api/naissances
 * @desc    Crée un nouvel acte de naissance
 * @access  Privé (Agent d'état civil)
 */
router.post('/', authMiddleware, createNaissance);

/**
 * @route   GET /api/naissances
 * @desc    Récupère tous les actes de naissance (avec pagination)
 * @access  Privé (Admin)
 */
router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  getAllNaissances
);

/**
 * @route   GET /api/naissances/:id
 * @desc    Récupère un acte de naissance par son ID
 * @access  Privé (Admin)
 */
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  getNaissanceById
);

module.exports = router;