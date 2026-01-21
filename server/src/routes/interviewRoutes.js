// src/routes/interviewRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    startInterview,
    getQuestion,
    submitAnswer,
    endInterview,
    getInterviewHistory,
    getInterviewDetails
} = require('../controllers/interviewController');

// All routes are protected
router.use(protect);

// Interview flow
router.post('/start', startInterview);
router.get('/question/:sessionId', getQuestion);
router.post('/submit/:sessionId/:questionId', submitAnswer);
router.put('/end/:sessionId', endInterview);

// History & details
router.get('/history', getInterviewHistory);
router.get('/:sessionId', getInterviewDetails);

module.exports = router;