# 📧 Configuration Email pour OTP - Guide d'Installation

## Problème actuel
Les citoyens ne reçoivent pas les emails OTP car le service utilise Ethereal (service de test) au lieu d'un vrai SMTP.

## Solution rapide : Gmail

### 1. Créer un mot de passe d'application Gmail
1. Allez dans votre compte Google → Sécurité
2. Activez la "Vérification en 2 étapes"
3. Allez dans "Mots de passe des applications"
4. Créez un nouveau mot de passe pour "SIGEC-TCHAD"
5. Copiez le mot de passe généré (format: xxxx xxxx xxxx xxxx)

### 2. Configurer les variables d'environnement

Dans le fichier `.env` du backend :

```bash
# Configuration Email Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=xxxx_xxxx_xxxx_xxxx  # Mot de passe d'application
EMAIL_FROM="État Civil Tchad <votre_email@gmail.com>"
```

### 3. Redémarrer le serveur backend

```bash
cd backend
npm run dev
```

## Alternative : Autre fournisseur SMTP

### Outlook/Hotmail
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=votre_email@outlook.com
EMAIL_PASS=votre_mot_de_passe
```

### SendGrid (recommandé pour production)
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.xxxxx.xxxxx
```

## Test de la configuration

Après configuration, testez avec la route :
```bash
POST /api/auth/register
{
  "nom": "Test",
  "prenom": "User",
  "email": "votre_email_test@gmail.com",
  "password": "123456",
  "telephone": "+23512345678"
}
```

Vérifiez les logs du backend pour voir les messages OTP.

## Dépannage

### Si les emails vont dans les spams
- Vérifiez le contenu HTML (pas trop de liens)
- Ajoutez un SPF/DKIM pour votre domaine
- Utilisez un email professionnel

### Si timeout/erreur
- Essayez le port 465 au lieu de 587
- Vérifiez le firewall/antivirus
- Testez avec telnet: `telnet smtp.gmail.com 587`

## Pour la production

Utilisez un service email professionnel :
- SendGrid
- Mailgun
- AWS SES
- Brevo (anciennement Sendinblue)

Ces services offrent une meilleure délivrabilité et des statistiques.
