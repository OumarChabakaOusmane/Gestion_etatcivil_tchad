const { Resend } = require('resend');

/**
 * Service pour l'envoi d'emails via Resend API (HTTPS - compatible Render)
 */
class EmailService {
    constructor() {
        const apiKey = process.env.RESEND_API_KEY;

        console.log('='.repeat(50));
        console.log('📧 [EMAIL SERVICE] Initialisation via Resend API...');
        console.log(`📧 [EMAIL SERVICE] NODE_ENV: ${process.env.NODE_ENV}`);
        console.log(`📧 [EMAIL SERVICE] RESEND_API_KEY: ${apiKey ? '✅ Configuré' : '❌ MANQUANT!'}`);
        console.log(`📧 [EMAIL SERVICE] FROM: ${process.env.EMAIL_FROM || 'noreply@sigec-tchad.fr'}`);
        console.log('='.repeat(50));

        if (!apiKey) {
            console.error('❌ RESEND_API_KEY manquante! Les emails ne seront pas envoyés.');
        }

        this.resend = new Resend(apiKey || 're_placeholder');
        this.fromAddress = process.env.EMAIL_FROM || 'noreply@sigec-tchad.fr';
        this.fromName = 'SIGEC-TCHAD - République du Tchad';
    }

    /**
     * Gabarit institutionnel pour tous les emails
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
     * Méthode générique d'envoi d'email via Resend API
     */
    async sendEmail(to, subject, html, text = '') {
        console.log(`📧 [EMAIL] Envoi à: ${to} - Sujet: ${subject}`);

        try {
            const { data, error } = await this.resend.emails.send({
                from: `${this.fromName} <${this.fromAddress}>`,
                to: [to],
                subject: subject,
                html: this.wrapTemplate(html),
                text: text || 'Veuillez ouvrir cet email avec un client supportant le HTML.',
            });

            if (error) {
                console.error(`❌ [EMAIL] Erreur Resend:`, error);
                throw new Error(error.message || 'Erreur Resend API');
            }

            console.log(`✅ [EMAIL] Succès: ${to} - ID: ${data?.id}`);
            return { messageId: data?.id, ...data };
        } catch (error) {
            console.error(`❌ [EMAIL] Erreur finale lors de l'envoi à ${to}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Envoi du code OTP
     */
    async sendOTPEmail(userEmail, userName, otpCode) {
        console.log('='.repeat(60));
        console.log(`🔐 [OTP] Envoi à: ${userEmail}`);
        console.log(`🔐 [OTP] Code: ${otpCode}`);
        console.log(`🔐 [OTP] Via: Resend API`);
        console.log('='.repeat(60));

        const subject = `🔐 SIGEC-TCHAD - Code de vérification`;
        const content = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 32, 91, 0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #00205b 0%, #00338d 100%); padding: 30px 20px; text-align: center;">
                    <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: rgba(255, 255, 255, 0.1); border-radius: 50%; margin-bottom: 15px;">
                        <span style="font-size: 28px;">🔐</span>
                    </div>
                    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">SIGEC-TCHAD</h1>
                    <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">République du Tchad - État Civil Numérique</p>
                </div>

                <!-- Body -->
                <div style="padding: 40px 30px; background: white;">
                    <h2 style="color: #00205b; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Vérification de votre compte</h2>
                    
                    <p style="color: #495057; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                        Bonjour <strong style="color: #00205b;">${userName}</strong>,<br>
                        Pour sécuriser votre compte, veuillez utiliser le code de vérification ci-dessous :
                    </p>

                    <!-- Code Box -->
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 2px dashed #00205b; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
                        <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #00205b; font-family: 'Courier New', monospace;">
                            ${otpCode}
                        </div>
                        <div style="margin-top: 15px; font-size: 14px; color: #6c757d;">
                            ⏰ Valide pendant 10 minutes
                        </div>
                    </div>

                    <!-- Instructions -->
                    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                        <strong style="color: #856404;">Important :</strong>
                        <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #856404;">
                            <li style="margin-bottom: 5px;">Ne partagez jamais ce code avec personne</li>
                            <li style="margin-bottom: 5px;">Vérifiez votre dossier <strong>SPAM</strong> si vous ne voyez pas l'email</li>
                            <li>Le code expirera automatiquement après 10 minutes</li>
                        </ul>
                    </div>

                    <p style="color: #6c757d; margin: 30px 0 0 0; font-size: 14px; text-align: center;">
                        Si vous n'avez pas demandé cette vérification, ignorez cet email.
                    </p>
                </div>

                <!-- Footer -->
                <div style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0; font-size: 12px; color: #adb5bd;">
                        © 2026 SIGEC-TCHAD - Service d'État Civil Numérique<br>
                        Ceci est un message automatisé, ne pas répondre.
                    </p>
                </div>
            </div>
        `;
        const text = `SIGEC-TCHAD - Votre code de vérification est : ${otpCode}. Valide 10 minutes. Ne le partagez pas.`;

        try {
            const result = await this.sendEmail(userEmail, subject, content, text);
            console.log(`✅ [OTP] Email envoyé avec succès à ${userEmail}`);
            return result;
        } catch (error) {
            console.error(`❌ [OTP] ÉCHEC envoi à ${userEmail}:`, error.message);
            throw error;
        }
    }

    /**
     * Notification de validation d'acte
     */
    async sendNotificationValidation(userEmail, userName, typeActe, idDemande) {
        const subject = `✅ SIGEC-TCHAD - Votre demande de ${typeActe} approuvée`;
        const content = `
            <div style="padding: 20px; font-family: sans-serif;">
                <h2 style="color: #28a745;">🎉 Félicitations ! Votre demande a été approuvée</h2>
                <p>Cher(e) <strong>${userName}</strong>,<br>
                Votre demande de <strong>${typeActe}</strong> a été traitée avec succès.</p>
                <div style="background: #d4edda; border: 2px solid #28a745; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <div style="font-size: 18px; font-weight: 600; color: #155724;">${typeActe}</div>
                    <div style="font-size: 14px; color: #6c757d;">Référence: <strong>${idDemande.slice(-8).toUpperCase()}</strong></div>
                    <div style="margin-top: 10px; color: #155724; font-weight: 500;">✅ DEMANDE VALIDÉE</div>
                </div>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/mes-demandes" 
                       style="display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                        📥 Accéder à mes documents
                    </a>
                </div>
            </div>
        `;
        const text = `SIGEC-TCHAD - Votre demande de ${typeActe} a été approuvée (Réf: ${idDemande.slice(-8).toUpperCase()}). Connectez-vous pour télécharger votre document.`;
        return this.sendEmail(userEmail, subject, content, text);
    }

    /**
     * Notification de rejet d'acte
     */
    async sendNotificationRejet(userEmail, userName, typeActe, motif) {
        const subject = `⚠️ SIGEC-TCHAD - Information concernant votre demande de ${typeActe}`;
        const content = `
            <div style="padding: 20px; font-family: sans-serif;">
                <h2 style="color: #fd7e14;">📋 Information importante sur votre demande</h2>
                <p>Cher(e) <strong>${userName}</strong>,<br>
                Votre demande de <strong>${typeActe}</strong> nécessite votre attention.</p>
                <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <div style="font-size: 18px; font-weight: 600; color: #856404;">${typeActe}</div>
                    <div style="margin-top: 10px;">
                        <strong>Motif :</strong> ${motif}
                    </div>
                </div>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/mes-demandes" 
                       style="display: inline-block; background: #ffc107; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                        🔄 Consulter ma demande
                    </a>
                </div>
            </div>
        `;
        const text = `SIGEC-TCHAD - Votre demande de ${typeActe} a été rejetée. Motif: ${motif}. Connectez-vous pour plus de détails.`;
        return this.sendEmail(userEmail, subject, content, text);
    }

    /**
     * Envoi du lien de réinitialisation de mot de passe
     */
    async sendPasswordResetEmail(userEmail, userName, resetUrl) {
        const subject = `🔑 Réinitialisation de votre mot de passe`;
        const content = `
            <div style="padding: 20px; font-family: sans-serif;">
                <h2>Mot de passe oublié ?</h2>
                <p>Bonjour ${userName},</p>
                <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; background: #00205b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                        🔑 Réinitialiser mon mot de passe
                    </a>
                </div>
                <p style="font-size: 12px; color: #6c757d;">Lien valide 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            </div>
        `;
        const text = `Bonjour ${userName}, réinitialisez votre mot de passe via ce lien : ${resetUrl}`;
        return this.sendEmail(userEmail, subject, content, text);
    }

    /**
     * Alerte pour les agents/admins : Nouvelle demande reçue
     */
    async sendNewDemandeAlert(agentEmail, agentName, typeActe, citoyenName) {
        const subject = `🔔 Nouvelle demande de ${typeActe}`;
        const content = `
            <div style="padding: 20px; font-family: sans-serif;">
                <h2>Nouvelle Demande Reçue</h2>
                <p>Bonjour Agt. ${agentName},</p>
                <p>Le citoyen <strong>${citoyenName}</strong> a soumis une demande de <strong>${typeActe}</strong>.</p>
            </div>
        `;
        const text = `Nouvelle demande de ${typeActe} soumise par ${citoyenName}.`;
        return this.sendEmail(agentEmail, subject, content, text);
    }

    /**
     * Vérification de la connexion (compatibilité)
     */
    async verifyConnection() {
        console.log('✅ [RESEND] Pas de vérification SMTP requise — utilisation de l\'API HTTPS.');
        return true;
    }
}

module.exports = new EmailService();
