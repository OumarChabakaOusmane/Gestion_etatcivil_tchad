const request = require('supertest');
const app = require('../../server');
const { admin, db } = require('../../config/firebase');

jest.mock('firebase-admin');

describe('Demandes - Tests d\'Intégration (Simulés)', () => {
    let userToken;
    let adminToken;
    let userId;

    beforeEach(async () => {
        admin.__resetBase();
        jest.clearAllMocks();

        // 1. Créer un utilisateur citoyen vérifié
        await request(app).post('/api/auth/register').send({
            email: 'user@test.com', password: 'password123', nom: 'Citoyen', prenom: 'Test', role: 'user'
        });

        // Simuler validation
        const snapshot = await db.collection('users').where('email', '==', 'user@test.com').get();
        userId = snapshot.docs[0].id;
        await db.collection('users').doc(userId).update({ isVerified: true });

        // Login Citoyen
        const loginRes = await request(app).post('/api/auth/login').send({
            email: 'user@test.com', password: 'password123'
        });
        userToken = loginRes.body.data?.token;

        // 2. Créer un Admin
        await request(app).post('/api/auth/register').send({
            email: 'admin@test.com', password: 'password123', nom: 'Directeur', prenom: 'Admin', role: 'admin'
        });
        const adminSnap = await db.collection('users').where('email', '==', 'admin@test.com').get();
        await db.collection('users').doc(adminSnap.docs[0].id).update({ isVerified: true });

        const adminLoginRes = await request(app).post('/api/auth/login').send({
            email: 'admin@test.com', password: 'password123'
        });
        adminToken = adminLoginRes.body.data?.token;
    });

    describe('GET /api/demandes/me', () => {
        it('devrait rejeter l\'accès sans token', async () => {
            const res = await request(app).get('/api/demandes/me');
            expect(res.status).toBe(401);
        });

        it('devrait retourner une liste vide au début', async () => {
            const res = await request(app)
                .get('/api/demandes/me')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(0);
        });
    });

    describe('POST /api/demandes', () => {
        it('devrait créer une nouvelle demande de naissance', async () => {
            const demandeData = {
                type: 'naissance',
                donnees: {
                    nomEnfant: 'Petit',
                    prenomEnfant: 'Jean',
                    dateNaissance: '2024-01-01'
                }
            };

            const res = await request(app)
                .post('/api/demandes')
                .set('Authorization', `Bearer ${userToken}`)
                .send(demandeData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.type).toBe('naissance');
        });
    });

    describe('Admin - Flux Complet', () => {
        it('devrait permettre à l\'admin de voir et valider une demande', async () => {
            // 1. Citoyen crée une demande
            const createRes = await request(app)
                .post('/api/demandes')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ type: 'naissance', donnees: { nom: 'Test' } });

            const demandeId = createRes.body.data.id;

            // 2. Admin voit toutes les demandes
            const listRes = await request(app)
                .get('/api/demandes')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(listRes.status).toBe(200);
            expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

            // 3. Admin valide la demande
            const updateRes = await request(app)
                .patch(`/api/demandes/${demandeId}/statut`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ statut: 'acceptee' });

            expect(updateRes.status).toBe(200);
            expect(updateRes.body.message).toMatch(/acceptée/);

            // 4. Citoyen voit le nouveau statut
            const finalRes = await request(app)
                .get('/api/demandes/me')
                .set('Authorization', `Bearer ${userToken}`);

            expect(finalRes.body.data[0].statut).toBe('acceptee');
        });

        it('devrait refuser l\'accès admin à un citoyen', async () => {
            const res = await request(app)
                .get('/api/demandes')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(403);
        });
    });
});
