import * as XLSX from 'xlsx';

/**
 * Utilitaires pour l'exportation de données
 */
const exportHelper = {
    /**
     * Exporte un tableau d'objets vers un fichier Excel (.xlsx)
     * @param {Array} data - Les données à exporter
     * @param {string} fileName - Nom du fichier (sans extension)
     * @param {string} sheetName - Nom de la feuille Excel
     */
    exportToExcel(data, fileName = 'export', sheetName = 'Data') {
        try {
            // Création d'une nouvelle feuille de calcul
            const worksheet = XLSX.utils.json_to_sheet(data);

            // Création d'un nouveau classeur
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

            // Génération du fichier et déclenchement du téléchargement
            XLSX.writeFile(workbook, `${fileName}_${new Date().getTime()}.xlsx`);

            return true;
        } catch (error) {
            console.error('Erreur lors de l\'exportation Excel:', error);
            return false;
        }
    },

    /**
     * Prépare les données de demandes pour l'export
     * @param {Array} demandes - Liste des demandes brutes
     */
    formatDemandesForExport(demandes) {
        return demandes.map(d => ({
            'ID': d.id,
            'Date': new Date(d.createdAt).toLocaleDateString('fr-FR'),
            'Type': d.type === 'naissance' ? 'Naissance' : d.type === 'mariage' ? 'Mariage' : 'Décès',
            'Citoyen': d.userId?.prenom ? `${d.userId.prenom} ${d.userId.nom}` : 'N/A',
            'Email Citoyen': d.userId?.email || 'N/A',
            'Statut': d.statut === 'en_attente' ? 'En attente' : d.statut === 'acceptee' ? 'Acceptée' : 'Rejetée',
            'Acte ID': d.acteId || 'Non généré'
        }));
    },

    /**
     * Prépare les données d'utilisateurs pour l'export
     * @param {Array} users - Liste des utilisateurs bruts
     */
    formatUsersForExport(users) {
        return users.map(u => ({
            'ID': u.id,
            'Prénom': u.prenom,
            'Nom': u.nom,
            'Email': u.email,
            'Téléphone': u.telephone || 'N/A',
            'Rôle': u.role === 'admin' ? 'Administrateur' : 'Citoyen',
            'Date d\'inscription': new Date(u.createdAt).toLocaleDateString('fr-FR')
        }));
    }
};

export default exportHelper;
