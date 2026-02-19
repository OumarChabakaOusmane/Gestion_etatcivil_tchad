const nodemailer = require('nodemailer');

/**
 * Service pour l'envoi d'emails
 */
class EmailService {
    constructor() {
        // Configuration du transporteur email
        // FORCE EMAIL RÉEL même en développement si les variables sont présentes
        const useRealEmail = process.env.EMAIL_USER && process.env.EMAIL_PASS;

        if (useRealEmail) {
            // Configuration prioritair Gmail pour la robustesse
            const isGmail = (process.env.EMAIL_HOST || '').toLowerCase().includes('gmail.com') ||
                (process.env.EMAIL_USER || '').toLowerCase().includes('@gmail.com');

            let smtpConfig;

            if (isGmail) {
                // Utiliser 587 par défaut car 465 SSL est souvent bloqué par certains hébergeurs
                const port = parseInt(process.env.EMAIL_PORT) || 587;
                smtpConfig = {
                    host: 'smtp.gmail.com',
                    port: port,
                    secure: port === 465, // SSL pour 465, STARTTLS pour 587
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                };
                console.log(`✅ [PROD] Service Email configuré via GMAIL (${port} ${port === 465 ? 'SSL' : 'STARTTLS'})`);
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

            // Augmentation massive des timeouts pour la production
            smtpConfig.connectionTimeout = 40000; // 40s (soyez patients sur Render free)
            smtpConfig.greetingTimeout = 40000;
            smtpConfig.socketTimeout = 40000;
            smtpConfig.pool = true; // Utiliser un pool pour plus de robustesse

            this.transporter = nodemailer.createTransport(smtpConfig);
        } else {
            console.error('❌ CONFIGURATION EMAIL INCOMPLÈTE :', {
                hasUser: !!process.env.EMAIL_USER,
                hasPass: !!process.env.EMAIL_PASS
            });
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
    /**
     * Envoie un email générique avec mécanisme de repli automatique (fallback) pour les ports bloqués
     */
    async sendEmail(to, subject, html, text = "") {
        const fs = require('fs');
        const path = require('path');
        const logPath = path.join(__dirname, '../mail_debug.log');

        const log = (msg) => {
            const entry = `${new Date().toISOString()} - ${msg}\n`;
            fs.appendFileSync(logPath, entry);
            console.log(msg);
        };

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

        try {
            log(`📧 [EMAIL] Tentative d'envoi à: ${to} - Sujet: ${subject} (Port: ${this.transporter.options.port})`);
            const info = await this.transporter.sendMail(mailOptions);
            log(`✅ [EMAIL] Succès : ${to} - MessageId: ${info.messageId}`);
            return info;
        } catch (error) {
            log(`⚠️ [EMAIL] Échec sur port ${this.transporter.options.port}: ${error.message}`);

            // Si l'erreur ressemble à un blocage de port (timeout ou connexion refusée)
            const isConnectionError = error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.message.includes('timeout');
            const currentPort = this.transporter.options.port;

            if (isConnectionError && (currentPort === 465 || currentPort === 587)) {
                const fallbackPort = currentPort === 465 ? 587 : 465;
                log(`🔄 [EMAIL] Tentative de repli (fallback) sur le port ${fallbackPort}...`);

                try {
                    // Créer un transporteur temporaire pour le repli
                    const fallbackConfig = {
                        ...this.transporter.options,
                        port: fallbackPort,
                        secure: fallbackPort === 465,
                        // Augmenter encore le timeout pour le retry
                        connectionTimeout: 50000,
                        greetingTimeout: 50000
                    };
                    const fallbackTransporter = nodemailer.createTransport(fallbackConfig);

                    const info = await fallbackTransporter.sendMail(mailOptions);
                    log(`✅ [EMAIL] Succès via FALLBACK port ${fallbackPort} : ${to}`);
                    return info;
                } catch (fallbackError) {
                    log(`❌ [EMAIL] Échec définitif même après repli sur ${fallbackPort}: ${fallbackError.message}`);
                }
            }

            log(`❌ [EMAIL] Erreur finale lors de l'envoi à ${to}: ${error.message}`);
            throw error;
        }
    }

    async verifyConnection() {
        try {
            return await this.transporter.verify();
        } catch (error) {
            console.warn(`⚠️ [VERIFY] Échec connexion initiale: ${error.message}`);
            // Ne pas lever d'erreur ici pour permettre au fallback de sendEmail de fonctionner
            return false;
        }
    }

    /**
     * Notification de validation d'acte
     */
    async sendNotificationValidation(userEmail, userName, typeActe, idDemande) {
        const subject = `✅ SIGEC-TCHAD - Votre demande de ${typeActe} approuvée`;
        const content = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 32, 91, 0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px 20px; text-align: center;">
                    <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: rgba(255, 255, 255, 0.1); border-radius: 50%; margin-bottom: 15px;">
                        <span style="font-size: 28px;">✅</span>
                    </div>
                    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">SIGEC-TCHAD</h1>
                    <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">République du Tchad - État Civil Numérique</p>
                </div>

                <!-- Body -->
                <div style="padding: 40px 30px; background: white;">
                    <h2 style="color: #28a745; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">🎉 Félicitations ! Votre demande a été approuvée</h2>
                    
                    <p style="color: #495057; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                        Cher(e) <strong style="color: #28a745;">${userName}</strong>,<br>
                        Nous avons le plaisir de vous informer que votre demande a été traitée avec succès.
                    </p>

                    <!-- Success Box -->
                    <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border: 2px solid #28a745; border-radius: 12px; padding: 25px; margin: 30px 0;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                            <div style="display: flex; align-items: center; justify-content: center; width: 50px; height: 50px; background: #28a745; border-radius: 50%;">
                                <span style="font-size: 24px; color: white;">📄</span>
                            </div>
                            <div>
                                <div style="font-size: 18px; font-weight: 600; color: #155724; margin-bottom: 5px;">${typeActe}</div>
                                <div style="font-size: 14px; color: #6c757d;">Référence: <strong>${idDemande.slice(-8).toUpperCase()}</strong></div>
                            </div>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 16px; color: #155724; font-weight: 500;">✅ DEMANDE VALIDÉE</div>
                            <div style="font-size: 14px; color: #6c757d; margin-top: 5px;">Vous pouvez maintenant télécharger votre document</div>
                        </div>
                    </div>

                    <!-- Action Button -->
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/mes-demandes" 
                           style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            📥 Accéder à mes documents
                        </a>
                    </div>

                    <!-- Instructions -->
                    <div style="background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                        <div style="display: flex; align-items: flex-start; gap: 12px;">
                            <span style="font-size: 18px; color: #0c5460;">ℹ️</span>
                            <div>
                                <strong style="color: #0c5460;">Prochaines étapes :</strong>
                                <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #0c5460;">
                                    <li style="margin-bottom: 5px;">Connectez-vous à votre espace personnel</li>
                                    <li style="margin-bottom: 5px;">Téléchargez votre ${typeActe} certifié</li>
                                    <li>Conservez précieusement ce document</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <p style="color: #6c757d; margin: 30px 0 0 0; font-size: 14px; text-align: center;">
                        Merci d'utiliser les services de l'État Civil Tchad.
                    </p>
                </div>

                <!-- Footer -->
                <div style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin-bottom: 15px;">
                        <div style="display: flex; align-items: center; gap: 8px; color: #6c757d;">
                            <span>🏛️</span>
                            <span style="font-size: 14px; font-weight: 500;">République du Tchad</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; color: #6c757d;">
                            <span>✅</span>
                            <span style="font-size: 14px; font-weight: 500;">Validé</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; color: #6c757d;">
                            <span>📱</span>
                            <span style="font-size: 14px; font-weight: 500;">Mobile Friendly</span>
                        </div>
                    </div>
                    <p style="margin: 0; font-size: 12px; color: #adb5bd;">
                        © 2026 SIGEC-TCHAD - Service d'État Civil Numérique<br>
                        Ceci est un message automatisé, ne pas répondre.
                    </p>
                </div>
            </div>
        `;
        const text = `SIGEC-TCHAD - Votre demande de ${typeActe} a été approuvée (Réf: ${idDemande.slice(-8).toUpperCase()}). Connectez-vous pour télécharger votre document.`;
        return this.sendEmail(userEmail, subject, this.wrapTemplate(content), text);
    }

    /**
     * Notification de rejet d'acte
     */
    async sendNotificationRejet(userEmail, userName, typeActe, motif) {
        const subject = `⚠️ SIGEC-TCHAD - Information concernant votre demande de ${typeActe}`;
        const content = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 32, 91, 0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); padding: 30px 20px; text-align: center;">
                    <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: rgba(255, 255, 255, 0.1); border-radius: 50%; margin-bottom: 15px;">
                        <span style="font-size: 28px;">⚠️</span>
                    </div>
                    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">SIGEC-TCHAD</h1>
                    <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">République du Tchad - État Civil Numérique</p>
                </div>

                <!-- Body -->
                <div style="padding: 40px 30px; background: white;">
                    <h2 style="color: #fd7e14; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">📋 Information importante sur votre demande</h2>
                    
                    <p style="color: #495057; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                        Cher(e) <strong style="color: #fd7e14;">${userName}</strong>,<br>
                        Nous vous contactons concernant votre demande qui nécessite votre attention.
                    </p>

                    <!-- Rejection Box -->
                    <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%); border: 2px solid #ffc107; border-radius: 12px; padding: 25px; margin: 30px 0;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                            <div style="display: flex; align-items: center; justify-content: center; width: 50px; height: 50px; background: #ffc107; border-radius: 50%;">
                                <span style="font-size: 24px; color: white;">📄</span>
                            </div>
                            <div>
                                <div style="font-size: 18px; font-weight: 600; color: #856404; margin-bottom: 5px;">${typeActe}</div>
                                <div style="font-size: 14px; color: #6c757d;">Demande nécessitant une action</div>
                            </div>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px;">
                            <div style="font-size: 16px; color: #856404; font-weight: 500; margin-bottom: 10px;">❌ Demande rejetée</div>
                            <div style="font-size: 14px; color: #6c757d;">
                                <strong>Motif :</strong> ${motif}
                            </div>
                        </div>
                    </div>

                    <!-- Action Button -->
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/mes-demandes" 
                           style="display: inline-block; background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            🔄 Consulter ma demande
                        </a>
                    </div>

                    <!-- Instructions -->
                    <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                        <div style="display: flex; align-items: flex-start; gap: 12px;">
                            <span style="font-size: 18px; color: #721c24;">📝</span>
                            <div>
                                <strong style="color: #721c24;">Que faire ?</strong>
                                <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #721c24;">
                                    <li style="margin-bottom: 5px;">Connectez-vous à votre espace personnel</li>
                                    <li style="margin-bottom: 5px;">Consultez les détails du rejet</li>
                                    <li>Corrigez les informations si nécessaire</li>
                                    <li>Soumettez une nouvelle demande si requis</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Support Info -->
                    <div style="background: #e2e3e5; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
                        <div style="font-size: 16px; color: #495057; font-weight: 500; margin-bottom: 10px;">Besoin d'aide ?</div>
                        <div style="font-size: 14px; color: #6c757d;">
                            Contactez notre support technique :<br>
                            📧 support@etatcivil.td | 📞 +235 12 34 56 78
                        </div>
                    </div>

                    <p style="color: #6c757d; margin: 30px 0 0 0; font-size: 14px; text-align: center;">
                        Nous sommes là pour vous accompagner dans vos démarches.
                    </p>
                </div>

                <!-- Footer -->
                <div style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin-bottom: 15px;">
                        <div style="display: flex; align-items: center; gap: 8px; color: #6c757d;">
                            <span>🏛️</span>
                            <span style="font-size: 14px; font-weight: 500;">République du Tchad</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; color: #6c757d;">
                            <span>⚠️</span>
                            <span style="font-size: 14px; font-weight: 500;">Attention</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; color: #6c757d;">
                            <span>📱</span>
                            <span style="font-size: 14px; font-weight: 500;">Mobile Friendly</span>
                        </div>
                    </div>
                    <p style="margin: 0; font-size: 12px; color: #adb5bd;">
                        © 2026 SIGEC-TCHAD - Service d'État Civil Numérique<br>
                        Ceci est un message automatisé, ne pas répondre.
                    </p>
                </div>
            </div>
        `;
        const text = `SIGEC-TCHAD - Votre demande de ${typeActe} a été rejetée. Motif: ${motif}. Connectez-vous pour plus de détails.`;
        return this.sendEmail(userEmail, subject, this.wrapTemplate(content), text);
    }

    /**
     * Envoi du code OTP
     */
    async sendOTPEmail(userEmail, userName, otpCode) {
        console.log('='.repeat(60));
        console.log(`🔐 [OTP] Envoi à: ${userEmail}`);
        console.log(`🔐 [OTP] Code: ${otpCode}`);
        console.log(`🔐 [OTP] Service: ${process.env.EMAIL_USER || 'Ethereal (TEST)'}`);
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
                        <div style="display: flex; align-items: flex-start; gap: 12px;">
                            <span style="font-size: 18px; color: #856404;">⚠️</span>
                            <div>
                                <strong style="color: #856404;">Important :</strong>
                                <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #856404;">
                                    <li style="margin-bottom: 5px;">Ne partagez jamais ce code avec personne</li>
                                    <li style="margin-bottom: 5px;">Vérifiez votre dossier <strong>SPAM</strong> si vous ne voyez pas l'email</li>
                                    <li>Le code expirera automatiquement après 10 minutes</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <p style="color: #6c757d; margin: 30px 0 0 0; font-size: 14px; text-align: center;">
                        Si vous n'avez pas demandé cette vérification, ignorez cet email.
                    </p>
                </div>

                <!-- Footer -->
                <div style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin-bottom: 15px;">
                        <div style="display: flex; align-items: center; gap: 8px; color: #6c757d;">
                            <span>🏛️</span>
                            <span style="font-size: 14px; font-weight: 500;">République du Tchad</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; color: #6c757d;">
                            <span>🔒</span>
                            <span style="font-size: 14px; font-weight: 500;">Sécurisé</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; color: #6c757d;">
                            <span>📱</span>
                            <span style="font-size: 14px; font-weight: 500;">Mobile Friendly</span>
                        </div>
                    </div>
                    <p style="margin: 0; font-size: 12px; color: #adb5bd;">
                        © 2026 SIGEC-TCHAD - Service d'État Civil Numérique<br>
                        Ceci est un message automatisé, ne pas répondre.
                    </p>
                </div>
            </div>
        `;
        const text = `SIGEC-TCHAD - Votre code de vérification est : ${otpCode}. Valide 10 minutes. Ne le partagez pas.`;
        
        try {
            const result = await this.sendEmail(userEmail, subject, this.wrapTemplate(content), text);
            console.log(`✅ [OTP] Email envoyé avec succès à ${userEmail}`);
            return result;
        } catch (error) {
            console.error(`❌ [OTP] ÉCHEC envoi à ${userEmail}:`, error.message);
            throw error;
        }
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
