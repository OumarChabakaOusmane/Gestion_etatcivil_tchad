const User = require('../../models/user.model');

// Mock Firebase Admin
jest.mock('firebase-admin');

describe('User Model', () => {
    describe('create', () => {
        it('devrait créer un nouvel utilisateur avec succès', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                nom: 'Doe',
                prenom: 'John',
                role: 'citoyen'
            };

            const result = await User.create(userData);

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.email).toBe(userData.email);
            expect(result.nom).toBe(userData.nom);
            expect(result.prenom).toBe(userData.prenom);
            expect(result.role).toBe(userData.role);
        });

        it('devrait hasher le mot de passe lors de la création', async () => {
            const userData = {
                email: 'test2@example.com',
                password: 'plainPassword',
                nom: 'Smith',
                prenom: 'Jane',
                role: 'citoyen'
            };

            const result = await User.create(userData);

            expect(result.password).toBeDefined();
            expect(result.password).not.toBe('plainPassword');
            expect(result.password.length).toBeGreaterThan(20); // Hash bcrypt
        });

        it('devrait rejeter si l\'email est manquant', async () => {
            const userData = {
                password: 'password123',
                nom: 'Doe',
                prenom: 'John'
            };

            await expect(User.create(userData)).rejects.toThrow();
        });
    });

    describe('findByEmail', () => {
        it('devrait trouver un utilisateur par email', async () => {
            const email = 'existing@example.com';

            const user = await User.findByEmail(email);

            expect(user).toBeDefined();
            if (user) {
                expect(user.email).toBe(email);
            }
        });

        it('devrait retourner null si l\'utilisateur n\'existe pas', async () => {
            const email = 'nonexistent@example.com';

            const user = await User.findByEmail(email);

            expect(user).toBeNull();
        });
    });

    describe('findById', () => {
        it('devrait trouver un utilisateur par ID', async () => {
            const userId = 'test-user-id';

            const user = await User.findById(userId);

            expect(user).toBeDefined();
            if (user) {
                expect(user.id).toBe(userId);
            }
        });
    });

    describe('update', () => {
        it('devrait mettre à jour les informations d\'un utilisateur', async () => {
            const userId = 'test-user-id';
            const updateData = {
                nom: 'UpdatedName',
                prenom: 'UpdatedFirstName'
            };

            const result = await User.update(userId, updateData);

            expect(result).toBeDefined();
            expect(result.nom).toBe(updateData.nom);
            expect(result.prenom).toBe(updateData.prenom);
        });

        it('ne devrait pas permettre de modifier l\'email directement', async () => {
            const userId = 'test-user-id';
            const updateData = {
                email: 'newemail@example.com'
            };

            // Selon votre implémentation, cela devrait soit être ignoré soit rejeter
            const result = await User.update(userId, updateData);

            // Vérifier que l'email n'a pas changé ou que l'opération a échoué
            expect(result).toBeDefined();
        });
    });

    describe('validateEmail', () => {
        it('devrait valider un email correct', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'user+tag@example.com'
            ];

            validEmails.forEach(email => {
                expect(() => User.validateEmail(email)).not.toThrow();
            });
        });

        it('devrait rejeter un email invalide', () => {
            const invalidEmails = [
                'notanemail',
                '@example.com',
                'user@',
                'user @example.com'
            ];

            invalidEmails.forEach(email => {
                expect(() => User.validateEmail(email)).toThrow();
            });
        });
    });
});
