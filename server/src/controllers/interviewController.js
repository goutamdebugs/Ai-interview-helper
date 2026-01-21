// src/controllers/interviewController.js
const InterviewSession = require('../models/InterviewSession');
const QuestionBank = require('../models/QuestionBank');

// @desc    Start new interview
// @route   POST /api/interview/start
// @access  Private
const startInterview = async (req, res) => {
    try {
        const { jobRole, resumeText } = req.body;
        
        const interview = await InterviewSession.create({
            user: req.user.id,
            jobRole: jobRole || 'Software Developer',
            resumeText: resumeText || '',
            status: 'active'
        });

        res.status(201).json({
            success: true,
            message: 'Interview session started',
            data: interview
        });
    } catch (error) {
        console.error('Start interview error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get next question
// @route   GET /api/interview/question/:sessionId
// @access  Private
const getQuestion = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const session = await InterviewSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Check if session belongs to user
        if (session.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // For now, return a hardcoded question (later integrate AI)
        const questions = [
            "Explain the concept of closures in JavaScript with an example.",
            "What are the differences between let, const, and var?",
            "How does React's virtual DOM work?",
            "Explain the REST API principles.",
            "What is the event loop in Node.js?",
            "Describe your experience with database optimization."
        ];

        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        
        // Add question to session
        session.questions.push({
            questionText: randomQuestion,
            questionType: 'technical',
            difficulty: 'medium'
        });
        
        await session.save();

        const currentQuestion = session.questions[session.questions.length - 1];

        res.json({
            success: true,
            data: {
                sessionId: session._id,
                question: currentQuestion,
                questionNumber: session.questions.length,
                totalQuestions: session.questions.length
            }
        });
    } catch (error) {
        console.error('Get question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Submit answer
// @route   POST /api/interview/submit/:sessionId/:questionId
// @access  Private
const submitAnswer = async (req, res) => {
    try {
        const { sessionId, questionId } = req.params;
        const { answer, timeTaken } = req.body;

        const session = await InterviewSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Check authorization
        if (session.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Find the question
        const question = session.questions.id(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Update answer and score
        question.answer = answer;
        question.timeTaken = timeTaken || 0;
        question.answeredAt = Date.now();
        
        // Simple scoring (you'll replace with AI later)
        const score = Math.floor(Math.random() * 5) + 6; // Random 6-10
        question.score = score;
        question.feedback = `Good answer. Score: ${score}/10`;

        // Update session scores
        const totalScore = session.questions.reduce((sum, q) => sum + q.score, 0);
        session.totalScore = totalScore;
        session.averageScore = totalScore / session.questions.length;

        await session.save();

        res.json({
            success: true,
            message: 'Answer submitted',
            data: {
                score: question.score,
                feedback: question.feedback,
                averageScore: session.averageScore.toFixed(2)
            }
        });
    } catch (error) {
        console.error('Submit answer error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    End interview
// @route   PUT /api/interview/end/:sessionId
// @access  Private
const endInterview = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await InterviewSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        if (session.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        session.status = 'completed';
        session.completedAt = Date.now();
        session.duration = Math.floor((session.completedAt - session.startedAt) / 60000); // minutes

        // Generate simple feedback
        const scores = session.questions.map(q => q.score);
        const avgScore = scores.length > 0 ? 
            scores.reduce((a, b) => a + b) / scores.length : 0;
        
        session.strengths = avgScore >= 7 ? 
            ['Good technical knowledge', 'Clear communication'] : 
            ['Willingness to learn'];
        
        session.weaknesses = avgScore < 7 ? 
            ['Need more practice with coding concepts', 'Improve explanation structure'] : 
            ['Could provide more detailed examples'];

        await session.save();

        res.json({
            success: true,
            message: 'Interview completed',
            data: session
        });
    } catch (error) {
        console.error('End interview error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get interview history
// @route   GET /api/interview/history
// @access  Private
const getInterviewHistory = async (req, res) => {
    try {
        const interviews = await InterviewSession.find({ 
            user: req.user.id 
        })
        .sort({ startedAt: -1 })
        .select('title jobRole status startedAt completedAt averageScore duration');

        res.json({
            success: true,
            count: interviews.length,
            data: interviews
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get interview details
// @route   GET /api/interview/:sessionId
// @access  Private
const getInterviewDetails = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const interview = await InterviewSession.findOne({
            _id: sessionId,
            user: req.user.id
        }).populate('user', 'name email');

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
        }

        res.json({
            success: true,
            data: interview
        });
    } catch (error) {
        console.error('Get details error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    startInterview,
    getQuestion,
    submitAnswer,
    endInterview,
    getInterviewHistory,
    getInterviewDetails
};