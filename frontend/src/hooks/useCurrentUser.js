import { useState, useEffect } from 'react';
import authService from '../services/authService';

/**
 * Hook pour récupérer l'utilisateur actuel et rester synchronisé
 * avec les modifications (ex: via les paramètres)
 */
export const useCurrentUser = () => {
    const [user, setUser] = useState(authService.getCurrentUser());

    useEffect(() => {
        const handleStorageChange = () => {
            setUser(authService.getCurrentUser());
        };

        // Écouter les changements dans le localStorage (déclenché par AdminSettings)
        window.addEventListener('storage', handleStorageChange);

        // Custom listener pour les changements sur le même onglet
        window.addEventListener('userUpdated', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userUpdated', handleStorageChange);
        };
    }, []);

    return user;
};

export default useCurrentUser;
