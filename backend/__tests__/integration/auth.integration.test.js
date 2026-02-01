const request = require('supertest');
const app = require('../../server');
const { admin, db } = require('../../config/firebase');

// On utilise le mock de firebase-admin chargé via jest.mock
jest.mock('firebase-admin');

describe('Authentification - Tests d\'Intégration (Simulés)', () => {
    beforeEach(async () => {
        admin.__resetBase();
        jest.clearAllMocks();
    });

    const testUser = {
        email: 'integration@test.com',
        password: 'Password123!',
        nom: 'Integration',
        prenom: 'Test',
        telephone: '66000000',
        role: 'user'
    };

    describe('POST /api/auth/register', () => {
        it('devrait inscrire un nouvel utilisateur', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            if (res.status !== 201) {
                console.error('Register failed with body:', JSON.stringify(res.body, null, 2));
            }

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);

            const userDoc = await db.collection('users').where('email', '==', testUser.email).get();
            expect(userDoc.size).toBe(1);
        });
    });

    describe('POST /api/auth/login', () => {
        it('devrait refuser la connexion si non vérifié (403)', async () => {
            await request(app).post('/api/auth/register').send(testUser);

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res.status).toBe(403);
            expect(res.body.requireVerification).toBe(true);
        });

        it('devrait connecter un utilisateur vérifié (200)', async () => {
            await request(app).post('/api/auth/register').send(testUser);

            // Simuler la vérification
            const snapshot = await db.collection('users').where('email', '==', testUser.email).get();
            const userId = snapshot.docs[0].id;
            await db.collection('users').doc(userId).update({ isVerified: true });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBeDefined();
        });

        it('devrait rejeter un mauvais mot de passe (401)', async () => {
            await request(app).post('/api/auth/register').send(testUser);

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrong'
                });

            expect(res.status).toBe(401);
        });
    });
});
