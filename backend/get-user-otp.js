require('dotenv').config();
const User = require('./models/user.model');

async function checkUser(email) {
    console.log(`--- Recherche de l'utilisateur : ${email} ---`);
    try {
        const user = await User.findByEmail(email);
        if (!user) {
            console.log("❌ Utilisateur non trouvé.");
            return;
        }

        console.log("✅ Utilisateur trouvé !");
        console.log("Nom:", user.nom);
        console.log("Prénom:", user.prenom);
        console.log("Vérifié:", user.isVerified ? "OUI" : "NON");
        console.log("Code OTP actuel:", user.otpCode || "AUCUN");
        console.log("Expiration OTP:", user.otpExpires ? new Date(user.otpExpires).toLocaleString() : "N/A");

        if (user.isVerified) {
            console.log("💡 Le compte est déjà vérifié, l'utilisateur peut se connecter.");
        } else {
            console.log(`\n👉 DONNEZ CE CODE À L'UTILISATEUR : ${user.otpCode}`);
        }
    } catch (error) {
        console.error("❌ Erreur lors de la recherche:", error);
    }
}

const targetEmail = "omahamatzenz@gmail.com";
checkUser(targetEmail);
