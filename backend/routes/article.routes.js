const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const {
    createArticle,
    updateArticle,
    deleteArticle,
    getAllArticles,
    getArticleById
} = require('../controllers/article.controller');

// Routes Publiques
router.get('/', getAllArticles);
router.get('/:id', getArticleById);

// Routes Admin (Protégées)
router.post('/', authMiddleware, roleMiddleware('admin'), createArticle);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateArticle);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteArticle);

module.exports = router;
