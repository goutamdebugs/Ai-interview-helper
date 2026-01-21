const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    startInterview,
    submitAnswer,
    getNextQuestion, 
    endInterview,
    getInterviewHistory,
    getInterviewDetails
} = require('../controllers/interviewController');

router.use(protect);

router.post('/start', startInterview);
router.get('/next/:sessionId', getNextQuestion);
router.post('/submit/:sessionId/:questionId', submitAnswer);
router.put('/end/:sessionId', endInterview);
router.get('/history', getInterviewHistory);
router.get('/:sessionId', getInterviewDetails);

module.exports = router;