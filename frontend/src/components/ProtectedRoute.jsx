import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

/**
 * Composant pour protéger les routes privées
 * Redirige vers login si non authentifié
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
    const isAuthenticated = authService.isAuthenticated();
    const isAdmin = authService.isAdmin();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
