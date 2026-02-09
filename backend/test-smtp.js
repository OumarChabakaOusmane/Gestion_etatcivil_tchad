const emailService = require('./services/emailService');

async function testSMTP() {
    console.log('--- Diagnostic SMTP (Via App Service) ---');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);

    try {
        console.log('Envoi d\'un email de test...');
        const info = await emailService.sendEmail(
            process.env.EMAIL_USER,
            'Test SIGEC App Service',
            '<b>Ceci teste la configuration réelle de l\'application.</b>'
        );

        console.log('✅ Email envoyé avec succès !');
        console.log('ID Message:', info.messageId);
    } catch (error) {
        console.error('❌ Échec du test SMTP :');
        console.error(error);
    }
}

testSMTP();
