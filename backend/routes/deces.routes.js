const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const {
    createDeces,
    getAllDeces,
    getDecesById
} = require('../controllers/deces.controller');

/**
 * @route   POST /api/deces
 * @desc    Crée un nouvel acte de décès
 * @access  Privé (Agent d'état civil)
 */
router.post('/', authMiddleware, createDeces);

/**
 * @route   GET /api/deces
 * @desc    Récupère tous les actes de décès (avec pagination)
 * @access  Privé (Admin)
 */
router.get(
    '/',
    authMiddleware,
    roleMiddleware('admin'),
    getAllDeces
);

/**
 * @route   GET /api/deces/:id
 * @desc    Récupère un acte de décès par son ID
 * @access  Privé (Admin)
 */
router.get(
    '/:id',
    authMiddleware,
    roleMiddleware('admin'),
    getDecesById
);

module.exports = router;
