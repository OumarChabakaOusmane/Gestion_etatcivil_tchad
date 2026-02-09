require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTP() {
    console.log('--- Diagnostic SMTP ---');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'smtp.gmail.com');
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT || 587);

    const transporter = nodemailer.createTransport({
        service: 'gmail', // On teste avec le service prédéfini
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        console.log('Vérification de la connexion...');
        await transporter.verify();
        console.log('✅ Connexion SMTP réussie !');

        console.log('Envoi d\'un email de test...');
        const info = await transporter.sendMail({
            from: `"Test SIGEC" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // S'envoyer à soi-même
            subject: 'Test SMTP SIGEC',
            text: 'Ceci est un test de connexion SMTP pour SIGEC-TCHAD.',
            html: '<b>Ceci est un test de connexion SMTP pour SIGEC-TCHAD.</b>'
        });

        console.log('✅ Email envoyé avec succès !');
        console.log('ID Message:', info.messageId);
    } catch (error) {
        console.error('❌ Échec du test SMTP :');
        console.error(error);
    }
}

testSMTP();
