import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

/**
 * Composant pour protéger les routes privées
 * Redirige vers login si non authentifié
 */
export default function ProtectedRoute({ children, adminOnly = false, superAdminOnly = false }) {
    const isAuthenticated = authService.isAuthenticated();
    const isAdmin = authService.isAdmin();
    const hasAdminAccess = authService.hasAdminAccess();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si on demande superAdminOnly (Utilisateurs, Logs, Settings)
    if (superAdminOnly && !isAdmin) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Si on demande adminOnly (Toutes les fonctions admin/agent)
    if (adminOnly && !hasAdminAccess) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
