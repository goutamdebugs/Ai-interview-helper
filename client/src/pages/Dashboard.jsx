// pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useInterview } from '../context/InterviewContext';
import Loader from '../components/Loader';
import ResultCard from '../components/ResultCard';
import { formatDate } from '../utils/validators';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    interviewHistory,
    analytics,
    loading,
    error,
    fetchInterviewHistory,
    fetchAnalytics,
    clearError,
  } = useInterview();

  const [filter, setFilter] = useState('all');
  const [sortedHistory, setSortedHistory] = useState([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Fetch data on mount
  useEffect(() => {
    fetchInterviewHistory();
    fetchAnalytics();
  }, []);

  // Sort and filter history
  useEffect(() => {
    if (interviewHistory) {
      let filtered = [...interviewHistory];
      
      // Apply filter
      if (filter !== 'all') {
        filtered = filtered.filter(session => session.status === filter);
      }
      
      // Sort by date (newest first)
      filtered.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
      
      setSortedHistory(filtered);
    }
  }, [interviewHistory, filter]);

  const handleResultClick = (sessionId) => {
    navigate(`/interview/${sessionId}`);
  };

  const handleStartInterview = () => {
    navigate('/interview');
  };

  if (loading && !analytics) {
    return (
      <div className="dashboard-loading">
        <Loader text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name}! Here's your interview performance overview.</p>
      </div>

      {error && (
        <div className="error-alert">
          <span>{error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      {/* Analytics Overview */}
      <div className="analytics-overview">
        <div className="analytics-card">
          <h3>Total Interviews</h3>
          <div className="analytics-value">
            {analytics?.totalInterviews || 0}
          </div>
          <div className="analytics-change positive">
            <span>+{analytics?.recentSessions?.length || 0} this week</span>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Average Score</h3>
          <div className="analytics-value">
            {analytics?.overallAverageScore || '0.0'}
          </div>
          <div className="analytics-change neutral">
            <span>/10</span>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Questions Answered</h3>
          <div className="analytics-value">
            {analytics?.totalQuestions || 0}
          </div>
          <div className="analytics-change positive">
            <span>Practice makes perfect</span>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Success Rate</h3>
          <div className="analytics-value">
            {analytics?.overallAverageScore >= 7 ? 'Good' : 'Needs Practice'}
          </div>
          <div className={`analytics-change ${analytics?.overallAverageScore >= 7 ? 'positive' : 'negative'}`}>
            <span>{analytics?.overallAverageScore >= 7 ? 'Keep it up!' : 'Keep practicing'}</span>
          </div>
        </div>
      </div>

      {/* Interview History */}
      <div className="history-section">
        <div className="history-header">
          <h2>Interview History</h2>
          <div className="history-filters">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Interviews</option>
              <option value="completed">Completed</option>
              <option value="active">Active</option>
            </select>
            <button
              onClick={handleStartInterview}
              className="start-interview-link"
            >
              Start New Interview
            </button>
          </div>
        </div>

        {sortedHistory.length === 0 ? (
          <div className="no-history">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
            </svg>
            <h3>No interviews yet</h3>
            <p>Start your first AI-powered interview practice session</p>
            <button
              onClick={handleStartInterview}
              className="start-interview-link"
            >
              Start Your First Interview
            </button>
          </div>
        ) : (
          <div className="history-list">
            {sortedHistory.map((session) => (
              <ResultCard
                key={session._id}
                result={session}
                onClick={() => handleResultClick(session._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Sessions */}
      {analytics?.recentSessions && analytics.recentSessions.length > 0 && (
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {analytics.recentSessions.map((session, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon interview">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div className="activity-content">
                  <div className="activity-title">
                    {session.title || 'Practice Interview'}
                  </div>
                  <div className="activity-time">
                    Completed on {formatDate(session.date)}
                    {' • '}Score: {session.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading for updates */}
      {loading && (
        <div className="loading-overlay">
          <Loader text="Updating..." />
        </div>
      )}
    </div>
  );
};

export default Dashboard;