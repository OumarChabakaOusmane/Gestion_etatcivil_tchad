const { db } = require('./config/firebase');
const User = require('./models/user.model');

async function checkRecentUsers() {
    try {
        console.log("Checking recent users...");
        const snapshot = await db.collection('users').orderBy('createdAt', 'desc').limit(5).get();
        snapshot.forEach(doc => {
            const u = doc.data();
            console.log(`- ${u.prenom} ${u.nom} (${u.email}) - Verified: ${u.isVerified} - CreatedAt: ${u.createdAt}`);
        });
    } catch (error) {
        console.error("ERROR checking users:", error);
    }
}

checkRecentUsers();
