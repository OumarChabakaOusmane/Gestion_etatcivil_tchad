const Contact = require("../models/contact.model");
const emailService = require("../services/emailService");

exports.submitContact = async (req, res) => {
    try {
        const { nom, email, sujet, message } = req.body;

        if (!nom || !email || !sujet || !message) {
            return res.status(400).json({
                success: false,
                message: "Tous les champs sont obligatoires"
            });
        }

        const newContact = await Contact.create({ nom, email, sujet, message });

        res.status(201).json({
            success: true,
            message: "Message envoyé avec succès",
            data: newContact
        });
    } catch (error) {
        console.error("Error in submitContact:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de l'envoi du message"
        });
    }
};

exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.getAll();
        res.status(200).json({
            success: true,
            data: contacts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des messages"
        });
    }
};

exports.replyToContact = async (req, res) => {
    try {
        const { contactId, replyContent } = req.body;

        if (!contactId || !replyContent) {
            return res.status(400).json({
                success: false,
                message: "ID du contact et contenu de la réponse sont requis"
            });
        }

        // Get contact details
        const contact = await Contact.getById(contactId);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Message introuvable"
            });
        }

        // Send email
        const subject = `Réponse à votre message : ${contact.sujet}`;
        const htmlContent = `
            <h2 style="color: #001a41; margin-top: 0;">Réponse de l'administration</h2>
            <p>Bonjour <strong>${contact.nom}</strong>,</p>
            <p>Nous faisons suite à votre message concernant "<em>${contact.sujet}</em>" reçu le ${new Date(contact.createdAt).toLocaleDateString('fr-FR')}.</p>
            
            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 12px; border-left: 4px solid #001a41; margin: 25px 0; color: #333; line-height: 1.6;">
                ${replyContent.replace(/\n/g, '<br>')}
            </div>
            
            <p style="font-size: 14px; color: #666;">Si vous avez d'autres questions, n'hésitez pas à nous contacter à nouveau.</p>
        `;

        const emailSent = await emailService.sendEmail(contact.email, subject, emailService.wrapTemplate(htmlContent));

        if (!emailSent) {
            throw new Error("Échec de l'envoi de l'email");
        }

        // Update status in DB
        await Contact.updateStatut(contactId, 'repondu');

        res.status(200).json({
            success: true,
            message: "Réponse envoyée avec succès"
        });
    } catch (error) {
        console.error("Error in replyToContact:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de l'envoi de la réponse"
        });
    }
};
