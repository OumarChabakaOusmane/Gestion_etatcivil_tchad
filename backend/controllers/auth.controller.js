const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/user.model');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');

const logAction = require('../utils/auditLogger');
require('dotenv').config();

/**
 * @route   POST /api/auth/register
 * @desc    Enregistre un nouvel utilisateur
 * @access  Public
 */
const register = async (req, res) => {
  // Validation des données
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { nom, prenom, email, password, role, telephone, photo } = req.body;

  try {
    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Création de l'utilisateur via le modèle User
    const user = await User.create({
      nom,
      prenom,
      email,
      password,
      role,
      telephone,
      photo,
      otpCode,
      otpExpires
    });

    // ENVOI OTP PAR EMAIL ET SMS (Async non-bloquant)
    try {
      emailService.sendOTPEmail(email, `${prenom} ${nom}`, otpCode);
      if (telephone) {
        smsService.sendOtpSms(telephone, otpCode);
      }
    } catch (mailSmsErr) {
      console.error('Échec envoi OTP (Email/SMS):', mailSmsErr);
    }

    // LOG OTP dans le terminal pour développement
    console.log('=================================================');
    console.log(`🔐 CODE OTP GÉNÉRÉ POUR ${email} : ${otpCode}`);
    console.log('=================================================');

    // Réponse de succès (on demande la vérification)
    return res.status(201).json({
      success: true,
      message: 'Compte créé. Veuillez vérifier votre email pour le code OTP.',
      requireVerification: true,
      email: user.email
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement :', error);
    try {
      // LOG ERROR TO FILE (Async)
      const fs = require('fs');
      const path = require('path');
      fs.appendFile(path.join(__dirname, '../error_log.txt'), `${new Date().toISOString()} - ${error.stack}\n`, (err) => {
        if (err) console.error('Log failed', err);
      });
    } catch (e) { console.error('Log failed', e); }

    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'enregistrement',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Vérifie le code OTP et active le compte
 * @access  Public
 */
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // Si le compte est déjà vérifié, connecter directement l'utilisateur
    if (user.isVerified) {
      const payload = {
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role
        }
      };

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        message: 'Compte déjà vérifié. Connexion automatique.',
        token,
        user: { ...user, password: undefined, otpCode: undefined, otpExpires: undefined, photo: user.photo || '' }
      });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ success: false, message: 'Code OTP invalide' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Code OTP expiré' });
    }

    // Valider le compte et effacer l'OTP
    await User.update(user.id, {
      isVerified: true,
      otpCode: null,
      otpExpires: null
    });

    // Générer le token JWT pour connecter directement l'utilisateur
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      message: 'Compte vérifié avec succès',
      token,
      user: { ...user, isVerified: true, otpCode: undefined, otpExpires: undefined, photo: user.photo || '' }
    });

  } catch (error) {
    console.error('Erreur verifyOtp:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Renvoie un nouveau code OTP
 * @access  Public
 */
const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Ce compte est déjà vérifié' });
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await User.update(user.id, { otpCode, otpExpires });

    // ENVOI EMAIL RÉEL
    try {
      await emailService.sendOTPEmail(email, `${user.prenom} ${user.nom}`, otpCode);
      console.log('=================================================');
      console.log(`🔄 RENVOI OTP POUR ${email} : ${otpCode}`);
      console.log('=================================================');
    } catch (emailError) {
      console.error('Erreur envoi email OTP:', emailError);
    }

    return res.json({
      success: true,
      message: 'Nouveau code OTP envoyé'
    });

  } catch (error) {
    console.error('Erreur resendOtp:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Connecte un utilisateur et retourne un token JWT
 * @access  Public
 */
const login = async (req, res) => {
  // Validation des données
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Vérifier si le compte est vérifié (OTP)
    if (user.isVerified === false) {
      return res.status(403).json({
        success: false,
        message: 'Veuillez vérifier votre compte (Email non validé)',
        requireVerification: true,
        email: user.email
      });
    }

    // Créer le payload du token
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role || 'user' // Rôle par défaut si non défini
      }
    };

    // Générer le token JWT
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Le token expire après 24 heures
    );

    // [AUDIT LOG] Enregistrer la connexion réussie
    // On attache manuellement le user à req car on n'est pas encore passé par les middlewares
    req.user = user;
    logAction(req, 'LOGIN_SUCCESS', 'Connexion au système');

    // Réponse de succès
    return res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        token,
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          telephone: user.telephone,
          photo: user.photo || '',
          role: user.role || 'user'
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la connexion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


/**
 * @route   POST /api/auth/forgot-password
 * @desc    Envoie un lien de réinitialisation de mot de passe
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Aucun utilisateur trouvé avec cet email'
      });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hasher le token et définir l'expiration (1 heure)
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 heure

    // Sauvegarder le token dans l'utilisateur
    await User.update(user.id, {
      resetPasswordToken,
      resetPasswordExpire
    });

    // Créer l'URL de réinitialisation (pour l'instant, lien frontend local)
    // Dans un cas réel, utiliser process.env.FRONTEND_URL ou similaire
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // ENVOI EMAIL DE RÉINITIALISATION
    try {
      await emailService.sendPasswordResetEmail(email, `${user.prenom} ${user.nom}`, resetUrl);
    } catch (mailErr) {
      console.error('Échec envoi email réinitialisation:', mailErr);
    }

    res.status(200).json({
      success: true,
      message: 'Un email de réinitialisation a été envoyé à votre adresse.'
    });

  } catch (error) {
    console.error('Erreur forgotPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de l\'email'
    });
  }
};

/**
 * @route   POST /api/auth/reset-password/:resetToken
 * @desc    Réinitialise le mot de passe
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findByResetToken(resetPasswordToken);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Jeton invalide ou expiré'
      });
    }

    // Hash new password (cost factor 8 for better performance)
    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Update user
    await User.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpire: null
    });

    res.status(200).json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur resetPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation du mot de passe'
    });
  }
};



module.exports = {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resendOtp,
  resetPassword
};
