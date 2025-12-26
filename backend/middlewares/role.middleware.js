/**
 * Middleware de gestion des rôles utilisateur
 * @param {...string} authorizedRoles - Rôles autorisés à accéder à la route
 * @returns {Function} Middleware Express
 */
const roleMiddleware = (...authorizedRoles) => {
  return (req, res, next) => {
    try {
      // Vérifier si l'utilisateur est connecté
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'Accès non autorisé. Utilisateur non authentifié.'
        });
      }

      // Vérifier si le rôle de l'utilisateur est autorisé
      if (!authorizedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          success: false,
          message: 'Accès refusé. Droits insuffisants pour cette action.'
        });
      }

      // Si tout est bon, passer au middleware suivant
      next();
    } catch (error) {
      console.error('Erreur dans le middleware de rôle:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la vérification des droits d\'accès.'
      });
    }
  };
};

module.exports = roleMiddleware;