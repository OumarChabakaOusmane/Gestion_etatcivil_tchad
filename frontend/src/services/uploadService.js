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
    /**
     * Redimensionne et compresse une image avant conversion en Base64
     * pour garantir qu'elle loge dans Firestore (< 1MB)
     */
    async uploadImage(file, path = 'uploads') {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error("Aucun fichier fourni"));
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Redimensionner si trop grand (max 500px)
                    const MAX_SIZE = 500;
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Conversion en Base64 avec compression JPEG (qualité 0.7)
                    // Cela réduit considérablement la taille tout en gardant une photo nette
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

                    console.log(`📸 Image compressée : ${Math.round(compressedBase64.length / 1024)} Ko`);
                    resolve(compressedBase64);
                };

                img.onerror = (err) => {
                    console.error("Erreur chargement image pour compression", err);
                    reject(new Error("Impossible de lire l'image."));
                };
            };

            reader.onerror = (error) => {
                console.error("Erreur de lecture fichier:", error);
                reject(error);
            };
        });
    }
};

export default uploadService;
