const Demande = require('../../models/demande.model');

// Mock Firebase Admin
jest.mock('firebase-admin');

describe('Demande Model', () => {
    describe('create', () => {
        it('devrait créer une demande de naissance avec succès', async () => {
            const demandeData = {
                type: 'naissance',
                userId: 'user-123',
                statut: 'en_attente',
                donnees: {
                    nomEnfant: 'DOE',
                    prenomEnfant: 'John',
                    sexeEnfant: 'M',
                    dateNaissanceEnfant: '2024-01-15',
                    lieuNaissanceEnfant: 'N\'Djamena',
                    nomPere: 'DOE',
                    prenomPere: 'Robert',
                    nomMere: 'SMITH',
                    prenomMere: 'Marie'
                }
            };

            const result = await Demande.create(demandeData);

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.type).toBe('naissance');
            expect(result.statut).toBe('en_attente');
            expect(result.donnees.nomEnfant).toBe('DOE');
        });

        it('devrait créer une demande de mariage avec succès', async () => {
            const demandeData = {
                type: 'mariage',
                userId: 'user-456',
                statut: 'en_attente',
                donnees: {
                    nomEpoux: 'MARTIN',
                    prenomEpoux: 'Pierre',
                    nomEpouse: 'DURAND',
                    prenomEpouse: 'Sophie',
                    dateMariage: '2024-06-20',
                    lieuMariage: 'N\'Djamena'
                }
            };

            const result = await Demande.create(demandeData);

            expect(result).toBeDefined();
            expect(result.type).toBe('mariage');
            expect(result.donnees.nomEpoux).toBe('MARTIN');
        });

        it('devrait créer une demande de décès avec succès', async () => {
            const demandeData = {
                type: 'deces',
                userId: 'user-789',
                statut: 'en_attente',
                donnees: {
                    nomDefunt: 'BERNARD',
                    prenomDefunt: 'Jean',
                    dateDeces: '2024-03-10',
                    lieuDeces: 'Abéché'
                }
            };

            const result = await Demande.create(demandeData);

            expect(result).toBeDefined();
            expect(result.type).toBe('deces');
            expect(result.donnees.nomDefunt).toBe('BERNARD');
        });

        it('devrait rejeter si le type est invalide', async () => {
            const demandeData = {
                type: 'invalide',
                userId: 'user-123',
                donnees: {}
            };

            await expect(Demande.create(demandeData)).rejects.toThrow();
        });
    });

    describe('findById', () => {
        it('devrait trouver une demande par ID', async () => {
            const demandeId = 'demande-123';

            const demande = await Demande.findById(demandeId);

            expect(demande).toBeDefined();
            if (demande) {
                expect(demande.id).toBe(demandeId);
            }
        });

        it('devrait retourner null si la demande n\'existe pas', async () => {
            const demandeId = 'nonexistent-id';

            const demande = await Demande.findById(demandeId);

            expect(demande).toBeNull();
        });
    });

    describe('findByUserId', () => {
        it('devrait trouver toutes les demandes d\'un utilisateur', async () => {
            const userId = 'user-123';

            const demandes = await Demande.findByUserId(userId);

            expect(Array.isArray(demandes)).toBe(true);
            demandes.forEach(demande => {
                expect(demande.userId).toBe(userId);
            });
        });
    });

    describe('findByType', () => {
        it('devrait filtrer les demandes par type', async () => {
            const type = 'naissance';

            const demandes = await Demande.findByType(type);

            expect(Array.isArray(demandes)).toBe(true);
            demandes.forEach(demande => {
                expect(demande.type).toBe(type);
            });
        });
    });

    describe('findByStatut', () => {
        it('devrait filtrer les demandes par statut', async () => {
            const statut = 'en_attente';

            const demandes = await Demande.findByStatut(statut);

            expect(Array.isArray(demandes)).toBe(true);
            demandes.forEach(demande => {
                expect(demande.statut).toBe(statut);
            });
        });
    });

    describe('updateStatut', () => {
        it('devrait mettre à jour le statut d\'une demande', async () => {
            const demandeId = 'demande-123';
            const nouveauStatut = 'acceptee';

            const result = await Demande.updateStatut(demandeId, nouveauStatut);

            expect(result).toBeDefined();
            expect(result.statut).toBe(nouveauStatut);
        });

        it('devrait ajouter un motif de rejet si fourni', async () => {
            const demandeId = 'demande-456';
            const nouveauStatut = 'rejetee';
            const motifRejet = 'Documents incomplets';

            const result = await Demande.updateStatut(demandeId, nouveauStatut, motifRejet);

            expect(result).toBeDefined();
            expect(result.statut).toBe(nouveauStatut);
            expect(result.motifRejet).toBe(motifRejet);
        });
    });

    describe('findAll', () => {
        it('devrait retourner toutes les demandes', async () => {
            const demandes = await Demande.findAll();

            expect(Array.isArray(demandes)).toBe(true);
            expect(demandes.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('delete', () => {
        it('devrait supprimer une demande', async () => {
            const demandeId = 'demande-to-delete';

            const result = await Demande.delete(demandeId);

            expect(result).toBe(true);
        });
    });
});
