// pages/Interview.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useInterview } from '../context/InterviewContext';
import FileUpload from '../components/FileUpload';
import Loader from '../components/Loader';
import QuestionCard from '../components/QuestionCard';
import ResultCard from '../components/ResultCard';
import { validateAnswer } from '../utils/validators';
import '../styles/Interview.css';

const Interview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentSession,
    currentQuestion,
    loading,
    error,
    startInterview,
    getNextQuestion,
    submitAnswer,
    endInterview,
    clearError,
    clearCurrentInterview,
  } = useInterview();

  const [formData, setFormData] = useState({
    jobRole: 'Software Developer',
    resumeFile: null,
    resumeText: '',
  });
  const [answer, setAnswer] = useState('');
  const [answerError, setAnswerError] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Reset form when starting new interview
  useEffect(() => {
    if (!currentSession) {
      setShowFeedback(false);
      setAnswer('');
      setAnswerError('');
      setSessionEnded(false);
      setFinalResult(null);
    }
  }, [currentSession]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (file) => {
    setFormData(prev => ({
      ...prev,
      resumeFile: file,
    }));
  };

  const handleStartInterview = async () => {
    if (!formData.jobRole.trim()) {
      alert('Please enter a job role');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('jobRole', formData.jobRole);
    
    if (formData.resumeFile) {
      formDataToSend.append('resume', formData.resumeFile);
    } else if (formData.resumeText) {
      formDataToSend.append('resumeText', formData.resumeText);
    }

    const result = await startInterview(formDataToSend);
    if (result.success) {
      setShowFeedback(false);
      setAnswer('');
      setAnswerError('');
    }
  };

  const handleSubmitAnswer = async () => {
    const validation = validateAnswer(answer);
    if (!validation.isValid) {
      setAnswerError(validation.error);
      return;
    }

    setAnswerError('');
    const result = await submitAnswer(
      currentSession.sessionId,
      currentQuestion._id,
      answer,
      120 // Default time taken
    );

    if (result.success) {
      setShowFeedback(true);
    }
  };

  const handleNextQuestion = async () => {
    const result = await getNextQuestion(currentSession.sessionId);
    if (result.success) {
      setShowFeedback(false);
      setAnswer('');
      setAnswerError('');
    }
  };

  const handleEndInterview = async () => {
    if (window.confirm('Are you sure you want to end this interview? This action cannot be undone.')) {
      const result = await endInterview(currentSession.sessionId);
      if (result.success) {
        setSessionEnded(true);
        setFinalResult(result.data.data);
      }
    }
  };

  const handleStartNewInterview = () => {
    clearCurrentInterview();
    setSessionEnded(false);
    setFinalResult(null);
    setFormData({
      jobRole: 'Software Developer',
      resumeFile: null,
      resumeText: '',
    });
  };

  const handleViewResults = () => {
    navigate('/dashboard');
  };

  if (loading && !currentSession) {
    return (
      <div className="loading-overlay">
        <Loader text="Starting interview..." />
      </div>
    );
  }

  return (
    <div className="interview-container">
      <div className="interview-header">
        <h1>AI Interview Practice</h1>
        <div className="interview-stats">
          {currentSession && (
            <>
              <div className="stat-item">
                <div className="stat-value">{currentSession.questions?.length || 0}</div>
                <div className="stat-label">Questions</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {currentSession.averageScore ? currentSession.averageScore.toFixed(1) : '0.0'}
                </div>
                <div className="stat-label">Avg Score</div>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <span>{error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      {/* Start Interview Section */}
      {!currentSession && !sessionEnded && (
        <div className="start-interview-section">
          <h2>Start New Interview</h2>
          
          <div className="interview-form">
            <div className="form-group">
              <label htmlFor="jobRole">Target Job Role</label>
              <input
                type="text"
                id="jobRole"
                name="jobRole"
                value={formData.jobRole}
                onChange={handleFormChange}
                placeholder="e.g., Frontend Developer, Full Stack Engineer"
              />
            </div>

            <div className="form-group">
              <FileUpload
                onFileSelect={handleFileSelect}
                disabled={loading}
                label="Upload Resume (Optional)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="resumeText">
                Or paste your resume text (if you don't have a PDF)
              </label>
              <textarea
                id="resumeText"
                name="resumeText"
                value={formData.resumeText}
                onChange={handleFormChange}
                placeholder="Paste your resume text here..."
                rows={4}
              />
            </div>

            <button
              onClick={handleStartInterview}
              className="start-button"
              disabled={loading || !formData.jobRole.trim()}
            >
              {loading ? 'Starting...' : 'Start Interview'}
            </button>
          </div>
        </div>
      )}

      {/* Interview Session */}
      {currentSession && !sessionEnded && currentQuestion && (
        <div className="interview-session">
          <div className="session-header">
            <h2>Interview in Progress</h2>
            <div className="session-info">
              <div className="session-info-item">
                <div className="session-info-label">Question</div>
                <div className="session-info-value">
                  {currentSession.questions?.length || 0}/10
                </div>
              </div>
              <div className="session-info-item">
                <div className="session-info-label">Avg Score</div>
                <div className="session-info-value">
                  {currentSession.averageScore ? currentSession.averageScore.toFixed(1) : '0.0'}
                </div>
              </div>
            </div>
          </div>

          <div className="session-content">
            {/* Question Display */}
            <div className="question-display">
              <div className="question-number">
                Question {currentSession.questions?.length || 0}
              </div>
              <div className="question-text">
                {currentQuestion.questionText}
              </div>
            </div>

            {/* Answer Input */}
            {!showFeedback && (
              <div className="answer-input">
                <label htmlFor="answer">Your Answer</label>
                <textarea
                  id="answer"
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    if (answerError) setAnswerError('');
                  }}
                  placeholder="Type your answer here... (Minimum 10 characters)"
                  disabled={loading}
                />
                <div className="answer-actions">
                  <div className="answer-length">
                    {answer.length} characters
                  </div>
                  {answerError && (
                    <div className="error-message">{answerError}</div>
                  )}
                </div>
              </div>
            )}

            {/* Feedback Display */}
            {showFeedback && currentQuestion.feedback && (
              <div className="feedback-display">
                <div className="feedback-header">
                  <h3>AI Feedback</h3>
                  <div className="feedback-score">
                    {currentQuestion.score ? currentQuestion.score.toFixed(1) : '0.0'}/10
                  </div>
                </div>
                <div className="feedback-content">
                  <p>{currentQuestion.feedback}</p>
                  
                  {(currentQuestion.strengths?.length > 0 || currentQuestion.improvements?.length > 0) && (
                    <div className="feedback-details">
                      {currentQuestion.strengths?.length > 0 && (
                        <div className="feedback-section">
                          <h4>Strengths</h4>
                          <ul>
                            {currentQuestion.strengths.map((strength, index) => (
                              <li key={index}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {currentQuestion.improvements?.length > 0 && (
                        <div className="feedback-section">
                          <h4>Areas for Improvement</h4>
                          <ul>
                            {currentQuestion.improvements.map((improvement, index) => (
                              <li key={index}>{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              {!showFeedback ? (
                <button
                  onClick={handleSubmitAnswer}
                  className="action-button submit-button"
                  disabled={loading || !answer.trim()}
                >
                  {loading ? 'Submitting...' : 'Submit Answer'}
                </button>
              ) : currentSession.questions?.length < 10 ? (
                <button
                  onClick={handleNextQuestion}
                  className="action-button next-button"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Next Question'}
                </button>
              ) : null}
              
              <button
                onClick={handleEndInterview}
                className="action-button end-button"
                disabled={loading}
              >
                End Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Ended */}
      {sessionEnded && finalResult && (
        <div className="session-ended">
          <h2>Interview Completed!</h2>
          <p>Great job completing the interview. Here's your performance summary:</p>
          
          <div className="session-stats">
            <div className="session-stat">
              <div className="session-stat-value">
                {finalResult.averageScore ? finalResult.averageScore.toFixed(1) : '0.0'}
              </div>
              <div className="session-stat-label">Average Score</div>
            </div>
            
            <div className="session-stat">
              <div className="session-stat-value">
                {finalResult.questions?.length || 0}
              </div>
              <div className="session-stat-label">Questions Answered</div>
            </div>
            
            <div className="session-stat">
              <div className="session-stat-value">
                {finalResult.duration || 0} min
              </div>
              <div className="session-stat-label">Duration</div>
            </div>
          </div>

          <ResultCard result={finalResult} />

          <div className="session-actions">
            <button
              onClick={handleStartNewInterview}
              className="primary-button"
            >
              Start New Interview
            </button>
            <button
              onClick={handleViewResults}
              className="secondary-button"
            >
              View All Results
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <Loader text="Processing..." />
        </div>
      )}
    </div>
  );
};

export default Interview;