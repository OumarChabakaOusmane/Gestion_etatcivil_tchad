const { db } = require('../config/firebase');

class Article {
    constructor(data) {
        this.collection = db.collection('articles');
    }

    static async create(data) {
        try {
            const article = {
                title: data.title,
                content: data.content,
                summary: data.summary,
                image: data.image || null,
                category: data.category || 'Général',
                isPublished: data.isPublished === true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const docRef = await db.collection('articles').add(article);
            return { id: docRef.id, ...article };
        } catch (error) {
            throw error;
        }
    }

    static async update(id, data) {
        try {
            const updateData = {
                ...data,
                updatedAt: new Date().toISOString()
            };
            await db.collection('articles').doc(id).update(updateData);
            return { id, ...updateData };
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            await db.collection('articles').doc(id).delete();
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const doc = await db.collection('articles').doc(id).get();
            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            throw error;
        }
    }

    static async findAll(filters = {}) {
        try {
            let query = db.collection('articles');

            if (filters.isPublished !== undefined) {
                query = query.where('isPublished', '==', filters.isPublished);
            }

            if (filters.category) {
                query = query.where('category', '==', filters.category);
            }

            const snapshot = await query.get();
            let articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Tri en mémoire pour éviter l'erreur d'index manquant sur Firestore
            articles.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA; // Décroissant
            });

            return articles;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Article;
