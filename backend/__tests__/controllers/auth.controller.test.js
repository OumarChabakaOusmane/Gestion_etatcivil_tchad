const request = require('supertest');
const express = require('express');
const authController = require('../../controllers/auth.controller');

// Mock Firebase Admin
jest.mock('firebase-admin');

// Mock User model
jest.mock('../../models/user.model');
const User = require('../../models/user.model');

// Mock JWT
jest.mock('jsonwebtoken');
const jwt = require('jsonwebtoken');

// Mock bcrypt
jest.mock('bcryptjs');
const bcrypt = require('bcryptjs');

// Create Express app for testing
const app = express();
app.use(express.json());
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/forgot-password', authController.forgotPassword);

describe('Auth Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('devrait créer un nouvel utilisateur avec succès', async () => {
            const userData = {
                email: 'newuser@example.com',
                password: 'SecurePass123!',
                nom: 'Doe',
                prenom: 'John',
                role: 'citoyen'
            };

            User.findByEmail.mockResolvedValue(null); // Utilisateur n'existe pas
            User.create.mockResolvedValue({
                id: 'user-123',
                email: userData.email,
                nom: userData.nom,
                prenom: userData.prenom,
                role: userData.role
            });

            jwt.sign.mockReturnValue('mock-token');

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe(userData.email);
            expect(response.body.data.token).toBe('mock-token');
        });

        it('devrait rejeter si l\'email existe déjà', async () => {
            const userData = {
                email: 'existing@example.com',
                password: 'password123',
                nom: 'Doe',
                prenom: 'John'
            };

            User.findByEmail.mockResolvedValue({ id: 'existing-user', email: userData.email });

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('existe déjà');
        });

        it('devrait rejeter si les champs obligatoires sont manquants', async () => {
            const incompleteData = {
                email: 'test@example.com'
                // Manque password, nom, prenom
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(incompleteData);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('devrait rejeter si l\'email est invalide', async () => {
            const invalidData = {
                email: 'not-an-email',
                password: 'password123',
                nom: 'Doe',
                prenom: 'John'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {
        it('devrait connecter un utilisateur avec des identifiants valides', async () => {
            const loginData = {
                email: 'user@example.com',
                password: 'correctPassword'
            };

            const mockUser = {
                id: 'user-123',
                email: loginData.email,
                password: 'hashed-password',
                nom: 'Doe',
                prenom: 'John',
                role: 'citoyen'
            };

            User.findByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true); // Mot de passe correct
            jwt.sign.mockReturnValue('mock-token');

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBe('mock-token');
            expect(response.body.data.user.email).toBe(loginData.email);
        });

        it('devrait rejeter si l\'email n\'existe pas', async () => {
            const loginData = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };

            User.findByEmail.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('invalides');
        });

        it('devrait rejeter si le mot de passe est incorrect', async () => {
            const loginData = {
                email: 'user@example.com',
                password: 'wrongPassword'
            };

            const mockUser = {
                id: 'user-123',
                email: loginData.email,
                password: 'hashed-password'
            };

            User.findByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false); // Mot de passe incorrect

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('invalides');
        });

        it('devrait rejeter si les champs sont manquants', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com' }); // Manque password

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/forgot-password', () => {
        it('devrait envoyer un email de réinitialisation', async () => {
            const email = 'user@example.com';

            User.findByEmail.mockResolvedValue({
                id: 'user-123',
                email: email
            });

            User.update.mockResolvedValue(true);

            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('email');
        });

        it('devrait retourner succès même si l\'email n\'existe pas (sécurité)', async () => {
            const email = 'nonexistent@example.com';

            User.findByEmail.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email });

            // Pour des raisons de sécurité, on ne révèle pas si l'email existe
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
