# 🚀 Mise à jour de la plateforme en ligne (Render + Vercel)

## 📋 État actuel
- **Backend** : Deployé sur Render (Frankfurt)
- **Frontend** : Deployé sur Vercel
- **Modifications récentes** : Service email amélioré pour OTP

## 🔄 Comment les mises à jour sont appliquées

### Automatic Deployment (Git)
Les deux plateformes sont configurées pour se mettre à jour automatiquement quand vous poussez du code sur GitHub :

```bash
git add .
git commit -m "Fix OTP email service"
git push origin main
```

**Render** détectera automatiquement les changements et redéploiera le backend.
**Vercel** fera de même pour le frontend.

## ⚙️ Variables d'environnement à configurer

### Sur Render (Backend)
Allez dans votre dashboard Render → Service → Environment :

```bash
# Configuration Email (IMPORTANT pour OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app_gmail

# Firebase (déjà configuré)
FIREBASE_PROJECT_ID=xxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
FIREBASE_CLIENT_EMAIL=xxx@xxx.iam.gserviceaccount.com

# Autres
NODE_ENV=production
PORT=10000
JWT_SECRET=xxx
FRONTEND_URL=https://votre-domaine.vercel.app
```

### Sur Vercel (Frontend)
Allez dans votre dashboard Vercel → Project → Settings → Environment Variables :

```bash
# URL du backend pour les appels API
VITE_API_URL=https://votre-backend.onrender.com
```

## 🛠️ Processus de mise à jour manuelle

### Option 1: Via Git (Recommandé)
```bash
# 1. Commiter les changements
git add .
git commit -m "Fix: Configuration email OTP pour production"

# 2. Pousser vers GitHub
git push origin main

# 3. Attendre le déploiement automatique
# - Render: ~5-10 minutes
# - Vercel: ~2-5 minutes
```

### Option 2: Déploiement manuel

#### Render
1. Allez sur votre dashboard Render
2. Cliquez sur "Manual Deploy" → "Deploy Latest Commit"
3. Attendez le build et le déploiement

#### Vercel
1. Allez sur votre dashboard Vercel
2. Cliquez sur "Redeploy" ou "Git Integration"
3. Sélectionnez la branche et cliquez "Deploy"

## 🔍 Vérification après mise à jour

### Backend (Render)
```bash
# Vérifiez les logs dans le dashboard Render
# Cherchez ces messages :
✅ [PROD] Service Email configuré via GMAIL
🔐 [OTP] Envoi à: email@exemple.com
✅ [OTP] Email envoyé avec succès
```

### Frontend (Vercel)
1. Ouvrez votre application
2. Testez la création d'un compte
3. Vérifiez que l'email OTP est reçu

## 🚨 Dépannage

### Si le backend ne se déploie pas
- Vérifiez les logs de build dans Render
- Assurez-vous que toutes les variables d'environnement sont configurées
- Vérifiez que le `package.json` a les bons scripts

### Si l'email OTP ne fonctionne toujours pas
1. Vérifiez les variables d'environnement sur Render
2. Regardez les logs dans Render → Logs
3. Testez avec un compte Gmail différent

### Si le frontend ne se connecte pas au backend
- Vérifiez `VITE_API_URL` sur Vercel
- Assurez-vous que le backend est bien déployé
- Vérifiez les CORS dans le backend

## 📊 Monitoring

### Render
- Allez dans Metrics → Logs
- Filtrez avec "OTP" ou "EMAIL"

### Vercel
- Allez dans Functions → Logs
- Vérifiez les erreurs réseau

## ⚡ Déploiement rapide (script)

Créez ce script `deploy.sh` :
```bash
#!/bin/bash
echo "🚀 Déploiement de la plateforme..."

# Ajouter les changements
git add .

# Commiter
git commit -m "Update: Configuration email OTP - $(date)"

# Pousser
git push origin main

echo "✅ Déploiement en cours..."
echo "📊 Render: https://dashboard.render.com/"
echo "📊 Vercel: https://vercel.com/dashboard"
```

Rendez-le exécutable : `chmod +x deploy.sh`

## 🔄 Mises à jour futures

Pour toute modification :
1. Faites les changements en local
2. Testez (`npm run dev`)
3. Committez et poussez
4. Vérifiez les déploiements automatiques

Le système est maintenant configuré pour des mises à jour transparentes !
