// context/InterviewContext.jsx
import React, { createContext, useState, useContext } from 'react';
import API from '../services/api';

// Create context
const InterviewContext = createContext();

// Provider component
export const InterviewProvider = ({ children }) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Start new interview
  const startInterview = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await API.post('/api/interview/start', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setCurrentSession(response.data.data);
      setCurrentQuestion(response.data.data.question);
      
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || 'Failed to start interview');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get next question
  const getNextQuestion = async (sessionId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await API.get(`/api/interview/next/${sessionId}`);
      
      setCurrentQuestion(response.data.data.question);
      
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || 'Failed to get next question');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Submit answer
  const submitAnswer = async (sessionId, questionId, answer, timeTaken) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await API.post(`/api/interview/submit/${sessionId}/${questionId}`, {
        answer,
        timeTaken,
      });
      
      // Update current question with feedback
      if (currentQuestion && currentQuestion._id === questionId) {
        setCurrentQuestion({
          ...currentQuestion,
          answer,
          feedback: response.data.data.feedback,
          score: response.data.data.score,
        });
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || 'Failed to submit answer');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // End interview
  const endInterview = async (sessionId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await API.put(`/api/interview/end/${sessionId}`);
      
      // Clear current session
      setCurrentSession(null);
      setCurrentQuestion(null);
      
      // Add to history
      setInterviewHistory(prev => [response.data.data, ...prev]);
      
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || 'Failed to end interview');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get interview history
  const fetchInterviewHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await API.get('/api/interview/history');
      
      setInterviewHistory(response.data.data);
      
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || 'Failed to fetch history');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get interview details
  const getInterviewDetails = async (sessionId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await API.get(`/api/interview/${sessionId}`);
      
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || 'Failed to fetch interview details');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get analytics
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await API.get('/api/analytics');
      
      setAnalytics(response.data.data);
      
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Clear current interview
  const clearCurrentInterview = () => {
    setCurrentSession(null);
    setCurrentQuestion(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Context value
  const value = {
    // State
    currentSession,
    currentQuestion,
    interviewHistory,
    analytics,
    loading,
    error,
    
    // Actions
    startInterview,
    getNextQuestion,
    submitAnswer,
    endInterview,
    fetchInterviewHistory,
    getInterviewDetails,
    fetchAnalytics,
    clearCurrentInterview,
    clearError,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};

// Custom hook to use interview context
export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};

export default InterviewContext;