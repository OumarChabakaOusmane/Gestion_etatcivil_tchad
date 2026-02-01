// import { storage } from '../config/firebase'; 
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const uploadService = {
    /**
     * Convertit une image en Base64 (Solution de secours sans Firebase Storage)
     * Cette méthode permet d'éviter les problèmes de CORS et de configuration du Storage
     * en enregistrant l'image directement dans la base de données.
     * 
     * @param {File} file - Le fichier image
     * @param {string} path - (Non utilisé en mode Base64)
     * @returns {Promise<string>} - La chaîne Base64 de l'image
     */
    async uploadImage(file, path = 'uploads') {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error("Aucun fichier fourni"));
                return;
            }

            // Vérification simple de la taille (Max ~700Ko pour Firestore)
            if (file.size > 700 * 1024) {
                reject(new Error("Image trop volumineuse. Choisissez une image de moins de 700Ko."));
                return;
            }

            console.log("Conversion de l'image en format texte (Base64)...");
            const reader = new FileReader();
            reader.readAsDataURL(file); // Convertit le fichier en chaîne de caractères

            reader.onload = () => {
                console.log("Conversion réussie !");
                resolve(reader.result); // Renvoie la chaîne "data:image/jpeg;base64,..."
            };

            reader.onerror = (error) => {
                console.error("Erreur de lecture fichier:", error);
                reject(error);
            };
        });
    }
};

export default uploadService;
