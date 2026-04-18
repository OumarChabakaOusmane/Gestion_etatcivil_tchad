const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, verifyOtp, resendOtp, resetPassword, googleLogin } = require('../controllers/auth.controller');
const { registerValidation, loginValidation } = require('../validators/auth.validator');
const { authLimiter } = require('../middlewares/rateLimiter');

// Route d'inscription
router.post('/register', authLimiter, registerValidation, register);

// Route de connexion
router.post('/login', authLimiter, loginValidation, login);

// Route d'authentification Google
router.post('/google', authLimiter, googleLogin);

// Route mot de passe oublié
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:resetToken', authLimiter, resetPassword);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/resend-otp', authLimiter, resendOtp);



module.exports = router;