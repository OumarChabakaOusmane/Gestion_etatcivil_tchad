const Demande = require('../models/demande.model');
const Naissance = require('../models/Naissance');
const Mariage = require('../models/Mariage');
const Deces = require('../models/Deces');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const { sendPushNotification } = require('../services/expoPushService');
const logAction = require('../utils/auditLogger');

/**
 * Crée une nouvelle demande
 * @route POST /api/demandes
 * @access Privé (Utilisateur authentifié)
 */
const createDemande = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Non autorisé. Veuillez vous connecter.'
            });
        }

        const { type, donnees } = req.body;

        // Validation du type
        if (!['naissance', 'mariage', 'deces'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Type de demande invalide. Types acceptés: naissance, mariage, deces'
            });
        }

        // Validation des données
        if (!donnees || typeof donnees !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Les données de la demande sont requises.'
            });
        }

        const demandeData = {
            type,
            userId: req.user.id,
            donnees,
            documentIds: req.body.documentIds || []
        };

        const nouvelleDemande = await Demande.create(demandeData);

        // NOTIFICATION AUX ADMINS (Async)
        // NOTIFICATION AUX ADMINS ET AGENTS (Async)
        try {
            // Récupérer les Admins ET les Agents
            const admins = await User.findByRole('admin');
            const agents = await User.findByRole('agent');
            const staff = [...admins, ...agents];

            // Pour éviter les doublons si un jour un user a plusieurs casquettes (rare mais possible)
            const notifiedUserIds = new Set();

            for (const member of staff) {
                const memberId = member.id || member._id;

                if (notifiedUserIds.has(memberId)) continue;
                notifiedUserIds.add(memberId);

                // 1. Notification Interne (In-App)
                await Notification.create({
                    userId: memberId,
                    title: 'Nouvelle demande',
                    message: `Une nouvelle demande de ${type} a été soumise par ${req.user.prenom} ${req.user.nom}.`,
                    type: 'info',
                    link: `/admin/demandes`
                });

                // 2. Notification Email (Alerte)
                if (member.email) {
                    emailService.sendNewDemandeAlert(
                        member.email,
                        member.prenom || 'Agent',
                        type,
                        `${req.user.prenom} ${req.user.nom}`
                    );
                }
            }

            // Notification SMS au citoyen (Confirmation de réception)
            if (req.user.telephone) {
                smsService.sendReceptionSms(req.user.telephone, type);
            }
        } catch (notifErr) {
            console.error('Erreur notification admin/SMS:', notifErr);
        }

        res.status(201).json({
            success: true,
            message: 'Demande créée avec succès',
            data: nouvelleDemande
        });

    } catch (error) {
        console.error('Erreur lors de la création de la demande:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la création de la demande',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Récupère les demandes de l'utilisateur connecté
 * @route GET /api/demandes/me
 * @access Privé (Utilisateur authentifié)
 */
const getMyDemandes = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Non autorisé. Veuillez vous connecter.'
            });
        }

        const { type, statut, page = 1, limit = 10 } = req.query;

        const { demandes, pagination } = await Demande.findByUserId(req.user.id, {
            type,
            statut,
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.status(200).json({
            success: true,
            count: demandes.length,
            pagination,
            data: demandes
        });

    } catch (error) {
        if (error.code === 14) {
            console.warn('⚠️ Attention: Firestore inaccessible (Problème DNS/Réseau). Impossible de récupérer les demandes.');
            res.status(503).json({
                success: false,
                message: 'Service temporairement indisponible (Connexion Base de Données)',
                error: 'Firestore unavailable'
            });
        } else {
            console.error('Erreur lors de la récupération des demandes:', error);
            res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la récupération des demandes',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

/**
 * Récupère toutes les demandes (admin)
 * @route GET /api/demandes
 * @access Privé (Admin)
 */
const getAllDemandes = async (req, res) => {
    try {
        const { page = 1, limit = 20, type, statut } = req.query;

        const { demandes, pagination } = await Demande.findAll({
            page: parseInt(page),
            limit: parseInt(limit),
            type,
            statut
        });

        // Population manuelle des données utilisateurs
        const populatedDemandes = await Promise.all(demandes.map(async (demande) => {
            if (demande.userId) {
                const user = await User.findById(demande.userId);
                return { ...demande, userId: user };
            }
            return demande;
        }));

        res.status(200).json({
            success: true,
            count: populatedDemandes.length,
            pagination,
            data: populatedDemandes
        });

    } catch (error) {
        if (error.code === 14) {
            console.warn('⚠️ Attention: Firestore inaccessible (Problème DNS/Réseau). Impossible de récupérer les demandes.');
            res.status(503).json({
                success: false,
                message: 'Service temporairement indisponible (Connexion Base de Données)',
                error: 'Firestore unavailable'
            });
        } else {
            console.error('Erreur lors de la récupération des demandes:', error);
            res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la récupération des demandes',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

/**
 * Récupère une demande par son ID
 * @route GET /api/demandes/:id
 * @access Privé (Utilisateur ou Admin)
 */
const getDemandeById = async (req, res) => {
    try {
        const demande = await Demande.findById(req.params.id);

        if (!demande) {
            return res.status(404).json({
                success: false,
                message: 'Demande non trouvée'
            });
        }

        // Vérifier que l'utilisateur a le droit de voir cette demande
        if (req.user.role !== 'admin' && demande.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
        }

        res.status(200).json({
            success: true,
            data: demande
        });

    } catch (error) {
        console.error('Erreur lors de la récupération de la demande:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la récupération de la demande',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Met à jour le statut d'une demande (accepter/rejeter)
 * @route PATCH /api/demandes/:id/statut
 * @access Privé (Admin)
 */
const updateDemandeStatut = async (req, res) => {
    try {
        const { statut, motifRejet } = req.body;

        // Validation du statut
        if (!['acceptee', 'rejetee'].includes(statut)) {
            return res.status(400).json({
                success: false,
                message: 'Statut invalide. Statuts acceptés: acceptee, rejetee'
            });
        }

        // Récupérer la demande
        const demande = await Demande.findById(req.params.id);

        if (!demande) {
            return res.status(404).json({
                success: false,
                message: 'Demande non trouvée'
            });
        }

        let acteId = null;

        // Si la demande est acceptée, créer l'acte correspondant
        if (statut === 'acceptee') {
            try {
                let acte;
                // On génère un numéro d'acte temporaire si non fourni
                const numeroActivite = demande.donnees.numeroActe || `ACT-${Date.now()}`;

                const acteData = {
                    ...demande.donnees,
                    numeroActe: numeroActivite,
                    creePar: req.user.id
                };

                switch (demande.type) {
                    case 'naissance':
                        acte = await Naissance.create(acteData);
                        break;
                    case 'mariage':
                        acte = await Mariage.create(acteData);
                        break;
                    case 'deces':
                        acte = await Deces.create(acteData);
                        break;
                    default:
                        throw new Error(`Type d'acte inconnu: ${demande.type}`);
                }

                if (!acte || !acte.id) {
                    throw new Error("L'acte n'a pas pu être créé (ID manquant)");
                }

                acteId = acte.id;
                console.log(`✅ Acte ${demande.type} créé avec Succès: ${acteId}`);
            } catch (error) {
                console.error('❌ Erreur critique lors de la création de l\'acte:', error);
                return res.status(500).json({
                    success: false,
                    message: "Erreur lors de la génération de l'acte officiel. Veuillez réessayer ou contacter le support.",
                    error: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
        }

        // Mettre à jour le statut de la demande
        const demandeUpdated = await Demande.updateStatut(
            req.params.id,
            statut,
            { acteId, motifRejet }
        );

        // NOTIFICATION IN-APP AU CITOYEN (Async)
        try {
            await Notification.create({
                userId: demande.userId,
                title: statut === 'acceptee' ? 'Demande Acceptée' : 'Demande Rejetée',
                message: statut === 'acceptee'
                    ? `Votre demande de ${demande.type} a été validée officiellement.`
                    : `Votre demande de ${demande.type} a été rejetée. Motif: ${motifRejet || 'Non spécifié'}`,
                type: statut === 'acceptee' ? 'success' : 'danger',
                link: '/mes-demandes'
            });
        } catch (notifErr) {
            console.error('Erreur notification citoyen:', notifErr);


        }

        // [AUDIT LOG] Enregistrer l'action de validation/rejet
        const logActionType = statut === 'acceptee' ? 'DEMANDE_ACCEPTED' : 'DEMANDE_REJECTED';
        const logDetails = {
            demandeId: req.params.id,
            type: demande.type,
            motif: motifRejet || 'N/A',
            acteId: acteId || 'N/A'
        };
        logAction(req, logActionType, logDetails);

        // ENVOI DE LA NOTIFICATION PAR EMAIL ET SMS (Async non bloquant)
        try {
            const citoyen = await User.findById(demande.userId);
            if (citoyen) {
                // [NEW] Notification PUSH
                if (citoyen.expoPushToken) {
                    const pushTitle = statut === 'acceptee' ? '✅ Demande Validée' : '❌ Demande Rejetée';
                    const pushBody = statut === 'acceptee'
                        ? `Votre demande de ${demande.type} a été validée.`
                        : `Votre demande a été rejetée: ${motifRejet || 'Aucun motif'}`;

                    await sendPushNotification(citoyen.expoPushToken, pushTitle, pushBody, { demandeId: req.params.id });
                }

                if (citoyen.email) {
                    if (statut === 'acceptee') {
                        emailService.sendNotificationValidation(
                            citoyen.email,
                            `${citoyen.prenom} ${citoyen.nom}`,
                            demande.type,
                            req.params.id
                        );
                    } else if (statut === 'rejetee') {
                        emailService.sendNotificationRejet(
                            citoyen.email,
                            `${citoyen.prenom} ${citoyen.nom}`,
                            demande.type,
                            motifRejet
                        );
                    }
                }

                // SMS SIMULATION
                if (citoyen.telephone) {
                    if (statut === 'acceptee') {
                        smsService.sendValidationSms(citoyen.telephone, demande.type, acteId || req.params.id);
                    } else if (statut === 'rejetee') {
                        smsService.sendRejetSms(citoyen.telephone, demande.type, motifRejet || 'Non spécifié');
                    }
                }
            }
        } catch (mailSmsErr) {
            console.error('⚠️ Échec de préparation de la notification (Email/SMS):', mailSmsErr);
        }

        res.status(200).json({
            success: true,
            message: `Demande ${statut === 'acceptee' ? 'acceptée' : 'rejetée'} avec succès`,
            data: demandeUpdated
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la mise à jour du statut',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Ajoute des documents à une demande
 * @route POST /api/demandes/:id/documents
 * @access Privé (Utilisateur propriétaire)
 */
const addDocuments = async (req, res) => {
    try {
        const { documentIds } = req.body;

        if (!documentIds || !Array.isArray(documentIds)) {
            return res.status(400).json({
                success: false,
                message: 'Les IDs des documents sont requis (tableau)'
            });
        }

        // Vérifier que la demande appartient à l'utilisateur
        const demande = await Demande.findById(req.params.id);

        if (!demande) {
            return res.status(404).json({
                success: false,
                message: 'Demande non trouvée'
            });
        }

        if (demande.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
        }

        const demandeUpdated = await Demande.addDocuments(req.params.id, documentIds);

        res.status(200).json({
            success: true,
            message: 'Documents ajoutés avec succès',
            data: demandeUpdated
        });

    } catch (error) {
        console.error('Erreur lors de l\'ajout de documents:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de l\'ajout de documents',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Récupère les statistiques des demandes
 * @route GET /api/demandes/stats
 * @access Privé (Admin)
 */
const getStatistics = async (req, res) => {
    try {
        const stats = await Demande.getStatistics();

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la récupération des statistiques',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Met à jour une demande (citoyen)
 * @route PATCH /api/demandes/:id
 * @access Privé (Utilisateur propriétaire)
 */
const updateDemande = async (req, res) => {
    try {
        const { donnees } = req.body;
        const demande = await Demande.findById(req.params.id);

        if (!demande) {
            return res.status(404).json({ success: false, message: 'Demande non trouvée' });
        }

        // Sécurité : propriétaire et statut 'en_attente'
        if (demande.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        if (demande.statut !== 'en_attente') {
            return res.status(400).json({ success: false, message: 'Seules les demandes en attente peuvent être modifiées' });
        }

        const updatedDemande = await Demande.update(req.params.id, { donnees });

        res.status(200).json({
            success: true,
            message: 'Demande mise à jour avec succès',
            data: updatedDemande
        });
    } catch (error) {
        console.error('Erreur updateDemande:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

/**
 * Supprime/Annule une demande (citoyen)
 * @route DELETE /api/demandes/:id
 * @access Privé (Utilisateur propriétaire)
 */
const deleteDemande = async (req, res) => {
    try {
        const demande = await Demande.findById(req.params.id);

        if (!demande) {
            return res.status(404).json({ success: false, message: 'Demande non trouvée' });
        }

        // Sécurité : propriétaire et statut 'en_attente'
        if (demande.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        if (demande.statut !== 'en_attente') {
            return res.status(400).json({ success: false, message: 'Seules les demandes en attente peuvent être annulées' });
        }

        await Demande.delete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Demande annulée avec succès'
        });
    } catch (error) {
        console.error('Erreur deleteDemande:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

module.exports = {
    createDemande,
    getMyDemandes,
    getAllDemandes,
    getDemandeById,
    updateDemandeStatut,
    addDocuments,
    getStatistics,
    updateDemande,
    deleteDemande
};
