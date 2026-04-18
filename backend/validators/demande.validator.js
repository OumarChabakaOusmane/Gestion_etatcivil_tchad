const { body, validationResult } = require('express-validator');

/**
 * Middleware pour gérer les erreurs de validation
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

    return res.status(400).json({
        success: false,
        message: "Erreur de validation des données",
        errors: extractedErrors,
    });
};

/**
 * Règles de validation pour les demandes d'actes
 */
const demandeValidationRules = [
    body('type')
        .isIn(['naissance', 'mariage', 'deces'])
        .withMessage('Type de demande invalide'),

    body('donnees')
        .isObject()
        .withMessage('Les données de la demande doivent être un objet'),

    // Validation conditionnelle selon le type
    body('donnees.nomEnfant')
        .if(body('type').equals('naissance'))
        .trim().notEmpty().withMessage("Le nom de l'enfant est requis"),
    
    body('donnees.prenomEnfant')
        .if(body('type').equals('naissance'))
        .trim().notEmpty().withMessage("Le prénom de l'enfant est requis"),

    body('donnees.dateNaissanceEnfant')
        .if(body('type').equals('naissance'))
        .isDate().withMessage("Date de naissance invalide")
        .custom(value => {
            if (value) {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const [year, month, day] = value.split('-').map(Number);
                const inputDate = new Date(year, month - 1, day);
                if (inputDate > today) {
                    throw new Error("La date de naissance ne peut pas être dans le futur");
                }
            }
            return true;
        }),

    body('donnees.nomEpoux')
        .if(body('type').equals('mariage'))
        .trim().notEmpty().withMessage("Le nom de l'époux est requis"),

    body('donnees.nomEpouse')
        .if(body('type').equals('mariage'))
        .trim().notEmpty().withMessage("Le nom de l'épouse est requis"),

    body('donnees.dateMariage')
        .if(body('type').equals('mariage'))
        .isDate().withMessage("Date de mariage invalide")
        .custom(value => {
            if (value) {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const [year, month, day] = value.split('-').map(Number);
                const inputDate = new Date(year, month - 1, day);
                if (inputDate > today) {
                    throw new Error("La date du mariage ne peut pas être dans le futur");
                }
            }
            return true;
        }),

    body('donnees.nomDefunt')
        .if(body('type').equals('deces'))
        .trim().notEmpty().withMessage("Le nom du défunt est requis"),

    body('donnees.dateDeces')
        .if(body('type').equals('deces'))
        .isDate().withMessage("Date de décès invalide")
        .custom(value => {
            if (value) {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const [year, month, day] = value.split('-').map(Number);
                const inputDate = new Date(year, month - 1, day);
                if (inputDate > today) {
                    throw new Error("La date du décès ne peut pas être dans le futur");
                }
            }
            return true;
        }),
];

module.exports = {
    demandeValidationRules,
    validate
};
