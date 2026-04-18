const { db } = require('../config/firebase');
const { Timestamp } = require('firebase-admin/firestore');
const twilio = require('twilio');

/**
 * Service pour simuler l'envoi de SMS (très pertinent pour le contexte du Tchad)
 */
class SmsService {
    /**
     * Obtenir le client Twilio (Singleton)
     */
    static getClient() {
        if (!this.client && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            try {
                this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                this.twilioPhone = process.env.TWILIO_PHONE_NUMBER;
                console.log('✅ [TWILIO] Client initialisé avec succès.');
            } catch (err) {
                console.error('❌ [TWILIO] Erreur initialisation:', err.message);
            }
        }
        return this.client;
    }

    /**
     * Simule ou envoie un SMS réel via Twilio
     * @param {string} phone - Numéro de téléphone du destinataire
     * @param {string} message - Contenu du message
     * @param {string} userId - ID de l'utilisateur (optionnel pour traçage)
     */
    static async sendSms(phone, message, userId = null, skipDb = false) {
        try {
            const client = this.getClient();
            const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

            console.log(`\n📱 [SMS] To: ${formattedPhone}\n💬 Message: ${message}\n`);

            let status = 'simulated';

            if (client) {
                try {
                    console.log(`📱 [TWILIO] Envoi au réseau...`);
                    const result = await client.messages.create({
                        body: message,
                        from: this.twilioPhone,
                        to: formattedPhone
                    });
                    console.log(`✅ [TWILIO] SMS envoyé avec succès. SID: ${result.sid}`);
                    status = 'sent';
                } catch (twError) {
                    console.error('❌ [TWILIO] Échec envoi réseau:', twError.message);
                    status = 'failed';
                }
            } else {
                console.log(`⚠️ [TWILIO] Mode simulation (Clés non configurées)`);
            }

            // On n'enregistre PAS dans Firestore si c'est sensible (ex: OTP)
            if (!skipDb) {
                const smsData = {
                    phone: formattedPhone,
                    message,
                    userId,
                    status,
                    createdAt: Timestamp.now(),
                    read: false
                };
                // Renforcer le contexte réel si possible
                await db.collection('historique_sms').add(smsData);
            }

            return { success: true, message: 'Processus SMS terminé', status };
        } catch (error) {
            console.error('Erreur lors du traitement SMS:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * SMS pour l'OTP
     */
    static async sendOtpSms(phone, otp) {
        const message = `SIGEC TCHAD : Votre code de vérification est ${otp}. Il expire dans 10 minutes. Ne le partagez pas.`;
        // skipDb = true pour la sécurité
        return this.sendSms(phone, message, null, true);
    }

    /**
     * SMS pour la validation d'une demande
     */
    static async sendValidationSms(phone, typeActe, numeroActe) {
        const message = `Félicitations ! Votre demande d'acte de ${typeActe} a été approuvée. N° d'acte : ${numeroActe}. Vous pouvez le télécharger sur votre espace citoyen.`;
        return this.sendSms(phone, message);
    }

    /**
     * SMS pour le rejet d'une demande
     */
    static async sendRejetSms(phone, typeActe, motif) {
        const message = `SIGEC TCHAD : Votre demande d'acte de ${typeActe} a été rejetée. Motif : ${motif}. Consultez votre espace citoyen pour plus de détails.`;
        return this.sendSms(phone, message);
    }

    /**
     * SMS de confirmation de réception
     */
    static async sendReceptionSms(phone, typeActe) {
        const message = `SIGEC TCHAD : Nous avons bien reçu votre demande de ${typeActe}. Elle est en cours de traitement par nos services.`;
        return this.sendSms(phone, message);
    }
}

module.exports = SmsService;
