import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../pages/Auth/Login';
import authService from '../../services/authService';
import { useLanguage } from '../../context/LanguageContext';

// Mocks
vi.mock('../../services/authService');
vi.mock('../../context/LanguageContext');
vi.mock('../../components/PublicNavbar', () => ({
    default: () => <div data-testid="public-navbar">Navbar</div>
}));

describe('Login Debug Test', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useLanguage.mockReturnValue({
            t: (k) => k,
            language: 'fr'
        });

        // Mock de location via stubGlobal
        vi.stubGlobal('location', {
            href: '',
            assign: vi.fn(),
        });
    });

    it('devrait appeler login et afficher erreur', async () => {
        authService.login.mockRejectedValue({ message: 'FAIL_MESSAGE' });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        // Remplir les champs pour satisfaire le 'required' (même si JSDOM s'en fiche souvent)
        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
        fireEvent.change(screen.getByPlaceholderText('Mot de passe'), { target: { value: '123' } });

        const btn = screen.getByRole('button', { name: /btnLogin/ });

        // On essaie de cliquer
        fireEvent.click(btn);

        // On attend le message d'erreur
        await waitFor(() => {
            const errorText = screen.queryByText('FAIL_MESSAGE');
            if (!errorText) {
                // Log pour débugger
                // console.log('Current DOM:', document.body.innerHTML);
            }
            expect(errorText).not.toBeNull();
        }, { timeout: 4000 });
    });
});
