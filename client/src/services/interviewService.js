// services/interviewService.js
import API from './api';

export const interviewService = {
  // Start new interview session
  startInterview: async (formData) => {
    try {
      const response = await API.post('/api/interview/start', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get next question
  getNextQuestion: async (sessionId) => {
    try {
      const response = await API.get(`/api/interview/next/${sessionId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Submit answer
  submitAnswer: async (sessionId, questionId, answerData) => {
    try {
      const response = await API.post(
        `/api/interview/submit/${sessionId}/${questionId}`,
        answerData
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // End interview session
  endInterview: async (sessionId) => {
    try {
      const response = await API.put(`/api/interview/end/${sessionId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get interview history
  getInterviewHistory: async () => {
    try {
      const response = await API.get('/api/interview/history');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get interview details
  getInterviewDetails: async (sessionId) => {
    try {
      const response = await API.get(`/api/interview/${sessionId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get analytics
  getAnalytics: async () => {
    try {
      const response = await API.get('/api/analytics');
      return response;
    } catch (error) {
      throw error;
    }
  },
};