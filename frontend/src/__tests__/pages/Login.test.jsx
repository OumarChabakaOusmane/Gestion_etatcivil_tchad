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

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Login Page', () => {
    const mockT = (key) => key;

    beforeEach(() => {
        vi.clearAllMocks();
        useLanguage.mockReturnValue({
            t: mockT,
            language: 'fr'
        });

        // Mock stable de location
        vi.stubGlobal('location', {
            href: '',
            assign: vi.fn(),
        });
    });

    const fillForm = () => {
        fireEvent.change(screen.getByPlaceholderText('Email'), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByPlaceholderText('Mot de passe'), {
            target: { value: 'password123' }
        });
    };

    it('devrait afficher le formulaire de connexion correctly', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText('Email')).toBeDefined();
        expect(screen.getByPlaceholderText('Mot de passe')).toBeDefined();
        expect(screen.getByRole('button', { name: /btnLogin/ })).toBeDefined();
    });

    it('devrait appeler authService.login avec les bonnes données', async () => {
        authService.login.mockResolvedValue({
            data: { success: true, user: { role: 'citoyen' } }
        });

        render(<MemoryRouter><Login /></MemoryRouter>);
        fillForm();
        fireEvent.click(screen.getByRole('button', { name: /btnLogin/ }));

        await waitFor(() => {
            expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
        });
    });

    it('devrait afficher un message d\'erreur si la connexion échoue', async () => {
        const errorMessage = 'Identifiants invalides';
        authService.login.mockRejectedValue({ message: errorMessage });

        render(<MemoryRouter><Login /></MemoryRouter>);
        fillForm();
        fireEvent.click(screen.getByRole('button', { name: /btnLogin/ }));

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeDefined();
        });
    });

    it('devrait rediriger vers /admin/dashboard si l\'utilisateur est un admin', async () => {
        authService.login.mockResolvedValue({
            data: { user: { role: 'admin' } }
        });

        render(<MemoryRouter><Login /></MemoryRouter>);
        fillForm();
        fireEvent.click(screen.getByRole('button', { name: /btnLogin/ }));

        await waitFor(() => {
            expect(window.location.href).toBe('/admin/dashboard');
        });
    });

    it('devrait rediriger vers /verify-otp si le compte n\'est pas vérifié', async () => {
        authService.login.mockRejectedValue({
            requireVerification: true,
            email: 'unverified@example.com'
        });

        render(<MemoryRouter><Login /></MemoryRouter>);
        fillForm();
        fireEvent.click(screen.getByRole('button', { name: /btnLogin/ }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/verify-otp', {
                state: { email: 'unverified@example.com' }
            });
        });
    });
});
