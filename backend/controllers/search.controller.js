const { db } = require('../config/firebase');
const User = require('../models/user.model');
const Demande = require('../models/demande.model');

/**
 * Recherche globale pour la Command Palette Admin
 * @route GET /api/search?q=query
 */
const globalSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.status(200).json({ success: true, data: { users: [], demandes: [], actes: [] } });
        }

        const searchTerm = q.toLowerCase();

        // 1. Recherche Utilisateurs
        const allUsers = await User.findAll();
        const users = allUsers.filter(u =>
            (u.nom && u.nom.toLowerCase().includes(searchTerm)) ||
            (u.prenom && u.prenom.toLowerCase().includes(searchTerm)) ||
            (u.email && u.email.toLowerCase().includes(searchTerm)) ||
            (u.telephone && u.telephone.includes(searchTerm))
        ).slice(0, 5);

        // 2. Recherche Demandes
        const { demandes: allDemandes } = await Demande.findAll({ limit: 100 });
        const demandes = allDemandes.filter(d =>
            (d.type && d.type.toLowerCase().includes(searchTerm)) ||
            (d.statut && d.statut.toLowerCase().includes(searchTerm)) ||
            (d.id && d.id.toLowerCase().includes(searchTerm))
        ).slice(0, 5);

        // 3. Recherche Actes (Naissances, Mariages, Deces)
        // Note: Pour une recherche efficace, on parcourt les collections
        const actes = [];

        // Naissances
        const naissancesSnap = await db.collection('naissances').limit(50).get();
        naissancesSnap.docs.forEach(doc => {
            const data = doc.data();
            if (
                data.admin?.numeroActe?.includes(searchTerm) ||
                data.nomEnfant?.toLowerCase().includes(searchTerm) ||
                data.prenomEnfant?.toLowerCase().includes(searchTerm)
            ) {
                actes.push({ id: doc.id, type: 'naissance', label: `Acte Naissance: ${data.prenomEnfant} ${data.nomEnfant}`, numero: data.admin?.numeroActe });
            }
        });

        // Mariages
        const mariagesSnap = await db.collection('mariages').limit(50).get();
        mariagesSnap.docs.forEach(doc => {
            const data = doc.data();
            if (
                data.admin?.numeroActe?.includes(searchTerm) ||
                data.epoux?.nom?.toLowerCase().includes(searchTerm) ||
                data.epouse?.nom?.toLowerCase().includes(searchTerm)
            ) {
                actes.push({ id: doc.id, type: 'mariage', label: `Acte Mariage: ${data.epoux?.nom} & ${data.epouse?.nom}`, numero: data.admin?.numeroActe });
            }
        });

        // Deces
        const decesSnap = await db.collection('deces').limit(50).get();
        decesSnap.docs.forEach(doc => {
            const data = doc.data();
            if (
                data.admin?.numeroActe?.includes(searchTerm) ||
                data.defunt?.nom?.toLowerCase().includes(searchTerm)
            ) {
                actes.push({ id: doc.id, type: 'deces', label: `Acte Décès: ${data.defunt?.nom} ${data.defunt?.prenom || ''}`, numero: data.admin?.numeroActe });
            }
        });

        res.status(200).json({
            success: true,
            data: {
                users,
                demandes,
                actes: actes.slice(0, 5)
            }
        });

    } catch (error) {
        console.error('Erreur globalSearch:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la recherche' });
    }
};

module.exports = { globalSearch };
