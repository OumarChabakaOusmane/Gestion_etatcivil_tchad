const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

/**
 * @route   POST /api/test/send-email
 * @desc    Endpoint de test pour diagnostiquer l'envoi d'emails
 * @access  Public (À SUPPRIMER EN PRODUCTION)
 */
router.post('/send-email', async (req, res) => {
    const { email, name } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email requis' });
    }

    try {
        console.log('🧪 TEST EMAIL - Début');
        console.log('Destinataire:', email);
        console.log('Configuration SMTP:', {
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            user: process.env.EMAIL_USER,
            hasPassword: !!process.env.EMAIL_PASS
        });

        // Vérifier la connexion SMTP
        console.log('🔍 Vérification connexion SMTP...');
        await emailService.verifyConnection();
        console.log('✅ Connexion SMTP OK');

        // Envoyer un email de test
        const testOTP = '999999';
        console.log('📧 Envoi email de test...');
        const result = await emailService.sendOTPEmail(email, name || 'Test User', testOTP);
        console.log('✅ Email envoyé avec succès');
        console.log('MessageId:', result.messageId);
        console.log('Response:', result.response);

        return res.json({
            success: true,
            message: 'Email de test envoyé avec succès',
            details: {
                messageId: result.messageId,
                response: result.response,
                recipient: email
            }
        });

    } catch (error) {
        console.error('❌ ERREUR TEST EMAIL:', error);
        return res.status(500).json({
            success: false,
            message: 'Échec envoi email',
            error: error.message,
            code: error.code,
            command: error.command
        });
    }
});

/**
 * @route   GET /api/test/email-config
 * @desc    Affiche la configuration email (sans mot de passe)
 * @access  Public (À SUPPRIMER EN PRODUCTION)
 */
router.get('/email-config', (req, res) => {
    res.json({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER,
        hasPassword: !!process.env.EMAIL_PASS,
        passwordLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0,
        from: process.env.EMAIL_FROM
    });
});

module.exports = router;
