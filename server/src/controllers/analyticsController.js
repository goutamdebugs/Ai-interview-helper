// src/controllers/analyticsController.js
const InterviewSession = require('../models/InterviewSession');

// @desc    Get user analytics
// @route   GET /api/analytics
// @access  Private
const getUserAnalytics = async (req, res) => {
    try {
        const interviews = await InterviewSession.find({ 
            user: req.user.id,
            status: 'completed' 
        });

        const totalInterviews = interviews.length;
        const totalQuestions = interviews.reduce((sum, session) => 
            sum + session.questions.length, 0);
        
        const averageScores = interviews.map(s => s.averageScore);
        const overallAvg = averageScores.length > 0 ? 
            averageScores.reduce((a, b) => a + b) / averageScores.length : 0;

        res.json({
            success: true,
            data: {
                totalInterviews,
                totalQuestions,
                overallAverageScore: overallAvg.toFixed(2),
                recentSessions: interviews.slice(0, 5).map(s => ({
                    id: s._id,
                    title: s.title,
                    date: s.completedAt,
                    score: s.averageScore.toFixed(2)
                }))
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = { getUserAnalytics };