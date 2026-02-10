const nodemailer = require('nodemailer');

/**
 * Service pour l'envoi d'emails
 */
class EmailService {
    constructor() {
        // Configuration du transporteur email
        // Utilise les variables d'environnement ou Ethereal par défaut
        const useRealEmail = process.env.EMAIL_USER && process.env.EMAIL_PASS;

        if (useRealEmail) {
            // Configuration prioritair Gmail pour la robustesse
            const isGmail = (process.env.EMAIL_HOST || '').toLowerCase().includes('gmail.com') ||
                (process.env.EMAIL_USER || '').toLowerCase().includes('@gmail.com');

            let smtpConfig;

            if (isGmail) {
                smtpConfig = {
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                };
                console.log('✅ Service Email configuré via GMAIL Service');
            } else {
                smtpConfig = {
                    host: process.env.EMAIL_HOST,
                    port: parseInt(process.env.EMAIL_PORT) || 587,
                    secure: process.env.EMAIL_PORT == 465,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                };
                console.log('✅ Service Email configuré via HOST:', process.env.EMAIL_HOST);
            }

            // Ajout des timeouts pour éviter les blocages
            smtpConfig.connectionTimeout = 10000;
            smtpConfig.greetingTimeout = 10000;
            smtpConfig.socketTimeout = 15000;

            this.transporter = nodemailer.createTransport(smtpConfig);
        } else {
            // Fallback vers Ethereal (test)
            this.transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: 'pk2hr6g5cgqzh5uv@ethereal.email',
                    pass: 'gMs8P499BYzzKBFVrP'
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            console.log('⚠️ Service Email en mode TEST (Ethereal)');
        }
    }

    /**
     * Gabarit institutionnel pour tous les emails (Simplifié anti-spam)
     */
    wrapTemplate(content) {
        return `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eeeeee; padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #002664; margin: 0;">République du Tchad</h1>
                    <div style="font-weight: bold; color: #C60C30;">État Civil Numérique</div>
                </div>
                <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
                <div style="line-height: 1.5; color: #333333;">
                    ${content}
                </div>
                <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
                <p style="font-size: 11px; color: #999999; text-align: center;">
                    Ceci est un message automatique de SIGEC-Tchad. Ne pas répondre.
                </p>
            </div>
        `;
    }

    /**
     * Envoie un email générique
     */
    async sendEmail(to, subject, html, text = "") {
        const fs = require('fs');
        const path = require('path');
        const logPath = path.join(__dirname, '../mail.log');
        const timestamp = new Date().toISOString();

        try {
            const mailOptions = {
                from: `"État Civil Tchad" <${process.env.EMAIL_USER}>`,
                to,
                replyTo: process.env.EMAIL_USER,
                subject,
                html,
                text: text || "Veuillez ouvrir cet email avec un client supportant le HTML.",
                headers: {
                    'X-Application': 'SIGEC-Tchad',
                    'X-Priority': '1 (Highest)',
                    'Importance': 'high'
                }
            };

            fs.appendFileSync(logPath, `${timestamp} - Tentative d'envoi à: ${to} - Sujet: ${subject}\n`);

            const info = await this.transporter.sendMail(mailOptions);

            fs.appendFileSync(logPath, `${timestamp} - ✅ Succès : ${to} - MessageId: ${info.messageId}\n`);
            return info;
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi de l\'email :', error);
            fs.appendFileSync(logPath, `${timestamp} - ❌ ERREUR : ${to} - Message: ${error.message}\n`);
            throw error;
        }
    }

    async verifyConnection() {
        return this.transporter.verify();
    }

    /**
     * Notification de validation d'acte
     */
    async sendNotificationValidation(userEmail, userName, typeActe, idDemande) {
        const subject = `✅ Votre demande d'acte de ${typeActe} a été approuvée`;
        const content = `
            <h2>Validation de votre document</h2>
            <p>Cher(e) ${userName},</p>
            <p>Votre demande de ${typeActe} (réf: ${idDemande.slice(-8).toUpperCase()}) a été validée.</p>
            <p>Connectez-vous à votre espace pour la suite.</p>
        `;
        const text = `Bonjour ${userName}, votre demande de ${typeActe} a été validée. Connectez-vous sur ${process.env.FRONTEND_URL || 'http://localhost:5173'}/mes-demandes`;
        return this.sendEmail(userEmail, subject, this.wrapTemplate(content), text);
    }

    /**
     * Notification de rejet d'acte
     */
    async sendNotificationRejet(userEmail, userName, typeActe, motif) {
        const subject = `⚠️ Information concernant votre demande d'acte de ${typeActe}`;
        const content = `
            <h2>Action requise</h2>
            <p>Cher(e) ${userName},</p>
            <p>Votre demande de ${typeActe} a été rejetée pour le motif suivant : ${motif}</p>
        `;
        const text = `Bonjour ${userName}, votre demande de ${typeActe} a été rejetée. Motif : ${motif}`;
        return this.sendEmail(userEmail, subject, this.wrapTemplate(content), text);
    }

    /**
     * Envoi du code OTP
     */
    async sendOTPEmail(userEmail, userName, otpCode) {
        const subject = `🔐 Votre code de vérification - État Civil Tchad`;
        const content = `
            <h2 style="color: #001a41;">Vérification de votre compte</h2>
            <p>Bonjour ${userName},</p>
            <p>Voici votre code de vérification pour SIGEC-TCHAD :</p>
            <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
                ${otpCode}
            </div>
            <p>Ce code expire dans 10 minutes.</p>
        `;
        const text = `Bonjour ${userName}, votre code de vérification SIGEC-TCHAD est : ${otpCode}. Ce code expire dans 10 minutes.`;
        return this.sendEmail(userEmail, subject, this.wrapTemplate(content), text);
    }

    /**
     * Envoi du lien de réinitialisation de mot de passe
     */
    async sendPasswordResetEmail(userEmail, userName, resetUrl) {
        const subject = `🔑 Réinitialisation de votre mot de passe`;
        const content = `
            <h2>Mot de passe oublié ?</h2>
            <p>Bonjour ${userName},</p>
            <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
            <p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>
        `;
        const text = `Bonjour ${userName}, réinitialisez votre mot de passe via ce lien : ${resetUrl}`;
        return this.sendEmail(userEmail, subject, this.wrapTemplate(content), text);
    }

    /**
     * Alerte pour les agents/admins : Nouvelle demande reçue
     */
    async sendNewDemandeAlert(agentEmail, agentName, typeActe, citoyenName) {
        const subject = `🔔 Nouvelle demande de ${typeActe}`;
        const content = `
            <h2>Nouvelle Demande Reçue</h2>
            <p>Bonjour Agt. ${agentName},</p>
            <p>Citoyen : ${citoyenName} a soumis une demande de ${typeActe}.</p>
        `;
        const text = `Nouvelle demande de ${typeActe} soumise par ${citoyenName}.`;
        return this.sendEmail(agentEmail, subject, this.wrapTemplate(content), text);
    }
}

module.exports = new EmailService();
