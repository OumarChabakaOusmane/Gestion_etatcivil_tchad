const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const { registerValidation, loginValidation } = require('../validators/auth.validator');

// Route d'inscription
router.post('/register', registerValidation, register);

// Route de connexion
router.post('/login', loginValidation, login);

module.exports = router;