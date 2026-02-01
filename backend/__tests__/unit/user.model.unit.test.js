// Tests unitaires purs pour User Model
// Ces tests utilisent des mocks complets et ne dépendent pas de Firebase

const bcrypt = require('bcryptjs');

// Mock Firebase avant d'importer le model
jest.mock('firebase-admin');
jest.mock('../../config/firebase', () => ({
    db: {
        collection: jest.fn(() => ({
            where: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({ empty: true, docs: [] }))
            })),
            add: jest.fn(() => Promise.resolve({ id: 'test-user-id' })),
            doc: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({
                    exists: true,
                    id: 'test-user-id',
                    data: () => ({
                        nom: 'Doe',
                        prenom: 'John',
                        email: 'test@example.com',
                        role: 'citoyen'
                    })
                })),
                update: jest.fn(() => Promise.resolve())
            }))
        }))
    }
}));

const User = require('../../models/user.model');

describe('User Model - Tests Unitaires', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('devrait créer un utilisateur et hasher le mot de passe', async () => {
            const userData = {
                email: 'newuser@example.com',
                password: 'password123',
                nom: 'Doe',
                prenom: 'John',
                role: 'citoyen'
            };

            const result = await User.create(userData);

            expect(result).toBeDefined();
            expect(result.id).toBe('test-user-id');
            expect(result.email).toBe(userData.email);
            expect(result.password).toBeUndefined(); // Le password ne doit pas être retourné
        });
    });

    describe('findById', () => {
        it('devrait trouver un utilisateur par ID', async () => {
            const user = await User.findById('test-user-id');

            expect(user).toBeDefined();
            expect(user.id).toBe('test-user-id');
            expect(user.nom).toBe('Doe');
        });
    });

    describe('Validation du mot de passe', () => {
        it('devrait hasher correctement un mot de passe', async () => {
            const password = 'mySecurePassword';
            const salt = await bcrypt.genSalt(8);
            const hashed = await bcrypt.hash(password, salt);

            expect(hashed).toBeDefined();
            expect(hashed).not.toBe(password);
            expect(hashed.length).toBeGreaterThan(20);

            // Vérifier que le hash peut être comparé
            const isMatch = await bcrypt.compare(password, hashed);
            expect(isMatch).toBe(true);
        });

        it('devrait rejeter un mauvais mot de passe', async () => {
            const password = 'correctPassword';
            const wrongPassword = 'wrongPassword';
            const salt = await bcrypt.genSalt(8);
            const hashed = await bcrypt.hash(password, salt);

            const isMatch = await bcrypt.compare(wrongPassword, hashed);
            expect(isMatch).toBe(false);
        });
    });
});
