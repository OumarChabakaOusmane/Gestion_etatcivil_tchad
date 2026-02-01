const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, verifyOtp, resendOtp, resetPassword } = require('../controllers/auth.controller');
const { registerValidation, loginValidation } = require('../validators/auth.validator');

// Route d'inscription
router.post('/register', registerValidation, register);

// Route de connexion
router.post('/login', loginValidation, login);

// Route mot de passe oublié
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);



module.exports = router;