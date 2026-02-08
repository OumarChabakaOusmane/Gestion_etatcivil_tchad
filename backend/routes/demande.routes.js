const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const {
    createDemande,
    getMyDemandes,
    getAllDemandes,
    getDemandeById,
    updateDemandeStatut,
    addDocuments,
    getStatistics,
    updateDemande,
    deleteDemande,
    verifyDemandePublique
} = require('../controllers/demande.controller');

/**
 * @route   GET /api/demandes/public/verifier/:id
 * @desc    Vérifie une demande publiquement (via QR Code)
 * @access  Publique
 */
router.get('/public/verifier/:id', verifyDemandePublique);

/**
 * @route   POST /api/demandes
 * @desc    Crée une nouvelle demande
 * @access  Privé (Utilisateur authentifié)
 */
router.post('/', authMiddleware, createDemande);

/**
 * @route   GET /api/demandes/me
 * @desc    Récupère les demandes de l'utilisateur connecté
 * @access  Privé (Utilisateur authentifié)
 */
router.get('/me', authMiddleware, getMyDemandes);

/**
 * @route   GET /api/demandes/stats
 * @desc    Récupère les statistiques des demandes
 * @access  Privé (Admin)
 */
router.get('/stats', authMiddleware, roleMiddleware('admin', 'agent'), getStatistics);

/**
 * @route   GET /api/demandes
 * @desc    Récupère toutes les demandes
 * @access  Privé (Admin)
 */
router.get('/', authMiddleware, roleMiddleware('admin', 'agent'), getAllDemandes);

/**
 * @route   GET /api/demandes/:id
 * @desc    Récupère une demande par son ID
 * @access  Privé (Utilisateur ou Admin)
 */
router.get('/:id', authMiddleware, getDemandeById);

/**
 * @route   PATCH /api/demandes/:id/statut
 * @desc    Met à jour le statut d'une demande (accepter/rejeter)
 * @access  Privé (Admin)
 */
router.patch('/:id/statut', authMiddleware, roleMiddleware('admin', 'agent'), updateDemandeStatut);

/**
 * @route   POST /api/demandes/:id/documents
 * @desc    Ajoute des documents à une demande
 * @access  Privé (Utilisateur propriétaire)
 */
router.post('/:id/documents', authMiddleware, addDocuments);

/**
 * @route   PATCH /api/demandes/:id
 * @desc    Met à jour une demande (citoyen)
 * @access  Privé (Utilisateur propriétaire)
 */
router.patch('/:id', authMiddleware, updateDemande);

/**
 * @route   DELETE /api/demandes/:id
 * @desc    Annule/Supprime une demande (citoyen)
 * @access  Privé (Utilisateur propriétaire)
 */
router.delete('/:id', authMiddleware, deleteDemande);

module.exports = router;
