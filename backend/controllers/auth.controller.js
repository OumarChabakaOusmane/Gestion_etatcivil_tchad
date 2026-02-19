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

    console.log('='.repeat(60));
    console.log(`🔐 [OTP] Nouveau compte créé pour: ${email}`);
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 [OTP] CODE DE VÉRIFICATION: ${otpCode}`);
      console.log(`🔐 [OTP] Expire dans 10 minutes`);
    }
    console.log('='.repeat(60));

    // ENVOI OTP PAR EMAIL (ASYNCHRONE pour la performance)
    console.log(`📧 [OTP] Envoi en arrière-plan à ${email}...`);
    emailService.sendOTPEmail(email, `${prenom} ${nom}`, otpCode)
      .then(() => {
        console.log(`✅ [OTP] CODE DE VÉRIFICATION: ${otpCode}`);
        console.log(`✅ [OTP] Email OTP envoyé avec succès à ${email}`);
      })
      .catch(err => {
        console.error('❌ [OTP] ÉCHEC envoi Email OTP:', err.message);
      });

    const emailSent = true; // On assume l'envoi pour l'UI

    if (telephone) {
      smsService.sendOtpSms(telephone, otpCode)
        .catch(err => console.error('Échec envoi SMS OTP (Async):', err.message));
    }

    // Réponse de succès
    return res.status(201).json({
      success: true,
      message: 'Compte créé avec succès ! Veuillez vérifier votre email (et vos spams) pour le code de validation.',
      requireVerification: true,
      email: user.email,
      emailSent: emailSent
      // SOLUTION DE SECOURS SUPPRIMÉE POUR LA SÉCURITÉ (Sur demande encadreur)
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement :', error);

    // Gérer l'erreur spécifique de duplication
    if (error.message === 'Un utilisateur avec cet email existe déjà') {
      return res.status(400).json({
        success: false,
        message: 'Un compte avec cet email existe déjà.',
        error: error.message
      });
    }

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

  console.log(`🔐 [VERIFY OTP] Email: ${email}, OTP: "${otp}"`);

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      console.log(`❌ [VERIFY OTP] Utilisateur non trouvé: ${email}`);
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    console.log(`✅ [VERIFY OTP] Utilisateur trouvé - OTP attendu: "${user.otpCode}", OTP reçu: "${otp}"`);

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

    // Comparaison des OTP
    if (user.otpCode !== otp) {
      console.log(`❌ [VERIFY OTP] CODE INCORRECT! Attendu: "${user.otpCode}", Reçu: "${otp}"`);
      return res.status(400).json({ success: false, message: 'Veuillez entrer le bon OTP' });
    }

    console.log(`✅ [VERIFY OTP] Code OTP correspond! Vérification expiration...`);

    if (user.otpExpires < Date.now()) {
      console.log(`❌ [VERIFY OTP] Code expiré!`);
      return res.status(400).json({ success: false, message: 'Code OTP expiré' });
    }

    console.log(`✅ [VERIFY OTP] Code valide et non expiré!`);

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

    // ENVOI EMAIL RÉEL (ASYNCHRONE)
    emailService.sendOTPEmail(email, `${user.prenom} ${user.nom}`, otpCode)
      .then(() => {
        console.log('=================================================');
        console.log(`🔄 RENVOI OTP POUR ${email} : ${otpCode}`);
        console.log('=================================================');
      })
      .catch(emailError => {
        console.error('❌ [RESEND OTP] Erreur envoi email:', emailError.message);
      });

    const emailSent = true;

    return res.json({
      success: true,
      message: emailSent
        ? 'Nouveau code OTP envoyé ! Vérifiez votre email (et le dossier spam).'
        : 'ATTENTION: L\'email n\'a pas pu être envoyé. Utilisez le code affiché ci-dessous pour valider votre compte.',
      emailSent: emailSent
      // SOLUTION DE SECOURS SUPPRIMÉE POUR LA SÉCURITÉ
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

    // ENVOI EMAIL DE RÉINITIALISATION (Asynchrone - Fire-and-forget pour éviter le timeout)
    // On n'attend pas la réponse du serveur SMTP pour répondre au client
    emailService.sendPasswordResetEmail(email, `${user.prenom} ${user.nom}`, resetUrl)
      .then(() => console.log(`✅ Email de réinitialisation envoyé avec succès à ${email}`))
      .catch(mailErr => {
        console.error('❌ Échec envoi email réinitialisation:', mailErr.message);
        console.error('❌ Stack:', mailErr.stack);
      });

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
