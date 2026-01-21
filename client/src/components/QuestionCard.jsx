// components/QuestionCard.jsx
import React from 'react';
import { formatDate } from '../utils/validators';
import { QUESTION_TYPES, DIFFICULTY_LEVELS } from '../utils/constants';

const QuestionCard = ({ 
  question, 
  showAnswer = false,
  showFeedback = false,
  showScore = false,
  compact = false 
}) => {
  if (!question) return null;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case DIFFICULTY_LEVELS.EASY: return 'bg-green-100 text-green-800';
      case DIFFICULTY_LEVELS.MEDIUM: return 'bg-yellow-100 text-yellow-800';
      case DIFFICULTY_LEVELS.HARD: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case QUESTION_TYPES.TECHNICAL: return 'bg-blue-100 text-blue-800';
      case QUESTION_TYPES.BEHAVIORAL: return 'bg-purple-100 text-purple-800';
      case QUESTION_TYPES.RESUME_BASED: return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`question-card ${compact ? 'compact' : ''}`}>
      <div className="question-header">
        <div className="question-meta">
          {question.questionType && (
            <span className={`question-type ${getTypeColor(question.questionType)}`}>
              {question.questionType}
            </span>
          )}
          {question.difficulty && (
            <span className={`question-difficulty ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </span>
          )}
          {question.askedAt && (
            <span className="question-time">
              {formatDate(question.askedAt)}
            </span>
          )}
        </div>
        
        {showScore && question.score !== undefined && (
          <div className="question-score">
            <span className="score-label">Score:</span>
            <span className="score-value">{question.score.toFixed(1)}/10</span>
          </div>
        )}
      </div>
      
      <div className="question-content">
        <h3 className="question-text">{question.questionText}</h3>
        
        {showAnswer && question.answer && (
          <div className="answer-section">
            <h4 className="answer-label">Your Answer:</h4>
            <p className="answer-text">{question.answer}</p>
            {question.timeTaken && (
              <p className="answer-time">Time taken: {question.timeTaken} seconds</p>
            )}
          </div>
        )}
        
        {showFeedback && question.feedback && (
          <div className="feedback-section">
            <h4 className="feedback-label">AI Feedback:</h4>
            <p className="feedback-text">{question.feedback}</p>
            
            {question.strengths && question.strengths.length > 0 && (
              <div className="strengths-list">
                <h5>Strengths:</h5>
                <ul>
                  {question.strengths.map((strength, index) => (
                    <li key={index}>✓ {strength}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {question.improvements && question.improvements.length > 0 && (
              <div className="improvements-list">
                <h5>Areas for Improvement:</h5>
                <ul>
                  {question.improvements.map((improvement, index) => (
                    <li key={index}>● {improvement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;