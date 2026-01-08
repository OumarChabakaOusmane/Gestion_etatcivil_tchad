const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/user.model');
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

  const { nom, prenom, email, password, role, telephone } = req.body;

  try {
    // Création de l'utilisateur via le modèle User
    const user = await User.create({
      nom,
      prenom,
      email,
      password,
      role,
      telephone
    });

    // Réponse de succès (on ne renvoie pas le mot de passe)
    return res.status(201).json({
      success: true,
      message: 'Utilisateur enregistré avec succès',
      data: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        telephone: user.telephone
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement :', error);
    try {
      // LOG ERROR TO FILE
      const fs = require('fs');
      const path = require('path');
      fs.appendFileSync(path.join(__dirname, '../error_log.txt'), `${new Date().toISOString()} - ${error.stack}\n`);
    } catch (e) { console.error('Log failed', e); }

    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'enregistrement',
      error: error.message // FORCE SHOW ERROR
    });
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

    // Créer le payload du token
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role || 'user' // Rôle par défaut si non défini
      }
    };

    // Générer le token JWT
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Le token expire après 24 heures
    );

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

    // SIMULATION D'ENVOI D'EMAIL (pour le développement)
    console.log('=================================================');
    console.log('🔗 LIEN DE RÉINITIALISATION (SIMULATION D\'EMAIL)');
    console.log(`POUR: ${email}`);
    console.log(`LIEN: ${resetUrl}`);
    console.log('=================================================');

    res.status(200).json({
      success: true,
      message: 'Un email de réinitialisation a été envoyé (Regardez la console serveur pour le lien)'
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
 * @route   GET /api/auth/fix-admin
 * @desc    Force le rôle admin pour un email donné (OUTIL DE DÉPANNAGE)
 * @access  Public
 */
const fixAdminRole = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email requis en paramètre query (?email=...)' });
  }

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    await User.update(user.id, { role: 'admin' });

    return res.json({
      success: true,
      message: `Rôle ADMIN attribué avec succès à ${email}`,
      user: { ...user, role: 'admin' }
    });

  } catch (error) {
    console.error('Erreur fixAdminRole:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  fixAdminRole
};
