const InterviewSession = require('../models/InterviewSession');
const ResumeParser = require('../services/resumeParser');
const AIEngine = require('../services/aiEngine');
const upload = require('../middlewares/uploadMiddleware');
const fs = require('fs').promises;

// @desc    Start interview with PDF resume
// @route   POST /api/interview/start
// @access  Private
const startInterview = async (req, res) => {
    try {
        // Handle file upload
        upload.single('resume')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ success: false, message: err.message });
            }

            const { jobRole } = req.body;
            let resumeText = '';
            
            // If PDF file uploaded
            if (req.file) {
                try {
                    const parsedResume = await ResumeParser.parsePDF(req.file.path);
                    resumeText = parsedResume.summary || parsedResume.rawText.substring(0, 1000);
                    await fs.unlink(req.file.path).catch(() => {}); // Clean up
                } catch (parseError) {
                    return res.status(400).json({ success: false, message: 'Failed to parse PDF' });
                }
            } else if (req.body.resumeText) {
                resumeText = req.body.resumeText;
            }
            
            const interview = await InterviewSession.create({
                user: req.user.id,
                jobRole: jobRole || 'Software Developer',
                resumeText: resumeText,
                status: 'active'
            });

            // Generate first question
            const firstQuestion = await AIEngine.generateQuestionFromResume(
                resumeText, 
                jobRole || 'Software Developer'
            );
            
            interview.questions.push({
                questionText: firstQuestion,
                questionType: 'technical',
                difficulty: 'medium'
            });
            
            await interview.save();

            res.status(201).json({
                success: true,
                message: 'Interview started',
                data: {
                    sessionId: interview._id,
                    question: interview.questions[0],
                    resumeSummary: resumeText.substring(0, 200) + '...'
                }
            });
        });
        
    } catch (error) {
        console.error('Start interview error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Submit answer with AI evaluation
// @route   POST /api/interview/submit/:sessionId/:questionId
// @access  Private
const submitAnswer = async (req, res) => {
    try {
        const { sessionId, questionId } = req.params;
        const { answer, timeTaken } = req.body;

        const session = await InterviewSession.findById(sessionId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
        if (session.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

        const question = session.questions.id(questionId);
        if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

        // Update answer
        question.answer = answer;
        question.timeTaken = timeTaken || 0;
        question.answeredAt = Date.now();

        // AI Evaluation
        const evaluation = await AIEngine.evaluateAnswer(question.questionText, answer, session.resumeText);

        question.score = evaluation.score;
        question.feedback = evaluation.feedback;
        question.strengths = evaluation.strengths;
        question.improvements = evaluation.improvements;

        // Update Stats
        const totalScore = session.questions.reduce((sum, q) => sum + (q.score || 0), 0);
        session.totalScore = totalScore;
        session.averageScore = session.questions.length > 0 ? totalScore / session.questions.length : 0;

        await session.save();

        res.json({
            success: true,
            message: 'Answer evaluated',
            data: {
                score: question.score,
                feedback: question.feedback,
                averageScore: session.averageScore.toFixed(2)
            }
        });
    } catch (error) {
        console.error('Submit answer error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get next AI question
// @route   GET /api/interview/next/:sessionId
// @access  Private
const getNextQuestion = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await InterviewSession.findById(sessionId);
        
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
        if (session.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
        if (session.questions.length >= 10) return res.status(400).json({ success: false, message: 'Max questions reached' });

        // Generate Next Question
        const previousQuestions = session.questions.map(q => q.questionText).join(' | ');
        const nextQuestion = await AIEngine.generateQuestionFromResume(
            session.resumeText + " Previous questions: " + previousQuestions,
            session.jobRole
        );

        session.questions.push({
            questionText: nextQuestion,
            questionType: 'technical',
            difficulty: 'medium'
        });
        
        await session.save();
        
        res.json({
            success: true,
            data: {
                question: session.questions[session.questions.length - 1],
                questionNumber: session.questions.length,
                totalQuestions: 10,
                sessionId: session._id
            }
        });
    } catch (error) {
        console.error('Get next question error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    End Interview & Calculate Result
// @route   PUT /api/interview/end/:sessionId
// @access  Private
const endInterview = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await InterviewSession.findById(sessionId);

        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
        if (session.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

        session.status = 'completed';
        session.completedAt = Date.now();
        
        // Simple Logic for Strengths/Weaknesses based on average score
        if (session.averageScore >= 7) {
            session.strengths.push("Strong Technical Understanding", "Good Articulation");
        } else {
            session.weaknesses.push("Needs more practice", "Concepts need clarity");
        }

        await session.save();

        res.json({ success: true, message: 'Interview completed', data: session });
    } catch (error) {
        console.error('End interview error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get All Past Interviews
// @route   GET /api/interview/history
// @access  Private
const getInterviewHistory = async (req, res) => {
    try {
        const interviews = await InterviewSession.find({ user: req.user.id })
            .sort({ startedAt: -1 })
            .select('jobRole status startedAt averageScore');

        res.json({ success: true, count: interviews.length, data: interviews });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get Single Interview Details
// @route   GET /api/interview/:sessionId
// @access  Private
const getInterviewDetails = async (req, res) => {
    try {
        const session = await InterviewSession.findOne({ 
            _id: req.params.sessionId, 
            user: req.user.id 
        });

        if (!session) return res.status(404).json({ success: false, message: 'Not found' });

        res.json({ success: true, data: session });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// EXPORTS
module.exports = {
    startInterview,
    submitAnswer,
    getNextQuestion,
    endInterview,        // Defined now!
    getInterviewHistory, // Defined now!
    getInterviewDetails  // Defined now!
};