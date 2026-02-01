import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../../pages/Citizen/Dashboard';
import demandeService from '../../services/demandeService';
import { useLanguage } from '../../context/LanguageContext';

// Mocks
vi.mock('../../services/demandeService');
vi.mock('../../context/LanguageContext');
vi.mock('../../assets/welcome_banner.png', () => ({ default: 'welcome.png' }));

describe('Citizen Dashboard Component', () => {
    const mockUser = { id: '123', prenom: 'John', nom: 'Doe' };
    const mockDemandes = [
        { id: '1', type: 'naissance', statut: 'en_attente', dateDemande: { _seconds: 1705330800 } }, // 15 Jan 2024
        { id: '2', type: 'mariage', statut: 'acceptee', dateDemande: { _seconds: 1705417200 } }   // 16 Jan 2024
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        useLanguage.mockReturnValue({
            t: (key) => key === 'welcome' ? 'Bienvenue' : key,
            language: 'fr'
        });

        // Mock localStorage
        const localStorageMock = {
            getItem: vi.fn((key) => key === 'user' ? JSON.stringify(mockUser) : null),
            setItem: vi.fn(),
            clear: vi.fn()
        };
        vi.stubGlobal('localStorage', localStorageMock);
    });

    it('devrait afficher le spinner de chargement initialement', () => {
        demandeService.getMyDemandes.mockReturnValue(new Promise(() => { }));

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        expect(screen.getByRole('status')).toBeDefined();
    });

    it('devrait charger et afficher les statistiques correctement', async () => {
        demandeService.getMyDemandes.mockResolvedValue({
            data: mockDemandes,
            success: true
        });

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByRole('status')).toBeNull();
        });

        expect(screen.getByText('Bienvenue, John !')).toBeDefined();
        expect(screen.getByText('Total Demandes')).toBeDefined();
        expect(screen.getByText('2')).toBeDefined();

        const ones = screen.getAllByText('1');
        expect(ones.length).toBeGreaterThanOrEqual(2);
    });

    it('devrait lister les demandes récentes dans le tableau', async () => {
        demandeService.getMyDemandes.mockResolvedValue({
            data: mockDemandes,
            success: true
        });

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Acte de naissance')).toBeDefined();
            expect(screen.getByText('Acte de mariage')).toBeDefined();
        });

        expect(screen.getByText('En attente')).toBeDefined();
        expect(screen.getByText('Approuvé')).toBeDefined();
    });

    it('devrait afficher un message si aucune demande n\'existe', async () => {
        demandeService.getMyDemandes.mockResolvedValue({
            data: [],
            success: true
        });

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Vous n'avez pas encore effectué de demande/)).toBeDefined();
        });
    });
});
