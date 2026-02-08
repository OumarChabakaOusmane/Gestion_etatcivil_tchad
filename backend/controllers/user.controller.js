const User = require('../models/user.model');
const bcrypt = require('bcryptjs'); // Needed for createUser if hashing locally, but User.create handles it.
const logAction = require('../utils/auditLogger');

/**
 * @desc    Create a new user (Admin only)
 * @route   POST /api/users
 * @access  Private (Admin)
 */
const createUser = async (req, res) => {
    try {
        const { nom, prenom, email, password, telephone, role } = req.body;

        // Validation basique
        if (!nom || !prenom || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez remplir tous les champs obligatoires'
            });
        }

        if (!['user', 'admin', 'agent'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Rôle invalide'
            });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Un utilisateur avec cet email existe déjà'
            });
        }

        // Création de l'utilisateur
        // Note: User.create s'occupe du hachage du mot de passe
        const newUser = await User.create({
            nom,
            prenom,
            email,
            password,
            telephone,
            role,
            isVerified: true // Les comptes créés par l'admin sont auto-vérifiés
        });

        // [AUDIT LOG]
        logAction(req, 'USER_CREATED', { email: newUser.email, role: newUser.role });

        res.status(201).json({
            success: true,
            data: newUser,
            message: 'Utilisateur créé avec succès'
        });
    } catch (error) {
        console.error('Erreur createUser:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la création de l\'utilisateur'
        });
    }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
const getProfile = async (req, res) => {
    try {
        const user = await User.findByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Ne pas renvoyer le mot de passe
        const { password, ...userData } = user;

        res.status(200).json({
            success: true,
            data: userData
        });
    } catch (error) {
        console.error('Erreur getProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du profil'
        });
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/me
 * @access  Private
 */
const updateProfile = async (req, res) => {
    try {
        const { nom, prenom, telephone, photo } = req.body;

        const updateData = {};
        if (nom) updateData.nom = nom;
        if (prenom) updateData.prenom = prenom;
        if (telephone) updateData.telephone = telephone;
        if (photo) updateData.photo = photo;

        await User.update(req.user.id, updateData);

        res.status(200).json({
            success: true,
            message: 'Profil mis à jour avec succès'
        });
    } catch (error) {
        console.error('Erreur updateProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du profil'
        });
    }
};

/**
 * @desc    Update user password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez fournir l\'ancien et le nouveau mot de passe'
            });
        }

        // Récupérer l'utilisateur avec son mot de passe actuel
        const user = await User.findByEmail(req.user.email);

        // Vérifier l'ancien mot de passe
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'L\'ancien mot de passe est incorrect'
            });
        }

        // Hasher le nouveau mot de passe (cost factor 8 for better performance)
        const salt = await bcrypt.genSalt(8);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Mettre à jour
        await User.update(req.user.id, { password: hashedPassword });

        res.status(200).json({
            success: true,
            message: 'Mot de passe mis à jour avec succès'
        });
    } catch (error) {
        console.error('Erreur updatePassword:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du mot de passe'
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Erreur getAllUsers:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des utilisateurs'
        });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role || !['user', 'admin', 'agent'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Rôle invalide'
            });
        }

        await User.update(id, { role });

        // [AUDIT LOG]
        logAction(req, 'ROLE_UPDATED', { targetUserId: id, newRole: role });

        res.status(200).json({
            success: true,
            message: 'Rôle mis à jour avec succès'
        });
    } catch (error) {
        console.error('Erreur updateUserRole:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du rôle'
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (id === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Vous ne pouvez pas supprimer votre propre compte'
            });
        }
        await User.delete(id);

        // [AUDIT LOG]
        logAction(req, 'USER_DELETED', { targetUserId: id });
        res.status(200).json({
            success: true,
            message: 'Utilisateur supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur deleteUser:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'utilisateur'
        });
    }
};

const updatePushToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token requis'
            });
        }
        await User.update(req.user.id, { expoPushToken: token });
        console.log(`🔔 Token Push mis à jour pour ${req.user.email}`);
        res.status(200).json({
            success: true,
            message: 'Token Push mis à jour'
        });
    } catch (error) {
        console.error('Erreur updatePushToken:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du token'
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    updatePassword,
    getAllUsers,
    updateUserRole,
    deleteUser,
    updatePushToken,
    createUser
};
