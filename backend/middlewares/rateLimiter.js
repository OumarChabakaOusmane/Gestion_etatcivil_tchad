const rateLimit = require('express-rate-limit');

/**
 * Limiteur général pour l'API (100 requêtes / 15 minutes)
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite à 100 requêtes
    message: {
        success: false,
        message: "Trop de requêtes effectuées depuis cette IP, veuillez réessayer après 15 minutes."
    },
    standardHeaders: true, // Retourne les infos dans les headers `RateLimit-*`
    legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
});

/**
 * Limiteur spécifique pour l'Authentification (5 tentatives / 15 minutes)
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // On laisse 10 tentatives car l'OTP et la connexion peuvent en nécessiter plusieurs
    message: {
        success: false,
        message: "Trop de tentatives de connexion ou d'inscription. Par sécurité, votre accès est bloqué pendant 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    authLimiter
};
