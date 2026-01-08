const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, fixAdminRole } = require('../controllers/auth.controller');
const { registerValidation, loginValidation } = require('../validators/auth.validator');

// Route d'inscription
router.post('/register', registerValidation, register);

// Route de connexion
router.post('/login', loginValidation, login);

// Route mot de passe oublié
router.post('/forgot-password', forgotPassword);

// Route de dépannage pour forcer le rôle admin
router.get('/fix-admin', fixAdminRole);

module.exports = router;