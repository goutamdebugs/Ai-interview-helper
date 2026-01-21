// client/src/pages/Interview.jsx
import React, { useState } from 'react';
import axios from 'axios';

const Interview = () => {
    const [file, setFile] = useState(null);
    const [jobRole, setJobRole] = useState('Software Developer');
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);

    // Start interview with PDF
    const handleStartInterview = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const formData = new FormData();
        if (file) {
            formData.append('resume', file);
        }
        formData.append('jobRole', jobRole);
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/interview/start', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            setSession(response.data.data);
            setCurrentQuestion(response.data.data.question);
            setLoading(false);
        } catch (error) {
            console.error('Start interview error:', error);
            setLoading(false);
            alert('Failed to start interview');
        }
    };

    // Submit answer
    const handleSubmitAnswer = async () => {
        if (!answer.trim() || !session || !currentQuestion) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `/api/interview/submit/${session.sessionId}/${currentQuestion._id}`,
                { answer, timeTaken: 120 },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            
            setFeedback(response.data.data);
            setAnswer('');
            setLoading(false);
            
            // Get next question
            await getNextQuestion();
            
        } catch (error) {
            console.error('Submit error:', error);
            setLoading(false);
        }
    };

    // Get next question
    const getNextQuestion = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `/api/interview/next/${session.sessionId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            
            setCurrentQuestion(response.data.data.question);
            setFeedback(null);
        } catch (error) {
            console.error('Next question error:', error);
        }
    };

    return (
        <div className="interview-container">
            {/* Upload Resume Section */}
            {!session && (
                <div className="upload-section">
                    <h2>Start AI Interview</h2>
                    <form onSubmit={handleStartInterview}>
                        <div className="form-group">
                            <label>Upload Resume (PDF)</label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Target Job Role</label>
                            <input
                                type="text"
                                value={jobRole}
                                onChange={(e) => setJobRole(e.target.value)}
                                placeholder="e.g., Frontend Developer"
                            />
                        </div>
                        
                        <button type="submit" disabled={loading}>
                            {loading ? 'Starting...' : 'Start Interview'}
                        </button>
                        
                        <p className="hint">
                            Or skip upload and type resume text in job role field
                        </p>
                    </form>
                </div>
            )}

            {/* Interview Session */}
            {session && currentQuestion && (
                <div className="interview-session">
                    <h3>Question {currentQuestion.questionNumber}/10</h3>
                    
                    <div className="question-card">
                        <h4>{currentQuestion.questionText}</h4>
                        <p>Type: {currentQuestion.questionType} | Difficulty: {currentQuestion.difficulty}</p>
                    </div>
                    
                    <div className="answer-section">
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Type your answer here..."
                            rows={6}
                        />
                        
                        <button 
                            onClick={handleSubmitAnswer}
                            disabled={loading || !answer.trim()}
                        >
                            {loading ? 'Submitting...' : 'Submit Answer'}
                        </button>
                    </div>
                    
                    {/* Feedback Display */}
                    {feedback && (
                        <div className="feedback-card">
                            <h4>AI Feedback</h4>
                            <p><strong>Score:</strong> {feedback.score}/10</p>
                            <p><strong>Feedback:</strong> {feedback.feedback}</p>
                            
                            {feedback.strengths && (
                                <div>
                                    <strong>Strengths:</strong>
                                    <ul>
                                        {feedback.strengths.map((s, i) => (
                                            <li key={i}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {feedback.improvements && (
                                <div>
                                    <strong>Improvements:</strong>
                                    <ul>
                                        {feedback.improvements.map((s, i) => (
                                            <li key={i}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Interview;