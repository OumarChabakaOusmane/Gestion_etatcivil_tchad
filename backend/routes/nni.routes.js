const express = require('express');
const router = express.Router();
const nniController = require('../controllers/nni.controller');

// Route ouverte pour l'OCR, ou on peut la protéger.
// Ici on la laisse ouverte ou on ajoute le middleware auth
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/ocr', authMiddleware, nniController.parseNni);

module.exports = router;
