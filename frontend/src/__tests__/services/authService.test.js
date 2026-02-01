import { describe, it, expect, vi, beforeEach } from 'vitest';
import authService from '../../services/authService';
import api from '../../services/api';

// Mock du service API (axios)
vi.mock('../../services/api', () => ({
    default: {
        post: vi.fn(),
        put: vi.fn(),
    }
}));

describe('authService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        // Mock de window.location.href car JSDOM ne permet pas de le modifier directement
        delete window.location;
        window.location = { href: '' };
    });

    describe('login', () => {
        it('devrait stocker le token et l\'utilisateur en cas de succès', async () => {
            const mockUser = { id: '123', email: 'test@example.com', nom: 'Doe' };
            const mockToken = 'fake-token';
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        user: mockUser,
                        token: mockToken
                    }
                }
            };

            api.post.mockResolvedValue(mockResponse);

            const result = await authService.login('test@example.com', 'password123');

            expect(api.post).toHaveBeenCalledWith('/auth/login', {
                email: 'test@example.com',
                password: 'password123'
            });
            expect(localStorage.getItem('token')).toBe(mockToken);
            expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockUser);
            expect(result).toEqual(mockResponse.data);
        });

        it('devrait lancer une erreur en cas d\'échec de l\'API', async () => {
            const mockError = {
                response: {
                    data: {
                        success: false,
                        message: 'Identifiants invalides'
                    }
                }
            };

            api.post.mockRejectedValue(mockError);

            await expect(authService.login('wrong@email.com', 'wrongpass'))
                .rejects.toEqual(mockError.response.data);
        });
    });

    describe('logout', () => {
        it('devrait supprimer les données du localStorage et rediriger', () => {
            localStorage.setItem('token', 'some-token');
            localStorage.setItem('user', JSON.stringify({ name: 'User' }));

            authService.logout();

            expect(localStorage.getItem('token')).toBeNull();
            expect(localStorage.getItem('user')).toBeNull();
            expect(window.location.href).toBe('/');
        });
    });

    describe('getCurrentUser', () => {
        it('devrait retourner l\'objet utilisateur depuis le localStorage', () => {
            const mockUser = { id: '123', nom: 'John' };
            localStorage.setItem('user', JSON.stringify(mockUser));

            const user = authService.getCurrentUser();
            expect(user).toEqual(mockUser);
        });

        it('devrait retourner null si aucun utilisateur n\'est stocké', () => {
            const user = authService.getCurrentUser();
            expect(user).toBeNull();
        });
    });

    describe('isAuthenticated', () => {
        it('devrait retourner true si le token et l\'utilisateur existent', () => {
            localStorage.setItem('token', 'valid-token');
            localStorage.setItem('user', JSON.stringify({ name: 'User' }));

            expect(authService.isAuthenticated()).toBe(true);
        });

        it('devrait retourner false si le token est manquant', () => {
            localStorage.setItem('user', JSON.stringify({ name: 'User' }));
            expect(authService.isAuthenticated()).toBe(false);
        });
    });

    describe('isAdmin', () => {
        it('devrait retourner true si l\'utilisateur a le rôle admin', () => {
            localStorage.setItem('user', JSON.stringify({ role: 'admin' }));
            expect(authService.isAdmin()).toBeTruthy();
        });

        it('devrait retourner false si l\'utilisateur n\'est pas admin', () => {
            localStorage.setItem('user', JSON.stringify({ role: 'citoyen' }));
            expect(authService.isAdmin()).toBeFalsy();
        });
    });
});
