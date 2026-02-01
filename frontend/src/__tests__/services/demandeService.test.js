import { describe, it, expect, vi, beforeEach } from 'vitest';
import demandeService from '../../services/demandeService';
import api from '../../services/api';

// Mock du service API
vi.mock('../../services/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    }
}));

describe('demandeService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createDemande', () => {
        it('devrait envoyer une requête POST avec les bonnes données', async () => {
            const mockType = 'naissance';
            const mockDonnees = { nom: 'Doe' };
            const mockDocs = ['doc1'];
            const mockResponse = { data: { success: true, id: 'demande-123' } };

            api.post.mockResolvedValue(mockResponse);

            const result = await demandeService.createDemande(mockType, mockDonnees, mockDocs);

            expect(api.post).toHaveBeenCalledWith('/demandes', {
                type: mockType,
                donnees: mockDonnees,
                documentIds: mockDocs
            });
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('getMyDemandes', () => {
        it('devrait envoyer une requête GET avec les filtres en paramètres', async () => {
            const mockFilters = { type: 'naissance', statut: 'en_attente' };
            const mockResponse = { data: { success: true, data: [] } };

            api.get.mockResolvedValue(mockResponse);

            const result = await demandeService.getMyDemandes(mockFilters);

            expect(api.get).toHaveBeenCalledWith('/demandes/me?type=naissance&statut=en_attente');
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('getDemandeById', () => {
        it('devrait envoyer une requête GET avec l\'ID correct', async () => {
            const mockId = '123';
            const mockResponse = { data: { success: true, data: { id: mockId } } };

            api.get.mockResolvedValue(mockResponse);

            const result = await demandeService.getDemandeById(mockId);

            expect(api.get).toHaveBeenCalledWith(`/demandes/${mockId}`);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateStatut', () => {
        it('devrait envoyer une requête PATCH pour mettre à jour le statut', async () => {
            const mockId = '123';
            const mockStatut = 'acceptee';
            const mockResponse = { data: { success: true } };

            api.patch.mockResolvedValue(mockResponse);

            const result = await demandeService.updateStatut(mockId, mockStatut);

            expect(api.patch).toHaveBeenCalledWith(`/demandes/${mockId}/statut`, {
                statut: mockStatut,
                motifRejet: null
            });
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('getStatistics', () => {
        it('devrait appeler l\'endpoint de statistiques', async () => {
            const mockStats = { total: 10, en_attente: 5 };
            api.get.mockResolvedValue({ data: { success: true, data: mockStats } });

            const result = await demandeService.getStatistics();

            expect(api.get).toHaveBeenCalledWith('/demandes/stats');
            expect(result.data).toEqual(mockStats);
        });
    });

    describe('deleteDemande', () => {
        it('devrait envoyer une requête DELETE', async () => {
            const mockId = '123';
            api.delete.mockResolvedValue({ data: { success: true } });

            const result = await demandeService.deleteDemande(mockId);

            expect(api.delete).toHaveBeenCalledWith(`/demandes/${mockId}`);
            expect(result.success).toBe(true);
        });
    });
});
