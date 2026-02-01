import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import authService from '../../services/authService';

// Mock authService
vi.mock('../../services/authService', () => ({
    default: {
        getCurrentUser: vi.fn(),
    }
}));

describe('useCurrentUser hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('devrait retourner l\'utilisateur actuel au montage', () => {
        const mockUser = { id: '123', nom: 'Doe' };
        authService.getCurrentUser.mockReturnValue(mockUser);

        const { result } = renderHook(() => useCurrentUser());

        expect(result.current).toEqual(mockUser);
        expect(authService.getCurrentUser).toHaveBeenCalled();
    });

    it('devrait se mettre à jour lors de l\'événement userUpdated', () => {
        const initialUser = { id: '123', nom: 'Initial' };
        const updatedUser = { id: '123', nom: 'Updated' };

        authService.getCurrentUser.mockReturnValue(initialUser);
        const { result } = renderHook(() => useCurrentUser());

        expect(result.current).toEqual(initialUser);

        // Simuler la mise à jour
        authService.getCurrentUser.mockReturnValue(updatedUser);

        act(() => {
            window.dispatchEvent(new Event('userUpdated'));
        });

        expect(result.current).toEqual(updatedUser);
    });

    it('devrait se mettre à jour lors de l\'événement storage', () => {
        const initialUser = { id: '123', nom: 'Initial' };
        const secondUser = { id: '123', nom: 'Storage' };

        authService.getCurrentUser.mockReturnValue(initialUser);
        const { result } = renderHook(() => useCurrentUser());

        authService.getCurrentUser.mockReturnValue(secondUser);

        act(() => {
            window.dispatchEvent(new Event('storage'));
        });

        expect(result.current).toEqual(secondUser);
    });
});
