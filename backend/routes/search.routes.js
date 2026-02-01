const express = require('express');
const router = express.Router();
const { globalSearch } = require('../controllers/search.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Routes de recherche (Admin uniquement)
router.get('/', authMiddleware, roleMiddleware('admin'), globalSearch);

module.exports = router;
