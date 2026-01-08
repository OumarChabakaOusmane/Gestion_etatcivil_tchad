const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

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

        // Hasher le nouveau mot de passe
        const salt = await bcrypt.genSalt(10);
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

        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Rôle invalide'
            });
        }

        await User.update(id, { role });

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

module.exports = {
    getProfile,
    updateProfile,
    updatePassword,
    getAllUsers,
    updateUserRole,
    deleteUser
};
