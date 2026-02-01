import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import useCurrentUser from '../../hooks/useCurrentUser';
import authService from '../../services/authService';

// Mocks
vi.mock('../../hooks/useCurrentUser');
vi.mock('../../services/authService');
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

describe('Navbar Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Par défaut, confirmer logout
        window.confirm = vi.fn(() => true);
    });

    it('ne devrait rien afficher si l\'utilisateur n\'est pas connecté', () => {
        useCurrentUser.mockReturnValue(null);
        const { container } = render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );
        expect(container.firstChild).toBeNull();
    });

    it('devrait afficher le menu citoyen pour un utilisateur normal', () => {
        const mockUser = { nom: 'Doe', prenom: 'John', role: 'citoyen' };
        useCurrentUser.mockReturnValue(mockUser);
        authService.isAdmin.mockReturnValue(false);

        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        expect(screen.getByText('Accueil')).toBeDefined();
        expect(screen.getByText('Mes demandes')).toBeDefined();
        expect(screen.getByText('Nouvelle demande')).toBeDefined();
        expect(screen.queryByText('Tableau de bord')).toBeNull();
        expect(screen.getByText('John Doe')).toBeDefined();
    });

    it('devrait afficher le menu admin pour un administrateur', () => {
        const mockUser = { nom: 'Admin', prenom: 'Super', role: 'admin' };
        useCurrentUser.mockReturnValue(mockUser);
        authService.isAdmin.mockReturnValue(true);

        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        expect(screen.getByText('Tableau de bord')).toBeDefined();
        expect(screen.getByText('Gestion des demandes')).toBeDefined();
        expect(screen.getByText('Utilisateurs')).toBeDefined();
        expect(screen.queryByText('Accueil')).toBeNull();
    });

    it('devrait appeler logout lorsqu\'on clique sur déconnexion', () => {
        const mockUser = { nom: 'Doe', prenom: 'John' };
        useCurrentUser.mockReturnValue(mockUser);

        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        // Ouvrir le dropdown
        const userMenu = screen.getByText('John Doe');
        fireEvent.click(userMenu);

        const logoutBtn = screen.getByText('Déconnexion');
        fireEvent.click(logoutBtn);

        expect(authService.logout).toHaveBeenCalled();
    });
});
