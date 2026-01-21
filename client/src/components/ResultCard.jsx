// components/ResultCard.jsx
import React from 'react';
import { getScoreColor, formatDate, calculateDuration } from '../utils/validators';
import { SCORE_RANGES } from '../utils/constants';

const ResultCard = ({ result, onClick }) => {
  if (!result) return null;

  const getScoreRange = (score) => {
    if (score >= SCORE_RANGES.EXCELLENT.min) return SCORE_RANGES.EXCELLENT;
    if (score >= SCORE_RANGES.GOOD.min) return SCORE_RANGES.GOOD;
    if (score >= SCORE_RANGES.AVERAGE.min) return SCORE_RANGES.AVERAGE;
    return SCORE_RANGES.NEEDS_IMPROVEMENT;
  };

  const scoreRange = getScoreRange(result.averageScore || 0);
  const scoreColor = getScoreColor(result.averageScore || 0);

  return (
    <div 
      className={`result-card ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="result-header">
        <div className="result-title-section">
          <h3 className="result-title">{result.title || 'Practice Interview'}</h3>
          <p className="result-job-role">{result.jobRole || 'Software Developer'}</p>
        </div>
        
        <div className="result-score" style={{ color: scoreColor }}>
          <span className="score-value">{(result.averageScore || 0).toFixed(1)}</span>
          <span className="score-label">/10</span>
        </div>
      </div>
      
      <div className="result-details">
        <div className="detail-item">
          <span className="detail-label">Status:</span>
          <span className={`detail-value status-${result.status}`}>
            {result.status}
          </span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Questions:</span>
          <span className="detail-value">
            {result.questions?.length || 0}
          </span>
        </div>
        
        {result.startedAt && (
          <div className="detail-item">
            <span className="detail-label">Started:</span>
            <span className="detail-value">
              {formatDate(result.startedAt)}
            </span>
          </div>
        )}
        
        {result.completedAt && (
          <div className="detail-item">
            <span className="detail-label">Duration:</span>
            <span className="detail-value">
              {calculateDuration(result.startedAt, result.completedAt)}
            </span>
          </div>
        )}
      </div>
      
      <div className="result-footer">
        <div className="score-range">
          <span className="range-label" style={{ color: scoreRange.color }}>
            {scoreRange.label}
          </span>
        </div>
        
        {result.strengths && result.strengths.length > 0 && (
          <div className="strengths-preview">
            <span className="preview-label">Top Strength: </span>
            <span className="preview-value">{result.strengths[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;