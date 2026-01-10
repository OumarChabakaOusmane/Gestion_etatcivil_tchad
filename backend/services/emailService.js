const nodemailer = require('nodemailer');

/**
 * Service pour l'envoi d'emails
 */
class EmailService {
    constructor() {
        // En développement, on peut utiliser Ethereal pour tester sans envoyer de vrais emails
        // Ou configurer un vrai transporteur via .env
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_PORT == 465,
            auth: {
                user: process.env.EMAIL_USER || 'pk2hr6g5cgqzh5uv@ethereal.email',
                pass: process.env.EMAIL_PASS || 'gMs8P499BYzzKBFVrP'
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    /**
     * Envoie un email générique
     */
    async sendEmail(to, subject, html) {
        try {
            const mailOptions = {
                from: `"État Civil Tchad" <${process.env.EMAIL_FROM || 'noreply@etatcivil.td'}>`,
                to,
                subject,
                html
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✉️ Email envoyé : %s', info.messageId);

            // Si on utilise Ethereal, on log l'URL de prévisualisation
            if (info.envelope && info.envelope.from === 'ethereal.user@ethereal.email' || info.host === 'smtp.ethereal.email') {
                console.log('🔗 Aperçu de l\'email : %s', nodemailer.getTestMessageUrl(info));
            }

            return info;
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi de l\'email :', error);
            // On ne bloque pas le processus principal si l'email échoue
            return null;
        }
    }

    /**
     * Notification de validation d'acte
     */
    async sendNotificationValidation(userEmail, userName, typeActe, idDemande) {
        const subject = `✅ Votre demande d'acte de ${typeActe} a été approuvée`;
        const html = `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h2 style="color: #0d6efd;">République du Tchad</h2>
                <p>Cher(e) <strong>${userName}</strong>,</p>
                <p>Nous avons le plaisir de vous informer que votre demande de <strong>${typeActe}</strong> (réf: ${idDemande.slice(-8).toUpperCase()}) a été <strong>validée</strong> par l'officier d'état civil.</p>
                <p>Vous pouvez dès à présent vous connecter à votre espace citoyen pour télécharger votre document officiel.</p>
                <div style="margin: 30px 0;">
                    <a href="http://localhost:5173/mes-demandes" style="background-color: #0d6efd; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accéder à mes documents</a>
                </div>
                <p>Cordialement,<br>L'Administration de l'État Civil du Tchad</p>
            </div>
        `;
        return this.sendEmail(userEmail, subject, html);
    }

    /**
     * Notification de rejet d'acte
     */
    async sendNotificationRejet(userEmail, userName, typeActe, motif) {
        const subject = `⚠️ Information concernant votre demande d'acte de ${typeActe}`;
        const html = `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h2 style="color: #dc3545;">République du Tchad</h2>
                <p>Cher(e) <strong>${userName}</strong>,</p>
                <p>Après examen, votre demande de <strong>${typeActe}</strong> n'a pas pu être validée pour le motif suivant :</p>
                <blockquote style="background: #f8f9fa; border-left: 5px solid #dc3545; padding: 15px;">
                    ${motif}
                </blockquote>
                <p>Nous vous invitons à soumettre une nouvelle demande en tenant compte de ces observations.</p>
                <div style="margin: 30px 0;">
                    <a href="http://localhost:5173/demande-acte" style="background-color: #6c757d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Refaire une demande</a>
                </div>
                <p>Cordialement,<br>L'Administration de l'État Civil du Tchad</p>
            </div>
        `;
        return this.sendEmail(userEmail, subject, html);
    }
}

module.exports = new EmailService();
