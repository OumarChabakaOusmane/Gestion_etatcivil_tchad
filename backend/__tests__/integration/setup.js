// Setup pour les tests d'intégration avec les émulateurs Firebase
process.env.NODE_ENV = 'test';
process.env.FIREBASE_PROJECT_ID = 'demo-project';
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.JWT_SECRET = 'test-secret';

// Désactiver les logs console pendant les tests (optionnel)
// console.log = jest.fn();
// console.error = jest.fn();
