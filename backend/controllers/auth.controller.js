const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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
    
    // Gestion des erreurs spécifiques
    if (error.message.includes('existe déjà')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Erreur serveur générique
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'enregistrement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

module.exports = {
  register,
  login
};
