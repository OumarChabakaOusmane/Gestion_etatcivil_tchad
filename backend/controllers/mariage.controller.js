const Mariage = require('../models/Mariage');

/**
 * Crée un nouvel acte de mariage
 * @route POST /api/mariages
 * @access Privé (Agent d'état civil)
 */
const createMariage = async (req, res) => {
  try {
    // Vérification de l'authentification
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé. Veuillez vous connecter.'
      });
    }

    // Récupération des données de la requête
    const {
      // Époux
      nomEpoux,
      dateNaissanceEpoux,
      lieuNaissanceEpoux,
      nationaliteEpoux,
      professionEpoux,
      domicileEpoux,
      temoin1Epoux,
      temoin2Epoux,
      signatureEpoux,

      // Épouse
      nomEpouse,
      dateNaissanceEpouse,
      lieuNaissanceEpouse,
      nationaliteEpouse,
      professionEpouse,
      domicileEpouse,
      temoin1Epouse,
      temoin2Epouse,
      signatureEpouse,

      // Mariage
      dateMariage,
      lieuMariage,
      regimeMatrimonial,
      dotMontant,
      dotConditions,

      // Admin
      numeroActe,
      dateDeclaration
    } = req.body;

    // Validation des champs obligatoires
    if (!nomEpoux || !dateNaissanceEpoux || !lieuNaissanceEpoux ||
      !nomEpouse || !dateNaissanceEpouse || !lieuNaissanceEpouse ||
      !dateMariage || !lieuMariage || !regimeMatrimonial || !numeroActe) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être renseignés.'
      });
    }

    // Création de l'acte de mariage
    const mariageData = {
      // Époux
      nomEpoux,
      dateNaissanceEpoux: new Date(dateNaissanceEpoux),
      lieuNaissanceEpoux,
      nationaliteEpoux: nationaliteEpoux || null,
      professionEpoux: professionEpoux || null,
      domicileEpoux: domicileEpoux || null,
      temoin1Epoux: temoin1Epoux || null,
      temoin2Epoux: temoin2Epoux || null,
      signatureEpoux: signatureEpoux || null,

      // Épouse
      nomEpouse,
      dateNaissanceEpouse: new Date(dateNaissanceEpouse),
      lieuNaissanceEpouse,
      nationaliteEpouse: nationaliteEpouse || null,
      professionEpouse: professionEpouse || null,
      domicileEpouse: domicileEpouse || null,
      temoin1Epouse: temoin1Epouse || null,
      temoin2Epouse: temoin2Epouse || null,
      signatureEpouse: signatureEpouse || null,

      // Mariage
      dateMariage: new Date(dateMariage),
      lieuMariage,
      regimeMatrimonial,
      dotMontant: dotMontant || null,
      dotConditions: dotConditions || null,

      // Admin
      numeroActe,
      dateDeclaration: dateDeclaration ? new Date(dateDeclaration) : new Date(),
      creePar: req.user.id
    };

    const nouveauMariage = await Mariage.create(mariageData);

    res.status(201).json({
      success: true,
      message: 'Acte de mariage créé avec succès',
      data: nouveauMariage
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'acte de mariage :', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la création de l\'acte de mariage',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Récupère tous les actes de mariage
 * @route GET /api/mariages
 * @access Privé (Admin)
 */
const getAllMariages = async (req, res) => {
  try {
    const { limit = 10, startAfter } = req.query;

    const mariages = await Mariage.findAll({
      limit: parseInt(limit),
      startAfter: startAfter || null
    });

    res.status(200).json({
      success: true,
      count: mariages.length,
      data: mariages
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des actes de mariage :', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des actes de mariage',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Récupère un acte de mariage par son ID
 * @route GET /api/mariages/:id
 * @access Privé (Admin)
 */
const getMariageById = async (req, res) => {
  try {
    const mariage = await Mariage.findById(req.params.id);

    if (!mariage) {
      return res.status(404).json({
        success: false,
        message: 'Acte de mariage non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: mariage
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'acte de mariage :', error);

    if (error.code === 'not-found') {
      return res.status(404).json({
        success: false,
        message: 'Acte de mariage non trouvé'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération de l\'acte de mariage',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createMariage,
  getAllMariages,
  getMariageById
};