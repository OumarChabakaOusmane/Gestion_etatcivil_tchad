const Naissance = require('../models/Naissance');

/**
 * Crée un nouvel acte de naissance
 * @route POST /api/naissances
 * @access Privé (Agent d'état civil)
 */
const createNaissance = async (req, res) => {
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
      // Données de l'enfant
      nomEnfant,
      prenomEnfant,
      sexe,
      dateNaissance,
      heureNaissance,
      lieuNaissance,
      
      // Données du père
      nomPere,
      dateNaissancePere,
      lieuNaissancePere,
      nationalitePere,
      professionPere,
      
      // Données de la mère
      nomMere,
      dateNaissanceMere,
      lieuNaissanceMere,
      nationaliteMere,
      professionMere,
      
      // Adresse
      domicileParents,
      
      // Admin
      numeroActe,
      dateDeclaration
    } = req.body;

    // Validation des champs obligatoires
    if (!nomEnfant || !prenomEnfant || !sexe || !dateNaissance || !lieuNaissance ||
        !nomPere || !dateNaissancePere || !lieuNaissancePere ||
        !nomMere || !dateNaissanceMere || !lieuNaissanceMere ||
        !domicileParents || !numeroActe) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être renseignés.'
      });
    }

    // Création de l'acte de naissance
    const naissanceData = {
      // Données de l'enfant
      nomEnfant,
      prenomEnfant,
      sexe,
      dateNaissance: new Date(dateNaissance),
      heureNaissance: heureNaissance || null,
      lieuNaissance,
      
      // Données du père
      nomPere,
      dateNaissancePere: new Date(dateNaissancePere),
      lieuNaissancePere,
      nationalitePere: nationalitePere || null,
      professionPere: professionPere || null,
      
      // Données de la mère
      nomMere,
      dateNaissanceMere: new Date(dateNaissanceMere),
      lieuNaissanceMere,
      nationaliteMere: nationaliteMere || null,
      professionMere: professionMere || null,
      
      // Adresse
      domicileParents,
      
      // Admin
      numeroActe,
      dateDeclaration: dateDeclaration ? new Date(dateDeclaration) : new Date(),
      creePar: req.user.id
    };

    const nouvelleNaissance = await Naissance.create(naissanceData);

    res.status(201).json({
      success: true,
      message: 'Acte de naissance créé avec succès',
      data: nouvelleNaissance
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'acte de naissance :', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la création de l\'acte de naissance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Récupère tous les actes de naissance
 * @route GET /api/naissances
 * @access Privé (Agent d'état civil)
 */
const getAllNaissances = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const startAfter = req.query.startAfter || null;

    const naissances = await Naissance.findAll({
      limit: parseInt(limit),
      startAfter
    });

    res.status(200).json({
      success: true,
      count: naissances.length,
      data: naissances
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des actes de naissance :', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des actes de naissance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Récupère un acte de naissance par son ID
 * @route GET /api/naissances/:id
 * @access Privé (Agent d'état civil)
 */
const getNaissanceById = async (req, res) => {
  try {
    const naissance = await Naissance.findById(req.params.id);

    if (!naissance) {
      return res.status(404).json({
        success: false,
        message: 'Acte de naissance non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: naissance
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'acte de naissance :', error);
    
    if (error.code === 'not-found') {
      return res.status(404).json({
        success: false,
        message: 'Acte de naissance non trouvé'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération de l\'acte de naissance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createNaissance,
  getAllNaissances,
  getNaissanceById
};