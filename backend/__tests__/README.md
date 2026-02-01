# Tests Unitaires - Guide d'Utilisation

## Backend (Jest + Supertest)

### Installation
Les dépendances de test sont déjà installées. Si nécessaire :
```bash
cd backend
npm install
```

### Lancer les tests
```bash
# Lancer tous les tests
npm test

# Lancer les tests en mode watch (redémarre automatiquement)
npm run test:watch

# Lancer les tests avec couverture de code
npm run test:coverage
```

### Structure des tests
```
backend/
├── __tests__/
│   ├── setup.js                    # Configuration globale
│   ├── models/
│   │   ├── user.model.test.js      # Tests du modèle User
│   │   └── demande.model.test.js   # Tests du modèle Demande
│   └── controllers/
│       └── auth.controller.test.js # Tests du controller Auth
├── __mocks__/
│   └── firebase-admin.js           # Mock Firebase Admin SDK
└── jest.config.js                  # Configuration Jest
```

### Tests créés

#### Models
- ✅ **user.model.test.js** : Création, recherche, mise à jour, validation email
- ✅ **demande.model.test.js** : Création (naissance/mariage/décès), filtrage, mise à jour statut

#### Controllers
- ✅ **auth.controller.test.js** : Inscription, connexion, mot de passe oublié

### Prochaines étapes
1. Créer les tests pour les autres controllers (demande, user, naissance, mariage, décès)
2. Ajouter les tests pour les autres models
3. Atteindre une couverture de code > 70%

---

## Frontend (Vitest + React Testing Library)

### Installation (à faire)
```bash
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Configuration (à faire)
Créer `vitest.config.js` et configurer l'environnement de test

### Lancer les tests (après configuration)
```bash
# Lancer tous les tests
npm test

# Lancer les tests avec interface UI
npm run test:ui

# Lancer les tests avec couverture
npm run test:coverage
```

---

## Bonnes Pratiques

### Tests unitaires
- ✅ Isoler les tests (utiliser des mocks)
- ✅ Tester un seul comportement par test
- ✅ Nommer les tests clairement (describe/it)
- ✅ Utiliser des assertions précises

### Couverture de code
- **Objectif Backend** : > 70% pour controllers et models
- **Objectif Frontend** : > 60% pour composants et services

### Mocks
- Firebase Admin SDK est mocké pour éviter les appels réels à la base de données
- Les services externes (email, SMS) doivent être mockés

---

## Commandes Utiles

### Backend
```bash
# Lancer un fichier de test spécifique
npm test -- auth.controller.test.js

# Lancer les tests d'un dossier
npm test -- __tests__/models

# Voir la couverture détaillée
npm run test:coverage
open coverage/lcov-report/index.html
```

### Debugging
```bash
# Lancer les tests en mode debug
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## Résultats Attendus

Après l'implémentation complète, vous devriez avoir :
- ✅ ~15-20 fichiers de tests backend
- ✅ ~10-15 fichiers de tests frontend
- ✅ Couverture de code > 70% backend
- ✅ Couverture de code > 60% frontend
- ✅ Tous les tests passent (100% success)
