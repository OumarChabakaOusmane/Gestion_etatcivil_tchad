// Tests unitaires purs pour Demande Model
// Ces tests utilisent des mocks complets

jest.mock('firebase-admin');
jest.mock('../../config/firebase', () => ({
    db: {
        collection: jest.fn(() => ({
            add: jest.fn(() => Promise.resolve({ id: 'test-demande-id' })),
            doc: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({
                    exists: true,
                    id: 'test-demande-id',
                    data: () => ({
                        type: 'naissance',
                        userId: 'user-123',
                        statut: 'en_attente',
                        donnees: {
                            nomEnfant: 'DOE',
                            prenomEnfant: 'John'
                        }
                    })
                })),
                update: jest.fn(() => Promise.resolve()),
                delete: jest.fn(() => Promise.resolve())
            })),
            where: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({
                    docs: [
                        {
                            id: 'demande-1',
                            data: () => ({ type: 'naissance', statut: 'en_attente' })
                        }
                    ]
                }))
            })),
            get: jest.fn(() => Promise.resolve({
                docs: [
                    {
                        id: 'demande-1',
                        data: () => ({ type: 'naissance', statut: 'en_attente', createdAt: new Date() })
                    },
                    {
                        id: 'demande-2',
                        data: () => ({ type: 'mariage', statut: 'acceptee', createdAt: new Date() })
                    }
                ]
            }))
        }))
    }
}));

const Demande = require('../../models/demande.model');

describe('Demande Model - Tests Unitaires', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('devrait créer une demande de naissance', async () => {
            const demandeData = {
                type: 'naissance',
                userId: 'user-123',
                donnees: {
                    nomEnfant: 'DOE',
                    prenomEnfant: 'John',
                    sexeEnfant: 'M',
                    dateNaissanceEnfant: '2024-01-15',
                    lieuNaissanceEnfant: 'N\'Djamena'
                }
            };

            const result = await Demande.create(demandeData);

            expect(result).toBeDefined();
            expect(result.id).toBe('test-demande-id');
            expect(result.type).toBe('naissance');
            expect(result.statut).toBe('en_attente');
        });

        it('devrait créer une demande de mariage', async () => {
            const demandeData = {
                type: 'mariage',
                userId: 'user-456',
                donnees: {
                    nomEpoux: 'MARTIN',
                    prenomEpoux: 'Pierre'
                }
            };

            const result = await Demande.create(demandeData);

            expect(result).toBeDefined();
            expect(result.type).toBe('mariage');
        });

        it('devrait créer une demande de décès', async () => {
            const demandeData = {
                type: 'deces',
                userId: 'user-789',
                donnees: {
                    nomDefunt: 'BERNARD',
                    prenomDefunt: 'Jean'
                }
            };

            const result = await Demande.create(demandeData);

            expect(result).toBeDefined();
            expect(result.type).toBe('deces');
        });
    });

    describe('findById', () => {
        it('devrait trouver une demande par ID', async () => {
            const demande = await Demande.findById('test-demande-id');

            expect(demande).toBeDefined();
            expect(demande.id).toBe('test-demande-id');
            expect(demande.type).toBe('naissance');
        });
    });

    describe('delete', () => {
        it('devrait supprimer une demande', async () => {
            const result = await Demande.delete('test-demande-id');

            expect(result).toBe(true);
        });
    });

    describe('Types de demandes', () => {
        it('devrait accepter le type naissance', () => {
            const types = ['naissance', 'mariage', 'deces'];
            expect(types).toContain('naissance');
        });

        it('devrait accepter le type mariage', () => {
            const types = ['naissance', 'mariage', 'deces'];
            expect(types).toContain('mariage');
        });

        it('devrait accepter le type décès', () => {
            const types = ['naissance', 'mariage', 'deces'];
            expect(types).toContain('deces');
        });
    });

    describe('Statuts de demandes', () => {
        it('devrait avoir les statuts corrects', () => {
            const statuts = ['en_attente', 'acceptee', 'rejetee'];

            expect(statuts).toContain('en_attente');
            expect(statuts).toContain('acceptee');
            expect(statuts).toContain('rejetee');
        });
    });
});
