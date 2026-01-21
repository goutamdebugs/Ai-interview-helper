// src/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getUserAnalytics } = require('../controllers/analyticsController');

router.use(protect);
router.get('/', getUserAnalytics);

module.exports = router;