const { db } = require("../config/firebase");

class Contact {
    static async create(contactData) {
        try {
            const newContact = {
                nom: contactData.nom,
                email: contactData.email,
                sujet: contactData.sujet,
                message: contactData.message,
                statut: 'nouveau', // 'nouveau', 'lu', 'repondu'
                createdAt: new Date().toISOString()
            };

            const docRef = await db.collection("contacts").add(newContact);
            return { id: docRef.id, ...newContact };
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const snapshot = await db.collection("contacts").orderBy("createdAt", "desc").get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw error;
        }
    }

    static async getById(id) {
        try {
            const doc = await db.collection("contacts").doc(id).get();
            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            throw error;
        }
    }

    static async updateStatut(id, statut) {
        try {
            await db.collection("contacts").doc(id).update({ statut });
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Contact;
