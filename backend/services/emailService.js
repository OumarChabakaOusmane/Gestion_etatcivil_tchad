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
            // Configuration Gmail robuste (Port 465 SSL)
            const isGmail = (process.env.EMAIL_HOST || '').includes('gmail.com');

            const smtpConfig = isGmail ? {
                host: 'smtp.gmail.com',
                port: 465,
                secure: true, // SSL
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            } : {
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

            // Ajout des timeouts
            smtpConfig.connectionTimeout = 10000;
            smtpConfig.greetingTimeout = 10000;
            smtpConfig.socketTimeout = 15000;

            this.transporter = nodemailer.createTransport(smtpConfig);
            console.log('✅ Service Email configuré (Gmail 465):', process.env.EMAIL_USER);
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
     * Gabarit institutionnel pour tous les emails
     */
    wrapTemplate(content) {
        return `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                <div style="background: linear-gradient(135deg, #001a41 0%, #00338d 100%); padding: 30px; text-align: center;">
                    <!-- Drapeau du Tchad en CSS -->
                    <div style="width: 60px; height: 40px; margin: 0 auto 15px auto; display: flex; border-radius: 3px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                        <div style="width: 33.33%; background-color: #002664;"></div>
                        <div style="width: 33.33%; background-color: #FECB00;"></div>
                        <div style="width: 33.33%; background-color: #C60C30;"></div>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 2px; text-transform: uppercase;">République du Tchad</h1>
                    <div style="color: #fecb00; font-weight: bold; font-size: 12px; margin-top: 5px; opacity: 0.8;">ÉTAT CIVIL NUMÉRIQUE</div>
                </div>
                <div style="padding: 40px 30px; line-height: 1.6; color: #333333;">
                    ${content}
                </div>
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0; color: #888888; font-size: 12px;">
                        Ceci est un message automatique, merci de ne pas y répondre.<br>
                        © 2025 Délégation Générale à l'État Civil - Tchad
                    </p>
                </div>
            </div>
        `;
    }

    /**
     * Envoie un email générique
     */
    async sendEmail(to, subject, html) {
        const fs = require('fs');
        const path = require('path');
        const logPath = path.join(__dirname, '../mail_debug.log');
        const timestamp = new Date().toISOString();

        try {
            const mailOptions = {
                from: `"État Civil Tchad" <${process.env.EMAIL_USER}>`, // Gmail exige souvent que l'expéditeur soit l'utilisateur authentifié
                to,
                subject,
                html
            };

            fs.appendFileSync(logPath, `${timestamp} - Attempting send to: ${to} - Subject: ${subject}\n`);

            const info = await this.transporter.sendMail(mailOptions);

            fs.appendFileSync(logPath, `${timestamp} - ✅ Success: ${to} - MessageId: ${info.messageId}\n`);

            if (info.envelope && (info.envelope.from === 'ethereal.user@ethereal.email' || info.host === 'smtp.ethereal.email')) {
                console.log('🔗 LIEN ETHEREAL : %s', nodemailer.getTestMessageUrl(info));
            }

            return info;
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi de l\'email :', error);
            fs.appendFileSync(logPath, `${timestamp} - ❌ ERROR: ${to} - Message: ${error.message}\n`);
            if (error.stack) fs.appendFileSync(logPath, `${error.stack}\n`);
            throw error;
        }
    }

    /**
     * Notification de validation d'acte
     */
    async sendNotificationValidation(userEmail, userName, typeActe, idDemande) {
        const subject = `✅ Votre demande d'acte de ${typeActe} a été approuvée`;
        const content = `
            <h2 style="color: #001a41; margin-top: 0;">Validation de votre document</h2>
            <p>Cher(e) <strong>${userName}</strong>,</p>
            <p>Nous avons le plaisir de vous informer que votre demande de <strong>${typeActe}</strong> (réf: ${idDemande.slice(-8).toUpperCase()}) a été <strong>validée</strong> par l'officier d'état civil.</p>
            <p>Une fois les frais de délivrance acquittés, la mairie vous transmettra votre acte officiel directement par email.</p>
            <p>Vous pouvez également dès à présent vous connecter à votre espace citoyen pour consulter le suivi de votre dossier.</p>
            <div style="margin: 40px 0; text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/mes-demandes" 
                   style="background-color: #001a41; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                   Accéder à mon espace
                </a>
            </div>
            <p style="font-size: 14px; color: #666;">Merci d'utiliser nos services numériques pour vos démarches administratives.</p>
        `;
        return this.sendEmail(userEmail, subject, this.wrapTemplate(content));
    }

    /**
     * Notification de rejet d'acte
     */
    async sendNotificationRejet(userEmail, userName, typeActe, motif) {
        const subject = `⚠️ Information concernant votre demande d'acte de ${typeActe}`;
        const content = `
            <h2 style="color: #dc3545; margin-top: 0;">Action requise</h2>
            <p>Cher(e) <strong>${userName}</strong>,</p>
            <p>Après examen, votre demande de <strong>${typeActe}</strong> n'a pas pu être validée pour le motif suivant :</p>
            <div style="background: #fff5f5; border-left: 4px solid #dc3545; padding: 20px; border-radius: 8px; margin: 25px 0; font-style: italic; color: #c53030;">
                "${motif || 'Incomplet ou informations incorrectes'}"
            </div>
            <p>Nous vous invitons à soumettre une nouvelle demande en tenant compte de ces observations dans votre espace personnel.</p>
            <div style="margin: 40px 0; text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/demander-acte" 
                   style="background-color: #6c757d; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
                   Refaire une demande
                </a>
            </div>
        `;
        return this.sendEmail(userEmail, subject, this.wrapTemplate(content));
    }

    /**
     * Envoi du code OTP
     */
    async sendOTPEmail(userEmail, userName, otpCode) {
        const subject = `🔐 Votre code de vérification - État Civil Tchad`;
        const content = `
            <h2 style="color: #001a41; margin-top: 0;">Vérification de votre compte</h2>
            <p>Bonjour <strong>${userName}</strong>,</p>
            <p>Merci de vous être inscrit sur le portail de l'État Civil. Pour finaliser la création de votre compte, veuillez utiliser le code de vérification suivant :</p>
            <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 12px; margin: 30px 0;">
                <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #001a41; font-family: monospace;">${otpCode}</span>
            </div>
            <p style="text-align: center; color: #666; font-size: 14px;">Ce code est valable pendant 10 minutes. Ne le partagez avec personne.</p>
        `;
        return this.sendEmail(userEmail, subject, this.wrapTemplate(content));
    }

    /**
     * Envoi du lien de réinitialisation de mot de passe
     */
    async sendPasswordResetEmail(userEmail, userName, resetUrl) {
        const subject = `🔑 Réinitialisation de votre mot de passe`;
        const content = `
            <h2 style="color: #001a41; margin-top: 0;">Mot de passe oublié ?</h2>
            <p>Bonjour <strong>${userName}</strong>,</p>
            <p>Une demande de réinitialisation de mot de passe a été effectuée pour votre compte. Si vous en êtes l'auteur, veuillez cliquer sur le bouton ci-dessous :</p>
            <div style="margin: 40px 0; text-align: center;">
                <a href="${resetUrl}" 
                   style="background-color: #fecb00; color: #001a41; padding: 14px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                   Réinitialiser mon mot de passe
                </a>
            </div>
            <p style="color: #666; font-size: 14px;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
        `;
        return this.sendEmail(userEmail, subject, this.wrapTemplate(content));
    }
    /**
     * Alerte pour les agents/admins : Nouvelle demande reçue
     */
    async sendNewDemandeAlert(agentEmail, agentName, typeActe, citoyenName) {
        const subject = `🔔 Nouvelle demande de ${typeActe} - À traiter`;
        const content = `
            <h2 style="color: #001a41; margin-top: 0;">Nouvelle Demande Reçue</h2>
            <p>Bonjour Agt. <strong>${agentName}</strong>,</p>
            <p>Une nouvelle demande de <strong>${typeActe}</strong> vient d'être soumise par le citoyen <strong>${citoyenName}</strong>.</p>
            <div style="background-color: #f8f9fa; border-left: 4px solid #fecb00; padding: 20px; border-radius: 4px; margin: 25px 0;">
                <p style="margin: 0; font-weight: bold; color: #555;">Action requise :</p>
                <p style="margin: 5px 0 0 0;">Veuillez vérifier les pièces justificatives et valider ou rejeter le dossier dans les plus brefs délais.</p>
            </div>
            <div style="margin: 30px 0; text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/demandes" 
                   style="background-color: #001a41; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                   Accéder au Tableau de Bord
                </a>
            </div>
        `;
        return this.sendEmail(agentEmail, subject, this.wrapTemplate(content));
    }
}

module.exports = new EmailService();
