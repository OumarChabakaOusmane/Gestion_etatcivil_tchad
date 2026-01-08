const Deces = require('../models/Deces');

/**
 * Crée un nouvel acte de décès
 * @route POST /api/deces
 * @access Privé (Agent d'état civil)
 */
const createDeces = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est authentifié
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Non autorisé. Veuillez vous connecter.'
            });
        }

        // Récupération des données de la requête
        const {
            // Données du défunt
            nomDefunt,
            dateNaissanceDefunt,
            lieuNaissanceDefunt,
            dateDeces,
            lieuDeces,
            causeDeces,

            // Données du déclarant
            nomDeclarant,
            lienParente,

            // Admin
            numeroActe,
            dateDeclaration
        } = req.body;

        // Validation des champs obligatoires
        if (!nomDefunt || !dateNaissanceDefunt || !lieuNaissanceDefunt ||
            !dateDeces || !lieuDeces ||
            !nomDeclarant || !lienParente ||
            !numeroActe) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs obligatoires doivent être renseignés.'
            });
        }

        // Création de l'acte de décès
        const decesData = {
            // Données du défunt
            nomDefunt,
            dateNaissanceDefunt: new Date(dateNaissanceDefunt),
            lieuNaissanceDefunt,
            dateDeces: new Date(dateDeces),
            lieuDeces,
            causeDeces: causeDeces || null,

            // Données du déclarant
            nomDeclarant,
            lienParente,

            // Admin
            numeroActe,
            dateDeclaration: dateDeclaration ? new Date(dateDeclaration) : new Date(),
            creePar: req.user.id
        };

        const nouveauDeces = await Deces.create(decesData);

        res.status(201).json({
            success: true,
            message: 'Acte de décès créé avec succès',
            data: nouveauDeces
        });

    } catch (error) {
        console.error('Erreur lors de la création de l\'acte de décès :', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la création de l\'acte de décès',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Récupère tous les actes de décès
 * @route GET /api/deces
 * @access Privé (Agent d'état civil)
 */
const getAllDeces = async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const startAfter = req.query.startAfter || null;

        const deces = await Deces.findAll({
            limit: parseInt(limit),
            startAfter
        });

        res.status(200).json({
            success: true,
            count: deces.length,
            data: deces
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des actes de décès :', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la récupération des actes de décès',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Récupère un acte de décès par son ID
 * @route GET /api/deces/:id
 * @access Privé (Agent d'état civil)
 */
const getDecesById = async (req, res) => {
    try {
        const deces = await Deces.findById(req.params.id);

        if (!deces) {
            return res.status(404).json({
                success: false,
                message: 'Acte de décès non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: deces
        });

    } catch (error) {
        console.error('Erreur lors de la récupération de l\'acte de décès :', error);

        if (error.code === 'not-found') {
            return res.status(404).json({
                success: false,
                message: 'Acte de décès non trouvé'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la récupération de l\'acte de décès',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    createDeces,
    getAllDeces,
    getDecesById
};
