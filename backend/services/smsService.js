const { db } = require('../config/firebase');
const { Timestamp } = require('firebase-admin/firestore');

/**
 * Service pour simuler l'envoi de SMS (très pertinent pour le contexte du Tchad)
 */
class SmsService {
    /**
     * Simule l'envoi d'un SMS
     * @param {string} phone - Numéro de téléphone du destinataire
     * @param {string} message - Contenu du message
     * @param {string} userId - ID de l'utilisateur (optionnel pour traçage)
     */
    static async sendSms(phone, message, userId = null, skipDb = false) {
        try {
            // [LOG] SIMULATION DANS LE TERMINAL
            console.log(`\n📱 [SMS SIMULATION] To: ${phone}\n💬 Message: ${message}\n`);

            // On n'enregistre PAS dans Firestore si c'est sensible (ex: OTP)
            if (!skipDb) {
                const smsData = {
                    phone,
                    message,
                    userId,
                    status: 'delivered',
                    createdAt: Timestamp.now(),
                    read: false
                };
                await db.collection('simulated_sms').add(smsData);
            }

            return { success: true, message: 'SMS envoyé' };
        } catch (error) {
            console.error('Erreur lors de la simulation SMS:', error);
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
