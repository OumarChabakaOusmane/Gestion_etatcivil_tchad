import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

/**
 * Composant pour protéger les routes privées
 * Redirige vers login si non authentifié
 * ✅ Anti-crash : délai court pour attendre l'initialisation du localStorage (mobile/navigateurs lents)
 */
export default function ProtectedRoute({ children, adminOnly = false, superAdminOnly = false }) {
    const [isReady, setIsReady] = useState(false);
    const [authState, setAuthState] = useState({ isAuthenticated: false, isAdmin: false, hasAdminAccess: false });

    useEffect(() => {
        // Délai minimal pour garantir que localStorage est lisible (fix crash mobile/Firefox/Safari)
        const timer = setTimeout(() => {
            try {
                const isAuthenticated = authService.isAuthenticated();
                const isAdmin = authService.isAdmin();
                const hasAdminAccess = authService.hasAdminAccess();
                const mustChange = authService.mustChangePassword();
                setAuthState({ isAuthenticated, isAdmin, hasAdminAccess, mustChange });
            } catch (e) {
                // Si localStorage inaccessible (mode privé navigateur), forcer login
                setAuthState({ isAuthenticated: false, isAdmin: false, hasAdminAccess: false, mustChange: false });
            }
            setIsReady(true);
        }, 50);

        return () => clearTimeout(timer);
    }, []);

    // Afficher un loader minimal pendant l'initialisation (évite le flash blanc sur mobile)
    if (!isReady) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: '#f8f9fa'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #e9ecef',
                    borderTop: '3px solid #00205b',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite'
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!authState.isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // ✅ Forcer le changement de mot de passe avant tout accès
    if (authState.mustChange) {
        return <Navigate to="/changer-mot-de-passe" replace />;
    }

    if (superAdminOnly && !authState.isAdmin) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (adminOnly && !authState.hasAdminAccess) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
