require('dotenv').config();
const emailService = require('./services/emailService');

async function sendPendingOTPs() {
    const citizens = [
        { email: 'oumardjawahassan@gmail.com', name: 'Oumar Djawa Hassan', otp: '168128' },
        { email: 'faissalhabibahmat@gmail.com', name: 'Faissal Habib Ahmat', otp: '204336' }
    ];

    console.log('--- ENVOI DES OTP EN ATTENTE ---');

    for (const c of citizens) {
        try {
            console.log(`Tentative d'envoi à ${c.email}...`);
            await emailService.sendOTPEmail(c.email, c.name, c.otp);
            console.log(`✅ Succès pour ${c.email}`);
        } catch (err) {
            console.error(`❌ Échec pour ${c.email}:`, err.message);
        }
    }
    console.log('Terminé. Vérifiez mail.log.');
}

sendPendingOTPs();
