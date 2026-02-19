const Article = require('../models/article.model');
const logAction = require('../utils/auditLogger');

/**
 * @desc    Créer un nouvel article
 * @route   POST /api/articles
 * @access  Private (Admin)
 */
const createArticle = async (req, res) => {
    try {
        const { title, content, summary, category, isPublished, image } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Le titre et le contenu sont requis'
            });
        }

        const newArticle = await Article.create({
            title,
            content,
            summary: summary || content.substring(0, 150) + '...',
            category,
            isPublished,
            image
        });

        // Audit Log
        logAction(req, 'ARTICLE_CREATED', { articleId: newArticle.id, title });

        res.status(201).json({
            success: true,
            data: newArticle,
            message: 'Article créé avec succès'
        });
    } catch (error) {
        console.error('Erreur createArticle:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'article',
            error: error.message // On renvoie l'erreur pour aider au diagnostic
        });
    }
};

/**
 * @desc    Mettre à jour un article
 * @route   PUT /api/articles/:id
 * @access  Private (Admin)
 */
const updateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        await Article.update(id, updates);

        // Audit Log
        logAction(req, 'ARTICLE_UPDATED', { articleId: id, updates: Object.keys(updates) });

        res.status(200).json({
            success: true,
            message: 'Article mis à jour avec succès'
        });
    } catch (error) {
        console.error('Erreur updateArticle:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'article'
        });
    }
};

/**
 * @desc    Supprimer un article
 * @route   DELETE /api/articles/:id
 * @access  Private (Admin)
 */
const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;

        await Article.delete(id);

        // Audit Log
        logAction(req, 'ARTICLE_DELETED', { articleId: id });

        res.status(200).json({
            success: true,
            message: 'Article supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur deleteArticle:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'article'
        });
    }
};

/**
 * @desc    Récupérer tous les articles
 * @route   GET /api/articles
 * @access  Public
 */
const getAllArticles = async (req, res) => {
    try {
        const { category, isAdmin } = req.query;

        const filters = {};
        if (category) filters.category = category;

        // Si ce n'est pas un appel admin, on ne renvoie que les publiés
        if (isAdmin !== 'true') {
            filters.isPublished = true;
        }

        const articles = await Article.findAll(filters);

        res.status(200).json({
            success: true,
            count: articles.length,
            data: articles
        });
    } catch (error) {
        console.error('Erreur getAllArticles:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des articles'
        });
    }
};

/**
 * @desc    Récupérer un article par son ID
 * @route   GET /api/articles/:id
 * @access  Public
 */
const getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Article non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: article
        });
    } catch (error) {
        console.error('Erreur getArticleById:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'article'
        });
    }
};

module.exports = {
    createArticle,
    updateArticle,
    deleteArticle,
    getAllArticles,
    getArticleById
};
