const Demande = require('../models/demande.model');
const User = require('../models/user.model');

/**
 * Récupère toutes les statistiques pour le Dashboard en un seul appel
 * @route GET /api/admin/dashboard-stats
 * @access Privé (Admin/Agent)
 */
const getDashboardStats = async (req, res) => {
    try {
        console.log('📊 Récupération des statistiques unifiées du Dashboard...');

        // Exécuter toutes les requêtes en parallèle pour une performance maximale
        const [stats, recentDemandes, recentUsers, totalUsers] = await Promise.all([
            Demande.getStatistics(),
            Demande.findAll({ limit: 10 }),
            User.findRecent(5),
            User.countAll()
        ]);

        // Population manuelle des données utilisateurs pour les demandes récentes
        // On le fait ici pour éviter de modifier le modèle findAll et garder sa généricité
        const populatedDemandes = await Promise.all(recentDemandes.demandes.map(async (demande) => {
            if (demande.userId) {
                const user = await User.findById(demande.userId);
                return { ...demande, userId: user };
            }
            return demande;
        }));

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    ...stats,
                    totalUsers
                },
                recentDemandes: populatedDemandes,
                recentUsers
            }
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des stats dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques du dashboard',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getDashboardStats
};
