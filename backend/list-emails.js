const { db } = require('./config/firebase');

async function listAllEmails() {
    try {
        const snapshot = await db.collection('users').get();
        console.log("Total users:", snapshot.size);
        snapshot.forEach(doc => {
            console.log(`- ${doc.data().email}`);
        });
    } catch (error) {
        console.error(error);
    }
}

listAllEmails();
